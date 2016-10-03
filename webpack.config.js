'use strict';

module.exports = {
  entry: {
    app: './src/app.js'
  },
  output: {
    path: './dist',
    filename: 'picasso.js',
    library: 'Picasso',
    libraryTarget: 'umd'
  },
  plugins: [],
  module: {
    preLoaders: [
      {test: /\.jsx$/, exclude: /node_modules/, loader: 'msx-loader'}
    ],
    loaders: [
      {test: /\.js$|\.jsx$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  },
  devServer: {
    contentBase: './public'
  }
};
