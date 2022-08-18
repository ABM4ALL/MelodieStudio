const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

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
            new MonacoWebpackPlugin()
        ]
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
