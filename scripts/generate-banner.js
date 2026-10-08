#!/usr/bin/env node
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';
import https from 'https';

// fontconfig設定をsharp(librsvg)から見えるようにする
if (!process.env.FONTCONFIG_FILE && existsSync('/etc/fonts/fonts.conf')) {
  process.env.FONTCONFIG_FILE = '/etc/fonts/fonts.conf';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// content.jsonを読み込む
const contentPath = join(rootDir, 'src/data/content.json');
const content = JSON.parse(readFileSync(contentPath, 'utf-8'));

const bannerConfig = content.banner.generate;

if (!bannerConfig.enabled) {
  console.log('Banner generation is disabled.');
  process.exit(0);
}

// 画像をダウンロード
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const makeRequest = (urlStr) => {
      const protocol = urlStr.startsWith('https:') ? https : https;
      protocol.get(urlStr, (res) => {
        // リダイレクトに対応
        if (res.statusCode === 301 || res.statusCode === 302) {
          makeRequest(res.headers.location);
          return;
        }
        
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length === 0) {
            reject(new Error('Empty response'));
          } else {
            resolve(buffer);
          }
        });
        res.on('error', reject);
      }).on('error', reject);
    };
    
    makeRequest(url);
  });
}

async function generateBanner() {
  const { width, height, mainText, subText, characterImage, backgroundColor, 
          textColor, subTextColor, mainFontSize, subFontSize, fontFamily, fontWeight } = bannerConfig;

  // キャラクター画像をダウンロードして準備
  let characterBuffer;
  let characterComposite = null;
  let textStartX = 10; // デフォルトの左余白
  
  if (characterImage && characterImage.trim() !== '') {
    try {
      console.log('Downloading character image...');
      characterBuffer = await downloadImage(characterImage);
      
      // キャラクター画像のサイズを調整（左側に正方形で配置）
      const characterWidth = height; // 正方形
      
      if (characterBuffer && characterBuffer.length > 0) {
        try {
          characterComposite = await sharp(characterBuffer)
            .resize(characterWidth, height, { fit: 'cover', position: 'center' })
            .toBuffer();
          textStartX = characterWidth + 5; // キャラクターの右側、小さい余白
        } catch (err) {
          console.warn('Failed to process character image:', err.message);
        }
      }
    } catch (err) {
      console.error('Failed to download character image:', err.message);
    }
  }

  // テキスト部分のSVGを生成
  const lines = mainText.split('\\n');
  const lineHeight = mainFontSize * 1.1;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (height - totalTextHeight) / 2 + mainFontSize * 0.8;
  
  let textSvg = '';
  lines.forEach((line, index) => {
    const y = startY + (index * lineHeight);
    textSvg += `<text x="${textStartX}" y="${y}" font-family="${fontFamily}" font-size="${mainFontSize}" font-weight="${fontWeight}" fill="${textColor}">${line}</text>`;
  });

  // サブテキスト（右寄せ）
  let subTextSvg = '';
  if (subText && subText.trim() !== '') {
    const subTextY = startY + (lines.length * lineHeight) + 5;
    const rightMargin = 5;
    subTextSvg = `<text x="${width - rightMargin}" y="${subTextY}" font-family="${fontFamily}" font-size="${subFontSize}" fill="${subTextColor}" text-anchor="end">${subText}</text>`;
  }

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  ${textSvg}
  ${subTextSvg}
</svg>
  `.trim();

  // 背景+テキストのSVGを画像化
  const baseImage = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  // publicディレクトリを確保
  const publicDir = join(rootDir, 'public');
  try {
    mkdirSync(publicDir, { recursive: true });
  } catch (err) {
    // Already exists
  }

  const outputPath = join(publicDir, 'banya-.webp');

  // キャラクター画像を合成
  if (characterComposite) {
    await sharp(baseImage)
      .composite([{
        input: characterComposite,
        left: 0,
        top: 0
      }])
      .webp({ quality: 85 })
      .toFile(outputPath);
  } else {
    await sharp(baseImage)
      .webp({ quality: 85 })
      .toFile(outputPath);
  }

  console.log(`✅ Banner generated: ${outputPath} (${width}x${height})`);

  // favicon生成 (32x32 + apple-touch-icon 180x180)
  if (characterBuffer && characterBuffer.length > 0) {
    try {
      await sharp(characterBuffer)
        .resize(32, 32, { fit: 'cover', position: 'center' })
        .png()
        .toFile(join(publicDir, 'favicon.png'));
      console.log('✅ Favicon generated: favicon.png (32x32)');

      await sharp(characterBuffer)
        .resize(180, 180, { fit: 'cover', position: 'center' })
        .png()
        .toFile(join(publicDir, 'apple-touch-icon.png'));
      console.log('✅ Apple touch icon generated: apple-touch-icon.png (180x180)');
    } catch (err) {
      console.warn('⚠️ Failed to generate favicon:', err.message);
    }
  }

  // OGP画像生成 (1200x630)
  const ogpWidth = 1200;
  const ogpHeight = 630;
  const ogpAvatarSize = 280;
  const ogpPadding = 80;

  const ogpTextX = ogpPadding + ogpAvatarSize + 60;
  const ogpMainFontSize = 52;
  const ogpSubFontSize = 28;
  const ogpMainY = ogpHeight / 2 - 10;
  const ogpSubY = ogpMainY + 60;

  const ogpSvg = `
<svg width="${ogpWidth}" height="${ogpHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <text x="${ogpTextX}" y="${ogpMainY}" font-family="${fontFamily}" font-size="${ogpMainFontSize}" font-weight="${fontWeight}" fill="${textColor}">${mainText}</text>
  <text x="${ogpTextX}" y="${ogpSubY}" font-family="${fontFamily}" font-size="${ogpSubFontSize}" fill="${subTextColor}">${subText}</text>
</svg>
  `.trim();

  const ogpBase = await sharp(Buffer.from(ogpSvg)).png().toBuffer();
  const ogpOutputPath = join(publicDir, 'ogp.webp');

  if (characterComposite) {
    const ogpAvatar = await sharp(characterBuffer)
      .resize(ogpAvatarSize, ogpAvatarSize, { fit: 'cover', position: 'center' })
      .png()
      .toBuffer();

    await sharp(ogpBase)
      .composite([{
        input: ogpAvatar,
        left: ogpPadding,
        top: Math.round((ogpHeight - ogpAvatarSize) / 2)
      }])
      .webp({ quality: 85 })
      .toFile(ogpOutputPath);
  } else {
    await sharp(ogpBase).webp({ quality: 85 }).toFile(ogpOutputPath);
  }

  console.log(`✅ OGP image generated: ${ogpOutputPath} (${ogpWidth}x${ogpHeight})`);
}

generateBanner().then(() => {
  // NOTE: explicitly exit — keep-alive sockets from image download
  // can hold the event loop open forever
  process.exit(0);
}).catch((err) => {
  console.error('❌ Failed to generate banner:', err);
  process.exit(1);
});
