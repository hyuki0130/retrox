const { execSync } = require('child_process');

const getDefaultSimulator = () => {
  if (process.env.DETOX_DEVICE_TYPE) {
    return process.env.DETOX_DEVICE_TYPE;
  }
  if (process.env.CI) {
    return 'iPhone 15 Pro';
  }
  return 'iPhone 17 Pro';
};

const getDefaultEmulator = () => {
  if (process.env.DETOX_AVD_NAME) {
    return process.env.DETOX_AVD_NAME;
  }
  if (process.env.CI) {
    return 'Pixel_4_API_30';
  }
  try {
    const avds = execSync('emulator -list-avds 2>/dev/null', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    return avds[0] || 'Pixel_4_API_30';
  } catch {
    return 'Pixel_4_API_30';
  }
};

/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/RetroX.app',
      build: 'xcodebuild -workspace ios/RetroX.xcworkspace -scheme RetroX -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/RetroX.app',
      build: 'xcodebuild -workspace ios/RetroX.xcworkspace -scheme RetroX -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: getDefaultSimulator() },
    },
    attached: {
      type: 'android.attached',
      device: { adbName: '.*' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: getDefaultEmulator() },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug',
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};
