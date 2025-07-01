#!/bin/sh

echo "🚀 Pre-Xcodebuild Script for KonfiQuest"
echo "Working directory: $(pwd)"
echo "Contents: $(ls -la)"

# Navigate to frontend directory
cd frontend

echo "📦 Installing Node dependencies..."
npm ci --no-audit

echo "🔨 Building React app..."
npm run build

echo "🔄 Syncing Capacitor..."
npx cap sync ios --no-build

echo "📱 Installing CocoaPods..."
cd ios/App

# Clean previous pods
rm -rf Pods Podfile.lock

# Install pods
pod install --repo-update

echo "✅ Pre-build setup completed successfully!"
echo "Pods directory contents:"
ls -la Pods/Target\ Support\ Files/ || echo "Target Support Files not found"
