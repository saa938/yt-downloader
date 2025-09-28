#!/bin/bash

echo "🎬 Starting YouTube Downloader Application..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp is not installed. Installing..."
    sudo apt update && sudo apt install -y yt-dlp
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Installing..."
    sudo apt update && sudo apt install -y ffmpeg
fi

echo "✅ All dependencies are ready!"
echo ""

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the React app if needed
if [ ! -d "build" ]; then
    echo "🔨 Building React app..."
    npm run build
fi

echo "🚀 Starting servers..."
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Start both servers
npm run dev