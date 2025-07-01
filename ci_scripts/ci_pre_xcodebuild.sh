#!/bin/sh

echo "🚀 Pre-Xcodebuild Script for KonfiQuest"
echo "Working directory: $(pwd)"
echo "Repository contents:"
ls -la

# Navigate to frontend directory
cd frontend

echo "📦 Installing Node dependencies..."
npm ci --no-audit --silent

echo "🔨 Building React app..."
npm run build

echo "🔄 Syncing Capacitor..."
npx cap sync ios --no-build

echo "📱 Installing CocoaPods..."
cd ios/App

# Clean previous installation
rm -rf Pods
rm -f Podfile.lock

# Install pods with verbose output
echo "Installing pods from: $(pwd)"
pod install --repo-update --verbose

# Verify installation
if [ -d "Pods" ]; then
    echo "✅ Pods directory created successfully"
    if [ -d "Pods/Target Support Files/Pods-App" ]; then
        echo "✅ Target Support Files found"
        ls -la "Pods/Target Support Files/Pods-App/"
    else
        echo "❌ Target Support Files missing"
        echo "Available Target Support Files:"
        ls -la "Pods/Target Support Files/" || echo "No Target Support Files directory"
    fi
else
    echo "❌ Pods installation failed"
    exit 1
fi

echo "✅ Pre-build setup completed successfully!"