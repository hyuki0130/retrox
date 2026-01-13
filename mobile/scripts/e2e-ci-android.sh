#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== RetroX E2E Test Runner (Android) ===${NC}"
echo ""

detect_emulator() {
    # Check DETOX_AVD_NAME first (used by .detoxrc.js)
    if [ -n "$DETOX_AVD_NAME" ]; then
        echo "$DETOX_AVD_NAME"
        return
    fi
    
    # Legacy support for EMULATOR_NAME
    if [ -n "$EMULATOR_NAME" ]; then
        echo "$EMULATOR_NAME"
        return
    fi
    
    AVAILABLE=$(emulator -list-avds 2>/dev/null | head -1)
    if [ -n "$AVAILABLE" ]; then
        echo "$AVAILABLE"
    else
        echo "Pixel_4_API_30"
    fi
}

EMULATOR_NAME=$(detect_emulator)
# Export DETOX_AVD_NAME for .detoxrc.js to use
export DETOX_AVD_NAME="$EMULATOR_NAME"
CONFIGURATION="${CONFIGURATION:-android.emu.debug}"

echo -e "Using emulator: ${GREEN}$EMULATOR_NAME${NC}"
echo -e "DETOX_AVD_NAME: ${GREEN}$DETOX_AVD_NAME${NC}"
echo -e "Configuration: ${GREEN}$CONFIGURATION${NC}"
echo ""

if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from mobile/ directory${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/5] Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm ci
else
    echo "Dependencies already installed"
fi

echo -e "${YELLOW}[2/5] Checking Android SDK...${NC}"
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    elif [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    else
        echo -e "${RED}Error: ANDROID_HOME not set and Android SDK not found${NC}"
        exit 1
    fi
fi
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
echo "ANDROID_HOME: $ANDROID_HOME"

echo -e "${YELLOW}[3/5] Starting Android Emulator ($EMULATOR_NAME)...${NC}"
if ! adb devices | grep -q "emulator"; then
    echo "Starting emulator in background..."
    emulator -avd "$EMULATOR_NAME" -no-snapshot-save -no-audio -no-boot-anim &
    EMULATOR_PID=$!
    
    echo "Waiting for emulator to boot..."
    adb wait-for-device
    
    BOOT_COMPLETE=""
    while [ "$BOOT_COMPLETE" != "1" ]; do
        sleep 2
        BOOT_COMPLETE=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
        echo -n "."
    done
    echo ""
    echo "Emulator booted"
else
    echo "Emulator already running"
fi

echo -e "${YELLOW}[4/5] Building Detox ($CONFIGURATION)...${NC}"
npx detox build --configuration "$CONFIGURATION"

echo -e "${YELLOW}[5/5] Running E2E Tests...${NC}"
npx detox test --configuration "$CONFIGURATION" --cleanup

echo ""
echo -e "${GREEN}=== Android E2E Tests Complete ===${NC}"
