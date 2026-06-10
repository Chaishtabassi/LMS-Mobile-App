// babel.config.js
module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      'babel-preset-expo',
      'nativewind/babel', // Add this in presets, not plugins
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};