const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.styl(us)?$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'stylus-loader' }],
});

module.exports = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
