const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WriteFilePlugin = require('write-file-webpack-plugin')
const path = require('path');
const webpack = require("webpack");

let commonConfig = {
  devtool: 'inline-source-map',
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.ts', '.js']
  }
}

let rules = [
  {
    test: /\.ts$/,
    loader: 'awesome-typescript-loader'
  },
  {
    test: /\.html$/,
    loader: 'html-loader'
  },
  {
    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader?limit=10000&mimetype=application/font-woff'
  },
  {
    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader?limit=10000&mimetype=application/font-woff'
  },
  {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
  },
  {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'file-loader'
  },
  {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
  }
]

let devConfig = {
  target: 'electron-renderer',
  module: {
    rules: [
      ...rules,
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [ 
            { loader: 'css-loader' } 
          ]
        })
      }
    ],
  },
  entry: {
    app: [
      'webpack-dev-server/client?/',
      'webpack/hot/only-dev-server',
      './src/index',
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new ExtractTextPlugin("styles.css"),
    new webpack.DefinePlugin({
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    })
  ],
  output: {
    filename: 'bundle.js',
    publicPath: '',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    historyApiFallback: true,
    inline: false,
    hot: true,
    contentBase: './src/public',
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
  }
}

let prodConfig = {
  target: 'electron-renderer',
  module: {
    rules: [
      ...rules,
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [ 
            { loader: 'css-loader', options: { minimize: true } } 
          ]
        })
      }
    ],
  },
  entry: {
    app: [
      './src/index',
    ]
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin(), // es2015 not supported yet
    new ExtractTextPlugin('styles.css'),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'src', 'public'),
      to: path.resolve(__dirname, 'dist')
    }]),
    new webpack.DefinePlugin({
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    })
  ],
  output: {
    filename: 'bundle.js',
    publicPath: '',
    path: path.resolve(__dirname, 'dist')
  }
}

let electronConfig = {
  target: 'electron-main',
  entry: {
    app: [
      './src/electron',
    ]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  },
  plugins: [
    new WriteFilePlugin(),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'src', 'public', 'index.html'),
      to: path.resolve(__dirname, 'dist', 'index.html')
    }]),
    new webpack.DefinePlugin({
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    })
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  }
}

if (process.env.NODE_ENV === 'production') {
  module.exports = [
    Object.assign({}, commonConfig, prodConfig),
    Object.assign({}, commonConfig, electronConfig)
  ]
} else {
  module.exports = [
    Object.assign({}, commonConfig, devConfig),
    Object.assign({}, commonConfig, electronConfig),
  ]
}
