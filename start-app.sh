#!/bin/bash

# Restaurant Rush - Start Script
echo "🍽️  Starting Restaurant Rush App..."

# Check if built files exist
if [ ! -f "dist/index.js" ] || [ ! -f "dist/public/index.html" ]; then
    echo "📦 Building application..."
    
    # Build frontend
    echo "🔨 Building frontend..."
    node node_modules/vite/bin/vite.js build
    
    # Build backend
    echo "🔨 Building backend..."
    node_modules/drizzle-kit/node_modules/esbuild/bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
fi

# Set environment variables
export PORT=${PORT:-5001}
export NODE_ENV=production

echo "🚀 Starting server on port $PORT..."
echo "📱 Open your browser to: http://localhost:$PORT"
echo ""
echo "API Endpoints available:"
echo "  📋 Restaurant Info: http://localhost:$PORT/api/restaurant"
echo "  🏷️  Categories: http://localhost:$PORT/api/categories?restaurantId=1"
echo "  🍽️  Menu Items: http://localhost:$PORT/api/menu-items?restaurantId=1"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
node dist/index.js