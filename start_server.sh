#!/bin/bash

# Socket.IO Server Startup Script for cPanel
# This script helps start the Socket.IO server with proper configuration

echo "🚀 Starting ReVision Socket.IO Server..."

# Set environment variables
export NODE_ENV=production
export PORT=3001
export ALLOWED_ORIGINS="*"

# Navigate to script directory
cd "$(dirname "$0")"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please rename package_cpanel.json to package.json"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    echo "🔄 Starting server with PM2..."
    pm2 start socket_server_cpanel.js --name revision-socket --env production
    pm2 save
    echo "✅ Server started with PM2"
    echo "📊 Check status: pm2 status"
    echo "📋 View logs: pm2 logs revision-socket"
else
    echo "🔄 Starting server directly..."
    echo "⚠️  Consider installing PM2 for production: npm install -g pm2"
    node socket_server_cpanel.js
fi

echo "🎉 Server startup complete!"
echo "🌐 Health check: https://ezrlab.com/vision/api/socket/health"
echo "📞 Active calls: https://ezrlab.com/vision/api/socket/calls"
