/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const ejs = require('ejs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const { VueLoaderPlugin } = require('vue-loader');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const path = require('path');
const { services } = require('./src/manifest');

const example = path.resolve(__dirname, 'example', 'index.html');

require('dotenv').config({ path: '.env.firefox' });

function transformHtml(content) {
  return ejs.render(content.toString().replace('.ts', '.js'), {
    ...process.env,
  });
}

const config = {
  mode: process.env.NODE_ENV,
  context: __dirname + '/src',
  entry: {
    'background/index': './background/index.ts',
    'popup/index': './popup/index.ts',
    'options/index': './options/index.ts',

    'player/index': './player/index.ts',
    'content-scripts/all': './content-scripts/all.ts',
    'content-scripts/keyboard-blocker': './content-scripts/keyboard-blocker.ts',
    'content-scripts/anime-skip/index': './content-scripts/anime-skip/index.ts',

    ...services.reduce((map, service) => {
      const path = `content-scripts/${service.folder}`;
      map[`${path}/index`] = `./${path}/index.ts`;
      map[`${path}/parent`] = `./${path}/parent.ts`;
      return map;
    }, {}),
  },
  // TODO: Investigate code splitting options
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  // },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.ts', '.vue'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      assert: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/assets/',
          emitFile: false,
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/fonts/',
          emitFile: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyPlugin([
      { from: '../node_modules/webextension-polyfill/dist/browser-polyfill.js' },
      { from: 'assets', to: 'assets', ignore: ['icon.xcf'] },
      { from: 'popup/index.html', to: 'popup/index.html', transform: transformHtml },
      { from: 'options/index.html', to: 'options/index.html', transform: transformHtml },
      {
        from: 'manifest.json',
        to: 'manifest.json',
        transform: _ => {
          const { manifest } = require('./src/manifest');

          if (config.mode === 'development') {
            manifest['content_security_policy'] =
              "script-src 'self' 'unsafe-eval'; object-src 'self'";
          }

          return JSON.stringify(manifest, null, 2);
        },
      },
    ]),
  ],
  stats: {
    assetsSort: '!size',
    entrypoints: false,
    excludeAssets: [/.*\.(png|svg)$/],
    modules: false,
  },
};

if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ]);
}

if (process.env.BUILD_ONLY !== 'true') {
  const profile = process.env.BROWSER_PROFILE_PATH;
  let args;
  if (process.env.BUILD_FOR === 'firefox') {
    args = [
      '--target firefox-desktop',
      profile ? `--firefox-profile=${profile}` : '',
      `--url ${example}`,
      '--url about:debugging#/runtime/this-firefox',
      '--url about:addons',
    ];
  } else {
    args = [
      '--target chromium',
      '--chromium-binary google-chrome',
      profile ? `--chromium-profile=${profile}` : '',
      `--url ${example}`,
      '--url chrome://extensions',
    ];
  }

  config.plugins.push(
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [
          `yarn web-ext --config=.web-ext.config.js run ${args.join(' ')}`,
          `echo -e \x1b[1m\x1b[95mOpening ${process.env.BUILD_FOR}...\x1b[0m`,
        ],
        blocking: false,
        parallel: true,
      },
    })
  );
}

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ExtensionReloader({
      manifest: __dirname + '/src/manifest.json',
    }),
  ]);
}

module.exports = config;
