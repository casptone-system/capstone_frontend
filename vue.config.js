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
  productionSourceMap: false,
  pages: {
    index: {
      entry: 'src/main.ts'
    }
  },
  configureWebpack: {
    // Do not post-process minified JS with regex comment/URL stripping.
    // That previously corrupted chunk-vendors (SyntaxError: Unexpected identifier '_$')
    // and white-screened the deployed app. Terser already drops comments below.
    plugins: [new WriteHtaccessPlugin()],
  },
  chainWebpack: (config) => {
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')

    // Drop license/banner comments in production bundles (safe; done by terser AST).
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer('terser').tap((args) => {
        const opts = args[0] || {}
        opts.extractComments = false
        opts.terserOptions = {
          ...(opts.terserOptions || {}),
          format: {
            ...((opts.terserOptions && opts.terserOptions.format) || {}),
            comments: false,
          },
        }
        args[0] = opts
        return args
      })
    }

    // ANALYZE=true npm run build → dist/report.html (webpack-bundle-analyzer)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugin('webpack-bundle-analyzer').use(BundleAnalyzerPlugin, [
        {
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'report.html',
        },
      ])
    }
  },
  devServer: {
    historyApiFallback: true,
    host: '127.0.0.1',
    port: 8080,
    // Local UI uses same-origin /api via proxy — production CSP need not allow http://localhost.
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; frame-src 'self' blob:; media-src 'self' blob:; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:8080 ws://localhost:8080; worker-src 'self' blob:",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
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
