const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    //入口
    entry: "./src/main.js", //相对路径
    //输出
    output: {
        //文件输出路径
        path: path.resolve(__dirname, "dist"), //绝对路径
        //文件名
        filename: 'static/bundle.js',
        clean: true
    },
    //加载器
    module: {
        rules: [
            //loader加载器
            {
                test: /\.css$/, //匹配文件
                use: ['style-loader', 'css-loader'] //使用哪些loader
            },
            //loader加载器
            {
                test: /\.s[ac]ss$/, //匹配文件
                use: ['style-loader', 'css-loader', 'sass-loader'] //使用哪些loader
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                type: 'asset/resource',
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024 // 8KB 以下的文件将被内联
                    }
                },
                generator: {
                    filename: 'static/images/[hash:10][ext][query]' // 输出文件的命名规则
                }
            },
            {
                test: /\.(js|ts|tsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        "@babel/preset-env",
                        "@babel/preset-react",
                        "@babel/preset-typescript"
                    ]
                }
            },
        ]
    },
    //插件
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: './src/asset/icons', to: './static/images/icons' }
            ]
        })
    ],
    //模式
    mode: "development",
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        },
        roots: [
            path.resolve(__dirname, 'src'),
        ],
        extensions: [".js", ".jsx", ".ts", ".tsx"],

    },
    externals: {
        'node:fs': 'commonjs fs',
        'node:buffer': 'commonjs buffer',
    }
}