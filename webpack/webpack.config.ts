import * as webpack from 'webpack'
import * as HtmlPlugin from 'html-webpack-plugin'
import { resolve } from 'path'

const styleLoader = {
  test: /\.styl$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'stylus-loader',
      options: {
        paths: './src/styles',
      },
    },
  ],
}

const vueLoader = {
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      stylus: styleLoader.use,
    },
  },
}

const config: webpack.Configuration = {
  context: resolve(__dirname, '..'),
  entry: './src/main',
  output: {
    path: resolve(__dirname, '../build'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      vueLoader,
      styleLoader,
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.mp3$|.ogg$/, loader: 'file-loader' },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new HtmlPlugin({ template: './src/index.html' }),
  ],
  devtool: 'source-map',
}

export default config
