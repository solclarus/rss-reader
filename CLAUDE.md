# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 web application for RSS feed aggregation called "rss-reader". The app allows users to input RSS URLs and displays a list of articles from those feeds. It uses React 19, TypeScript, and Tailwind CSS v4.

## Development Commands

### Core Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run Biome linting checks
- `npm run format` - Format code with Biome

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **Code Quality**: Biome for linting and formatting

### Project Structure
- `src/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with global styles
  - `page.tsx` - Home page component
- `src/styles/globals.css` - Global CSS with Tailwind imports and theme variables
- `public/` - Static assets

### Key Configuration
- TypeScript path mapping: `@/*` maps to `./src/*`
- Biome configured for React/Next.js with recommended rules
- Dark mode support via CSS custom properties and prefers-color-scheme
- Tailwind CSS v4 with inline theme configuration

## Development Notes

### RSS Feed Implementation
The application will need RSS parsing functionality. Consider using libraries like `rss-parser` or `fast-xml-parser` for RSS feed processing.

### State Management
Currently no state management library is configured. For RSS feed data, consider React's built-in state or add libraries like Zustand if complex state is needed.

### Styling Approach
Uses Tailwind CSS v4 with custom CSS properties for theming. The theme supports automatic dark mode switching based on user preferences.

## Commit Message Format

Use the following format for commit messages:

```
<gitmoji> <type>: <日本語での説明>

[optional body]
```

### Types with Gitmoji:
- `✨ feat`: 新機能追加
- `🐛 fix`: バグ修正  
- `♻️ refactor`: リファクタリング
- `💄 style`: スタイル・UI変更
- `⚡ perf`: パフォーマンス改善
- `📝 docs`: ドキュメント更新
- `✅ test`: テスト追加・修正
- `🔧 chore`: その他の変更

### Examples:
- `✨ feat: RSSフィードのタブ管理機能を追加`
- `🐛 fix: TabsTriggerのHydrationエラーを修正`
- `💄 style: コンポーネントのレイアウトと配色を更新`
- `♻️ refactor: プロジェクト名をfeed-matrixからrss-readerに変更`

## Branch Naming Format

Use the following format for branch names:

```
<type>/<brief-description-in-kebab-case>
```

### Examples:
- `feat/add-rss-feed-management`
- `fix/hydration-error-tabs-trigger`
- `style/update-layout-colors`
- `refactor/rename-project-to-rss-reader`

## Pull Request Format

Use the following format for pull requests (no AI signatures):

```
## Summary
- 変更の概要を簡潔に記述

## Changes
- 具体的な変更内容をリストアップ

## Test Plan
- テスト手順や確認項目
```