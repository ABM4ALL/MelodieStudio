const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
// const config = require('config');
// if (config.build.bundleAnalyzerReport) {
//     const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
//     webpackConfig.plugins.push(new BundleAnalyzerPlugin())
// }
module.exports = {
    publicPath: './',
    devServer: {
        host: '0.0.0.0',
        proxy: {
            '/api/': {
                target: 'http://127.0.0.1:8089/',
                changeOrigin: true
            }
        },
    },
    configureWebpack: {
        devtool: "inline-source-map",
        resolve: {
            alias: {
                "@": path.resolve("src")
            }
        },
        plugins: [
            new BundleAnalyzerPlugin({ analyzerPort: 8919 })
        ]

    },
    css: {
        extract: false
    }
};
