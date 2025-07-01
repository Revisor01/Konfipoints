#!/bin/sh
echo "🚀 Post-Clone Script for KonfiQuest"
cd frontend
npm ci --no-audit
npm run build
npx cap sync ios --no-build
cd ios/App && pod install --repo-update
echo "✅ Post-clone setup completed!"
