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

/**
 * Strip license banners / framework strings that fingerprint Ionic & Vue
 * in production assets (PentestTools CWE-200 tech disclosure).
 */
class StripTechFingerprintsPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('StripTechFingerprintsPlugin', (compilation) => {
      const outDir = compilation.options.output.path
      if (!outDir || !fs.existsSync(outDir)) {
        return
      }

      const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            walk(full)
            continue
          }

          // Never ship source maps (version / path disclosure).
          if (entry.name.endsWith('.map')) {
            fs.unlinkSync(full)
            continue
          }

          if (!/\.(js|css)$/i.test(entry.name)) {
            continue
          }

          let source = fs.readFileSync(full, 'utf8')
          const before = source.length

          // Block comments (including /*! license */ kept by minifiers).
          source = source.replace(/\/\*!?[\s\S]*?\*\//g, (block) => {
            if (/ionic|vue\.js|vuejs|framework|copyright|\(c\)\s*ionic/i.test(block)) {
              return ''
            }
            // Drop empty/noise license stubs; keep CSS non-fingerprint comments only if short.
            if (block.length > 40) {
              return ''
            }
            return ''
          })

          // Single-line Ionic/Vue banners.
          source = source.replace(/^[\t ]*\/\/.*(ionic|vue\.js|ionicframework).*$/gim, '')

          // Redact framework docs URLs that scanners use for fingerprinting.
          source = source.replace(/https?:\/\/ionicframework\.com[^"'\\\s]*/gi, '')
          source = source.replace(/https?:\/\/vuejs\.org[^"'\\\s]*/gi, '')
          source = source.replace(/https?:\/\/v[0-9]+\.vuejs\.org[^"'\\\s]*/gi, '')

          if (source.length !== before) {
            fs.writeFileSync(full, source)
          }
        }
      }

      walk(outDir)
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
    plugins: [new WriteHtaccessPlugin(), new StripTechFingerprintsPlugin()],
  },
  chainWebpack: (config) => {
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')

    // Strip license/banner comments that fingerprint Ionic/Vue in production bundles.
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
