'use strict'

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 注意引用方式3.0以后要解构
const addAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[chunkhash:8].js' // 8位文件指纹
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /.js(x)$/, //加（x），因为HtmlWebpackPlugin默认用的ejs模版引擎，jsx语法
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              cacheDirectory: true // 编译结果缓存到node_modules/.cache/babel-loader
            }     
          }
        ]
      },
      {
        test: /.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /.(png|jpg|gif|jpeg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240  // 将小于10240的图片转为base64
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({  // 把css提取成单独的文件，与style-loader功能互斥，不能同时使用
      filename: '[name]_[contenthash:8].css'
    }),
    new OptimizeCssAssetsWebpackPlugin({ // 压缩css
      assetNameRegExp: /.css$/g,
      cssProcessor: require('cssnano')
    }),
    new HtmlWebpackPlugin({ // 自动生成html，可以使用template指定模版
      filename: 'index.html',
      chunks: ['main'], //要包含哪些chunk
      inject: true, //将chunks自动注入html
      minify: {
        html5: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        minifyCSS: true,
        minifyJS: true,
        removeComments: false
      }
    }),
    new CleanWebpackPlugin(), // 打包前自动清理dist

    // 告诉webpack使用了哪些动态链接库，不用再打包这里面的东西
    new webpack.DllReferencePlugin({
      manifest: require('./build/lib/manifest.json')
    }),
    new addAssetHtmlWebpackPlugin([
      {
        filepath: path.resolve(__dirname, './build/lib/*.dll.js'),
        outputPath: 'static', // 拷贝后的输出路径，相对于html
        publicPath: 'static' 
      }
    ])
  ],
  // devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
      // minChunks: 2
    }
  }
}