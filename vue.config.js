/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.ts'
    }
  },
  devServer: {
    historyApiFallback: true,
    host: '127.0.0.1',
    port: 8080,
  },
})
