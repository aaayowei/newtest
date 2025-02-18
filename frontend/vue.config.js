const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules\/(?!@wangeditor)/,
          use: {
            loader: 'babel-loader',
            options: {
              compact: false
            }
          }
        }
      ]
    }
  }
});
