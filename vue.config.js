const path = require('path');

module.exports = {
    publicPath: './',
    devServer: {
        host: 'localhost',
        proxy: {
            '/api/': {
                target: 'http://localhost:8089/',
                changeOrigin: true
            }
        }
    },
    configureWebpack: {
        devtool: "inline-source-map",
        resolve: {
            alias: {
                "@": path.resolve("src")
            }
        }
    },
    css: {
        extract: false
    }
};
