# LINE Quiz Bot

社内ドキュメントを活用したLINE Botクイズシステムです。対話形式で知識を効率的に吸収することができます。

## 技術スタック

- Frontend/Backend: Next.js
- Database: Supabase
- Deployment: Vercel
- Messaging: LINE Messaging API

## 開発環境のセットアップ

1. リポジトリのクローン
```bash
git clone [repository-url]
cd line-quiz
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env.local`ファイルを作成し、以下の環境変数を設定してください：
- LINE_CHANNEL_ACCESS_TOKEN
- LINE_CHANNEL_SECRET
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL

4. 開発サーバーの起動
```bash
npm run dev
```

## プロジェクト構造

```
src/
├── app/                    # Next.js アプリケーションのメインディレクトリ
│   ├── api/               # API ルート
│   │   └── line/         # LINE Bot 関連のAPIエンドポイント
│   └── (routes)/         # その他のルート
├── components/            # 再利用可能なコンポーネント
│   ├── ui/               # 基本的なUIコンポーネント
│   └── features/         # 機能別コンポーネント
├── lib/                   # ユーティリティ関数や設定
│   ├── supabase/         # Supabase関連の設定と関数
│   └── line/             # LINE Bot関連の設定と関数
├── types/                 # TypeScript型定義
└── styles/               # グローバルスタイル
```

## デプロイメント

このプロジェクトはVercelにデプロイすることを想定しています。GitHubリポジトリとVercelを連携することで、自動デプロイが可能です。

## ライセンス

[ライセンス情報を記載]
