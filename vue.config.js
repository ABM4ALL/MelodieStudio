// const utils = require("build/utils")
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin")
function resolve(dir) {
    return path.join(__dirname, '.', dir)
}
const WebpackCdnPlugin = require('webpack-cdn-plugin');

const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const webpack = require("webpack");
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const autoImportPlugins = [
    AutoImport({
        resolvers: [ElementPlusResolver()],
    }),
    Components({
        resolvers: [ElementPlusResolver()],
    }),
]

const plugins = [new WebpackCdnPlugin({
    modules: [
        // {
        //     name: "vue",
        //     var: "Vue",
        //     path: "vue.global.min.js"
        // },
        // {
        //     name: '@element-plus/icons-vue',
        //     // var: "V",
        //     prodUrl: 'https://cdn.bootcdn.net/ajax/libs/element-plus-icons-vue/:version/global.iife.js'
        // },
        {
            name: 'echarts',
            path: 'echarts.min.js',
        },
        {
            name: "three",
            var: 'THREE',
            prodUrl: "https://cdn.bootcdn.net/ajax/libs/three.js/:version/three.js"
        },
    ],
    publicPath: '/node_modules',
    devUrl: ':name/dist/:path',
    prodUrl: 'https://cdn.bootcdn.net/ajax/libs/:name/:version/:path'
})
]


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
        console.log(env.production, env.independent,process.env.VUE_APP_SOURCEMAP_ON);
        const analyzerPlugin = env.analyzer_on ? [new BundleAnalyzerPlugin()] : []
        const cdnPlugin = env.independent == null ? plugins : []
        return {
            devtool: process.env.VUE_APP_SOURCEMAP_ON=="TRUE" ? "inline-source-map" : undefined,
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
            plugins: [].concat(autoImportPlugins).concat(cdnPlugin, analyzerPlugin).concat([
                new CompressionPlugin({
                    threshold: 0,
                    minRatio: 0.6,
                    test: /\.(css|js|ts)/i,
                    algorithm: "gzip"
                })]),
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
