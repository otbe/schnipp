const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: Object.keys(slsw.lib.entries).reduce((acc, curr) => {
    acc[curr] = ['./source-map-install.js', slsw.lib.entries[curr]];
    return acc;
  }, {}),
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    mainFields: ['main']
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  node: {
    __dirname: false
  },
  target: 'node',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  externals: [nodeExternals()],
  plugins: [new CopyWebpackPlugin([{ from: 'src/**/*.gql' }])],
  module: {
    rules: [{ test: /\.ts(x?)$/, loader: 'ts-loader' }]
  }
};
