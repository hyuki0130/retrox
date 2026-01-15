module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest.setup.js', 'jest.config.js'],
      env: {
        jest: true,
        node: true,
      },
    },
  ],
};
