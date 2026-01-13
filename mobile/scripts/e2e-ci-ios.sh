#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== RetroX E2E Test Runner (iOS) ===${NC}"
echo ""

detect_simulator() {
    if [ -n "$SIMULATOR_NAME" ]; then
        echo "$SIMULATOR_NAME"
        return
    fi
    
    if [ -n "$CI" ]; then
        echo "iPhone 15 Pro"
        return
    fi
    
    if xcrun simctl list devices available | grep -q "iPhone 17 Pro"; then
        echo "iPhone 17 Pro"
    elif xcrun simctl list devices available | grep -q "iPhone 16 Pro"; then
        echo "iPhone 16 Pro"
    elif xcrun simctl list devices available | grep -q "iPhone 15 Pro"; then
        echo "iPhone 15 Pro"
    else
        echo "iPhone 17 Pro"
    fi
}

SIMULATOR_NAME=$(detect_simulator)
CONFIGURATION="${CONFIGURATION:-ios.sim.release}"
export DETOX_DEVICE_TYPE="$SIMULATOR_NAME"

echo -e "Using simulator: ${GREEN}$SIMULATOR_NAME${NC}"

# Step 1: Check if running from mobile directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from mobile/ directory${NC}"
    exit 1
fi

# Step 2: Install dependencies if needed
echo -e "${YELLOW}[1/5] Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm ci
else
    echo "Dependencies already installed"
fi

# Step 3: Install pods if needed
echo -e "${YELLOW}[2/5] Checking CocoaPods...${NC}"
if [ ! -d "ios/Pods" ]; then
    echo "Installing CocoaPods..."
    cd ios && pod install && cd ..
else
    echo "Pods already installed"
fi

# Step 4: Boot iOS Simulator
echo -e "${YELLOW}[3/5] Booting iOS Simulator ($SIMULATOR_NAME)...${NC}"
xcrun simctl boot "$SIMULATOR_NAME" 2>/dev/null || echo "Simulator already booted or starting..."
xcrun simctl bootstatus "$SIMULATOR_NAME" -b 2>/dev/null || true
echo "Simulator ready"

# Step 5: Build Detox
echo -e "${YELLOW}[4/5] Building Detox ($CONFIGURATION)...${NC}"
npx detox build --configuration "$CONFIGURATION"

# Step 6: Run E2E Tests
echo -e "${YELLOW}[5/5] Running E2E Tests...${NC}"
npx detox test --configuration "$CONFIGURATION" --cleanup

echo ""
echo -e "${GREEN}=== E2E Tests Complete ===${NC}"
