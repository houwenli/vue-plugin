const path = require('path')
const webpack = require('webpack')
const pkg = require('../package.json');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, '../lib'),
        filename: 'index.js',
        publicPath: '/lib/',
        library: 'vue-plugin',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.sass$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax']
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        scss: ['vue-style-loader', 'css-loader', 'sass-loader'],
                        sass: ['vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax']
                    },
                    compilerOptions: {
                        preserveWhitespace: false
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 50000,
                    name: path.posix.join('static', '[name].[hash:7].[ext]')
                }
            }
        ]
    },
    devtool: false,
    externals: {
        vue: {
            root: 'Vue',
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue'
        },
        axios: 'axios',
        'element-ui': 'element-ui',
        'vue-router': 'vue-router'
    },
    plugins: [
        new VueLoaderPlugin(),
        // 将静态资源目录复制到构建目录static
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../src/assets/css'),
                to: 'static/css',
                ignore: ['.*']
            }
        ]),
        new webpack.DefinePlugin({
            'process.env.VERSION': `'${pkg.version}'`
        }),
        // 压缩输出的 JS 代码
        new UglifyJSPlugin({
            compress: {
                warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
                drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
                collapse_vars: true, // 内嵌定义了但是只用到一次的变量
                reduce_vars: true, // 提取出出现多次但是没有定义成变量去引用的静态值
                pure_funcs:['console.log','console.info','console.table']
            },
            output: {
                beautify: false, // 最紧凑的输出
                comments: false // 删除所有的注释
            }
        }),
        new webpack.ProvidePlugin({
          _: 'lodash'
        }),
        new CleanWebpackPlugin() //build前清空dist文件夹
    ]
};

