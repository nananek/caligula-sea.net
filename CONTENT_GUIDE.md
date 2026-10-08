# コンテンツの編集方法

サイトのコンテンツは `src/data/content.json` ファイルで管理されています。

## JSONファイルの構造

### プロフィール情報 (`profile`)

```json
"profile": {
  "name": "猫乃名無 (仮)",
  "nameRomaji": "Nekono Nana KAKKO KARI",
  "image": "画像のURL",
  "socialLinks": [...]
}
```

### ソーシャルリンク (`socialLinks`)

リンク型:
```json
{
  "name": "GitHub",
  "url": "https://github.com/nananek",
  "icon": "アイコンのURL",
  "type": "link"
}
```

モーダル型:
```json
{
  "name": "Discord",
  "icon": "アイコンのURL",
  "type": "modal",
  "modalId": "discord"
}
```

### モーダル設定 (`modals`)

```json
"modals": [
  {
    "id": "discord",
    "title": "Discord ID",
    "contentLabel": "discordID",
    "contentValue": "@nana_nekono",
    "copyButtonText": "コピー",
    "copyFeedbackText": "コピーしました！",
    "closeButtonLabel": "閉じる"
  }
]
```

- `id`: モーダルの識別子（socialLinksのmodalIdと一致させる）
- `title`: モーダルのタイトル
- `contentLabel`: コンテンツ要素のID
- `contentValue`: 表示する値
- `copyButtonText`: コピーボタンのテキスト
- `copyFeedbackText`: コピー成功時のメッセージ
- `closeButtonLabel`: 閉じるボタンのラベル

### お友達バナー (`friends`)

```json
"friends": [
  {
    "name": "サイト名",
    "url": "https://example.com/",
    "banner": "/banners/example.webp"
  }
]
```

### 自分のバナー (`banner`)

```json
"banner": {
  "src": "/banya-.png",
  "alt": "バナー",
  "height": "80px",
  "generate": {
    "enabled": true,
    "width": 1080,
    "height": 402,
    "mainText": "7743号室の\\nかりぐらし",
    "subText": "by Nekono Nana KAKKO KARI",
    "characterImage": "キャラクター画像のURL",
    "backgroundColor": "#e8f4f8",
    "textColor": "#000000",
    "subTextColor": "#555555",
    "mainFontSize": 80,
    "subFontSize": 36,
    "fontFamily": "sans-serif",
    "fontWeight": "900"
  }
}
```

- `src`: バナー画像のパス
- `alt`: 代替テキスト
- `height`: 表示時の高さ
- `generate`: バナー自動生成の設定
  - `enabled`: 自動生成を有効化 (true/false)
  - `width`: 画像の幅（ピクセル）
  - `height`: 画像の高さ（ピクセル）
  - `mainText`: メインテキスト（`\\n`で改行）
  - `subText`: サブテキスト
  - `characterImage`: 左側に表示するキャラクター画像のURL
  - `backgroundColor`: 背景色（16進数カラーコード）
  - `textColor`: メインテキストの色
  - `subTextColor`: サブテキストの色
  - `mainFontSize`: メインテキストのフォントサイズ（ピクセル）
  - `subFontSize`: サブテキストのフォントサイズ（ピクセル）
  - `fontFamily`: フォントファミリー
  - `fontWeight`: フォントの太さ（normal, bold, 900など）

**注意**: `generate.enabled`が`true`の場合、ビルド時に自動的にPNG画像が生成されます。

## コンテンツの追加・編集方法

1. `src/data/content.json` を開く
2. 追加したいセクションを編集
3. 保存すると自動的にサイトに反映されます

### 例: お友達を追加する場合

```json
"friends": [
  // 既存のお友達...
  {
    "name": "新しいお友達",
    "url": "https://newfriend.example.com/",
    "banner": "/banners/newfriend.png"
  }
]
```

### 例: 新しいモーダルを追加する場合

1. `modals` 配列に新しいモーダルを追加:
```json
"modals": [
  // 既存のモーダル...
  {
    "id": "email",
    "title": "Email Address",
    "contentLabel": "emailAddress",
    "contentValue": "example@example.com",
    "copyButtonText": "コピー",
    "copyFeedbackText": "コピーしました！",
    "closeButtonLabel": "閉じる"
  }
]
```

2. `socialLinks` にモーダルを開くボタンを追加:
```json
{
  "name": "Email",
  "icon": "/email-icon.png",
  "type": "modal",
  "modalId": "email"
}
```

**注意**: JSONの構文エラーに注意してください（カンマの位置、引用符など）
