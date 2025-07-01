#!/bin/sh

echo "🚀 Starting Xcode Cloud Build for KonfiQuest"

# Xcode Cloud uses /Volumes/workspace/repository as base path
cd /Volumes/workspace/repository

# Set Node version
export NODE_VERSION=18
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    # Use Homebrew if available, otherwise use official installer
    if command -v brew &> /dev/null; then
        brew install node@18
        export PATH="/usr/local/opt/node@18/bin:$PATH"
    else
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install $NODE_VERSION
        nvm use $NODE_VERSION
    fi
fi

echo "📋 Node version: $(node --version)"
echo "📋 NPM version: $(npm --version)"

# Navigate to frontend directory
cd frontend

echo "📦 Installing frontend dependencies..."
npm ci --no-optional

echo "🔨 Building React app..."
npm run build

echo "🔄 Syncing Capacitor..."
npx cap sync ios --no-build

echo "📱 Installing iOS dependencies..."
cd ios/App

# Clean any existing pods
rm -rf Pods
rm -f Podfile.lock

# Install pods with verbose output for debugging
pod install --repo-update --verbose

echo "✅ Xcode Cloud build preparation completed!"

# Verify pods installation
if [ -d "Pods" ]; then
    echo "✅ Pods directory created successfully"
    ls -la Pods/Target\ Support\ Files/Pods-App/ || echo "⚠️ Target Support Files not found"
else
    echo "❌ Pods installation failed"
    exit 1
fi
