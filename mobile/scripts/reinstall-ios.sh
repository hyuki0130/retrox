cd /Users/nhn/Workspace/retrox/mobile

# 1. Clean everything
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/RetroX-*

# 2. Reinstall
npm install
cd ios && pod install --repo-update && cd ..

# 3. Rebuild
npm run ios

