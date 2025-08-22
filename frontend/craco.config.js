const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          buffer: require.resolve('buffer'),
          vm: false, // Disable vm polyfill
        },
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
      ignoreWarnings: [
        // Ignore source map warnings for CosmJS dependencies
        /Failed to parse source map/,
      ],
    },
  },
};
