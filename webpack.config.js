const path = require('path');

module.exports = {
  entry: './src/faker.js',
  output: {
    library: 'propTypesFaker',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    filename: 'faker.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: 'babel-loader',
      },
    ],
  },
};
