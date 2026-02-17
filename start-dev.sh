#!/bin/bash

# 確定申告アシスタント - 開発サーバー起動スクリプト

echo "🚀 確定申告アシスタント - 開発サーバーを起動します..."
echo ""

# ディレクトリの確認
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# バックエンドの起動
echo "⚙️  バックエンドを起動中... (http://localhost:5000)"
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!

sleep 3

# フロントエンドの起動
echo "⚡ フロントエンドを起動中... (http://localhost:3000)"
cd ../frontend
npm install > /dev/null 2>&1
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ サーバーが起動しました！"
echo ""
echo "📱 フロントエンド: http://localhost:3000"
echo "⚙️  バックエンド:   http://localhost:5000"
echo ""
echo "終了するには Ctrl+C を押してください"
echo ""

# プロセスの監視
wait $BACKEND_PID $FRONTEND_PID
