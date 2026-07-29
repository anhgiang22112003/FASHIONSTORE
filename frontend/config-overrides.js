const { override } = require('customize-cra');
const path = require('path');

module.exports = override(
  (config) => {
    config.resolve.modules = [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ];
    return config;
  }
);
