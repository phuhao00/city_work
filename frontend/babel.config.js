module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@features': './src/features',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@store': './src/store',
            '@theme': './src/theme',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@assets': './src/assets'
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};