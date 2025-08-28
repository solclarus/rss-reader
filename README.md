# RSS Reader

RSS フィードを複数のタブで管理できるモダンなWebアプリケーションです。

## 機能

- 📖 複数のRSSフィードを同時に表示
- 🔄 タブベースのフィード管理
- 📱 レスポンシブデザイン（PC・モバイル対応）
- 🌓 ダークモード切替
- 💾 ローカルストレージでの状態保存
- ⚡ 高速なローディングとスケルトン表示

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + React 19 + TypeScript
- **スタイリング**: Tailwind CSS v4
- **UI コンポーネント**: shadcn/ui
- **アニメーション**: motion/react
- **テーマ管理**: next-themes
- **RSS パース**: rss-parser
- **通知**: sonner
- **コード品質**: Biome

## はじめに

### 前提条件

- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/solclarus/rss-reader.git
cd rss-reader

# 依存関係をインストール
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてください。

### ビルド

```bash
# プロダクションビルド
npm run build

# プロダクションサーバー起動  
npm run start
```

## 使い方

1. **RSS フィード追加**: URLを入力してRSSフィードを追加
2. **タブ管理**: 複数のフィードをタブで切り替え
3. **記事閲覧**: 記事をクリックして元サイトを表示
4. **フィード更新**: 更新ボタンで最新記事を取得
5. **テーマ切替**: ダーク・ライトモード切替

## 開発

### コードフォーマット・リント

```bash
# Biome チェック実行
npm run lint

# Biome フォーマット実行
npm run format
```

### コミット規約

```bash
<gitmoji> <type>: <日本語での説明>
```

例：
- `✨ feat: 新機能を追加`
- `🐛 fix: バグを修正`
- `💄 style: UIを改善`

詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。

## ライセンス

MIT License

## 貢献

プルリクエストやIssueの投稿を歓迎します。[CLAUDE.md](./CLAUDE.md) の開発ガイドラインに沿ってコントリビューションしてください。