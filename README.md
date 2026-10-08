# 7743号室のかりぐらし

Astroで構築された静的サイトです。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:4321 を開いてサイトを確認できます。

**注意**: 初回起動時、アセットファイルは自動的に `public/` ディレクトリにコピーされます（`prebuild` および `predev` スクリプトで実行）。

### 3. ビルド

```bash
npm run build
```

ビルドされたファイルは `dist/` ディレクトリに生成されます。

### 4. プレビュー

ビルドしたサイトをローカルでプレビュー：

```bash
npm run preview
```

## デプロイ

GitHub Pagesで公開します。`main`ブランチへのpushで`.github/workflows/deploy.yml`がビルド・デプロイします。

## プロジェクト構造

```
/
├── public/           # 静的アセット（画像、sitemap等）
│   ├── banners/      # 友だちサイトのバナー画像
│   ├── banya-.png
│   ├── discord-logo.png
│   ├── matrix-logo.png
│   └── sitemap.xml
├── src/
│   └── pages/
│       └── index.astro  # メインページ
├── astro.config.mjs  # Astro設定ファイル
└── package.json
```

## npm scripts

- `npm run dev` - 開発サーバーを起動
- `npm run build` - 本番用にビルド
- `npm run preview` - ビルドしたサイトをプレビュー
