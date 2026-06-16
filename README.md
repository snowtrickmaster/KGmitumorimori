# 見積書作成アプリ（出演料）

出演料の見積書をブラウザ上で作成し、PDFとしてダウンロードできるWebアプリです。

## 使い方

1. `index.html` をブラウザで開く（またはGitHub Pagesで公開）
2. 左パネルから宛先・案件名・明細行を入力
3. 右側のプレビューでリアルタイム確認
4. 「PDFをダウンロード」ボタンでA4サイズのPDFを保存

## GitHub Pages で公開する方法

1. このリポジトリをGitHubにプッシュ
2. リポジトリの `Settings` → `Pages`
3. Branch を `main`、フォルダを `/ (root)` に設定して `Save`
4. しばらく待つと `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される

## ファイル構成

```
├── index.html   # メインHTML
├── style.css    # スタイル
├── app.js       # ロジック（行追加・プレビュー更新・PDF生成）
└── README.md
```

## 使用ライブラリ（CDN）

- [html2canvas](https://html2canvas.hertzen.com/) — プレビューをCanvasに変換
- [jsPDF](https://github.com/parallax/jsPDF) — PDF生成
