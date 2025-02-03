// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', // or 'production'
  entry: './src/index.jsx', // Adjust as needed
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      // Update the template path:
      template: './index.html'  // Use this if index.html is in the project root.
    })
  ],
  devtool: 'source-map'
};
