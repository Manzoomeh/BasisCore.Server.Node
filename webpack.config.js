const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/hostmanager.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'basiscoreServer.js',
    library: 'BasiscoreServer', 
    libraryTarget: 'umd', 
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', 
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  externals: {

  }
};
