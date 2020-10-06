const path = require('path');
const webpack = require('webpack')

module.exports={
  entry: {
    lib: [
      'lodash',
      'jquery'
    ]
  },
  output: {
    filename: '[name]_[chunkhash].dll.js',
    path: path.join(__dirname, 'build/lib'),
    library: '[name]' // 打包后对外暴露的全局变量名称
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]', // manifest.json中的name，要与ouput.library名一致
      path: path.join(__dirname, 'build/lib/manifest.json'),
    })
  ]
}