// https://www.alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5

const webpack = require('webpack');
module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url")
    })
    
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])
    config.module.rules.push({ // https://github.com/microsoft/PowerBI-visuals-tools/issues/365#issuecomment-1133458648
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    })
    return config;
}