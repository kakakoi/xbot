# XBot - AI Twitter Bot

AIを使用して日本株に関するツイートを自動生成・投稿するボット

## 機能

- OpenRouter APIを使用したツイート生成
- 日本株の分析と予想
- 定期的な自動投稿（GitHub Actions）
- テストモード対応

## 必要要件

- Node.js 18以上
- npm
- Twitter Developer Account
- OpenRouter API Key

## セットアップ

1. 依存パッケージのインストール
```bash
npm install
```

2. 環境変数の設定
```bash
cp .env.example .env
# .envファイルを編集して各種APIキーを設定
```

## 使い方

### ツイートの生成と投稿

```bash
# 本番実行（実際にツイート）
npm run tweet

# テストモード（ツイートは生成するが投稿しない）
npm run tweet:test
```

### 開発用コマンド

```bash
# コードの整形
npm run format:fix

# リントチェック
npm run lint:fix

# テスト実行
npm run test

# 依存関係の分析
npm run deps:check
```

## GitHub Actions

### ワークフロー

- `ci.yml`: プルリクエスト時の自動テスト
- `tweet.yml`: 定期ツイート（毎日午前6時）

### 環境変数の設定

GitHubリポジトリの Settings → Secrets and variables → Actions で以下を設定：

#### Secrets
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET_KEY`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`
- `OPENROUTER_API_KEY`

#### Variables
- `OPENROUTER_MODEL`
- `OPENROUTER_TEMPERATURE`

## 開発ガイドライン

- `main`: 本番環境用ブランチ
- `development`: 開発用ブランチ
