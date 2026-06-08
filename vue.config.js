const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@vue/cli-plugin-babel/preset']
              }
            },
            'ts-loader'
          ],
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json'],
      alias: {
        '@': require('path').resolve(__dirname, 'src/')
      }
    }
  }
})
