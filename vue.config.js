// const utils = require("build/utils")
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
function resolve(dir) {
    return path.join(__dirname, '.', dir)
}

const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCdnPlugin = require('webpack-cdn-plugin');

const plugins = [new WebpackCdnPlugin({
    modules: [
        {
            name: 'echarts',
            // var: 'ECharts',
            path: 'echarts.min.js',
        },
        // {
        //     name: 'echarts-gl',
        //     var: 'gl',
        //     path: 'echarts-gl.min.js'
        // },
        {
            name: "three",
            var: 'THREE',
            prodUrl: "https://cdn.bootcdn.net/ajax/libs/three.js/:version/three.js"
        },
        // {
        //     name: "element-plus/icons-vue",
        //     url: "https://cdn.bootcdn.net/ajax/libs/element-plus-icons-vue/2.0.10/index.iife.min.js"
        // }
        // {
        //     name:"element-plus",
        //     path: 'index.min.css',
        //     cssOnly: true
        // },
        // {
        //     name:"element-plus",
        //     var: 'element',
        //     path: 'index.full.min.js'
        // }
    ],
    publicPath: '/node_modules',
    //'https://unpkg.com/:name@:version/:path',
    devUrl: ':name/dist/:path',
    prodUrl: 'https://cdn.bootcdn.net/ajax/libs/:name/:version/:path'
})
] //.concat([new BundleAnalyzerPlugin()])
// console.log(utils.)
module.exports = {
    publicPath: './',
    devServer: {
        host: '0.0.0.0',
        port: 9303,
        proxy: {
            '/api/': {
                target: 'http://127.0.0.1:8089/',
                changeOrigin: true
            },
        },
    },
    configureWebpack: (env) => {
        console.log(env.production);
        return {
            devtool: "inline-source-map",
            resolve: {
                alias: {
                    "@": path.resolve("src")
                },
                fallback: {
                    path: require.resolve('path-browserify'),
                }
            },
            module: {
            },
            plugins,
            externals: {}
        }
    },
    css: {
        extract: false
    },

    outputDir: 'webdist',
    chainWebpack: config => {
        config.module.rules.delete("svg"); //重点:删除默认配置中处理svg,
        config.module
            .rule('svg-sprite-loader')
            .test(/\.svg$/)
            .include
            .add(resolve('src/assets/icons')) //处理svg目录
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'
            })
    }

};
