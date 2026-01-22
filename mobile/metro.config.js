const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  server: {
    port: 9091,
  },
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'ogg', 'mp3', 'wav'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
