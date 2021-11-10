const path = require('path');

module.exports = {
    publicPath: './',
    devServer: {
        host: 'localhost'
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
