'use strict'

const path = require('path');
const glob = require('glob')
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 注意引用方式3.0以后要解构

const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];

  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));
  entryFiles.forEach(entryFile => {
    const match = entryFile.match(/src\/(.*)\/index\.js/);
    const pageName = match && match[1];

    entry[pageName] = entryFile;
    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({ 
        template: path.join(__dirname, `src/${pageName}/index.html`),
        filename: `${pageName}.html`,
        chunks: [pageName], //要包含哪些chunk
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
    )
  })

  return {
    entry,
    htmlWebpackPlugins
  }
}
const { entry, htmlWebpackPlugins } =  setMPA()

module.exports = {
  entry: entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[chunkhash:8].js' // 8位文件指纹
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /.js(x)$/, //加（x），因为HtmlWebpackPlugin默认用的ejs模版引擎，jsx语法
        use: 'babel-loader'
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
    new CleanWebpackPlugin(), // 打包前自动清理dist
  ].concat(htmlWebpackPlugins)
}