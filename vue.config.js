const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
function resolve(dir) {
    return path.join(__dirname, '.', dir)
}

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
    configureWebpack: {
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
        plugins: [
            //   new BundleAnalyzerPlugin()
        ],
        // entry: {
        //     // 把公共代码放到 common 里
        //     common: [`@/utils/index.js`],
        //     main: `@/index.js`,
        // },

        
        // optimization: {
        //     // splitChunks 配置
        //     splitChunks: {
        //         cacheGroups: {
        //             default: {
        //                 name: 'vendor',
        //                 // 把第三方库放到 vendor 里，包括 vue, vue-router, vuex 等
        //                 // 因为他们都是从 node_modules 里加载的，这里直接正则匹配
        //                 test: /[\\/]node_modules[\\/]/,
        //                 chunks: 'initial',
        //                 // 调整优先级，优先处理
        //                 priority: 10,
        //             },
        //             // common: {
        //             //     chunks: 'all',
        //             //     name: 'common',
        //             //     // 匹配 entry 里的 common 配置
        //             //     test: 'common',
        //             // },
        //         },
        //     },
        //     // runtime 代码放在 runtime 文件中
        //     runtimeChunk: {
        //         name: 'runtime',
        //     },
        // }, 


        // output: {
        //     filename: 'static/[name].[chunkhash:8].bundle.js',
        //     chunkFilename: 'static/[name].[chunkhash:8].bundle.js',
        // },
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
