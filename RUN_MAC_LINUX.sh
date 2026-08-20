#!/bin/bash

echo "============================================"
echo "  🎮 Game Bundle Setup - Mac/Linux Version"
echo "============================================"
echo

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo "Please install from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found:"
node --version
echo

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies already installed!"
else
    echo "📦 Installing dependencies..."
    echo
    
    # Try npm install first
    echo "Attempt 1: npm install..."
    npm install --fetch-timeout=180000
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Installation successful!"
    else
        # If npm fails, try clearing cache
        echo ""
        echo "⚠️ npm failed, trying with clean cache..."
        npm cache clean --force
        npm install --prefer-offline
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Installation successful!"
        else
            # If still fails, try yarn
            echo ""
            echo "⚠️ Still failing. Trying yarn..."
            
            if command -v yarn &> /dev/null; then
                yarn install
                
                if [ $? -eq 0 ]; then
                    echo ""
                    echo "✅ Installation successful with yarn!"
                else
                    echo ""
                    echo "❌ All installation methods failed!"
                    echo ""
                    echo "POSSIBLE SOLUTIONS:"
                    echo "  1. Check your internet connection"
                    echo "  2. Try using a VPN"
                    echo "  3. Install yarn: npm install -g yarn"
                    echo "  4. Use Chinese mirror: npm install --registry=https://registry.npmmirror.com"
                    echo "  5. Try again later (npm servers might be down)"
                    exit 1
                fi
            else
                echo ""
                echo "❌ Please install yarn: npm install -g yarn"
                exit 1
            fi
        fi
    fi
fi

echo ""
echo "============================================"
echo "  🚀 Starting Game Server..."
echo "============================================"
echo ""
echo "The game will open at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
