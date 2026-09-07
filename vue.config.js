/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')
const { defineConfig } = require('@vue/cli-service')

class WriteHtaccessPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('WriteHtaccessPlugin', (compilation) => {
      const source = path.resolve(__dirname, 'public/.htaccess')
      const dest = path.join(compilation.options.output.path, '.htaccess')
      if (!fs.existsSync(source)) {
        return
      }
      if (fs.existsSync(dest) && fs.statSync(dest).isDirectory()) {
        fs.rmSync(dest, { recursive: true, force: true })
      }
      fs.copyFileSync(source, dest)
    })
  }
}

module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.ts'
    }
  },
  configureWebpack: {
    plugins: [new WriteHtaccessPlugin()],
  },
  devServer: {
    historyApiFallback: true,
    host: '127.0.0.1',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  },
})
