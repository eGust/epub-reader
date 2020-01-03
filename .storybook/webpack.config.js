module.exports = ({ config, mode }) => {
  config.module.rules.push({
    test: /\.tsx?$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [['react-app', { flow: false, typescript: true }]],
    },
  });
  config.module.rules.push({
    test: /\.styl(us)?$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'stylus-loader' }],
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
