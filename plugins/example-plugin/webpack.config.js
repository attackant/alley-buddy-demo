const glob = require('glob');
const path = require('path');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

module.exports = (env, { mode }) => ({
  /*
   * See https://webpack.js.org/configuration/devtool/ for an explanation of how
   * to configure this directive. We are using the recommended options for
   * production and development mode that produce high quality source maps.
   * However, the performance of these options is not stellar, so if you
   * notice that the build performance in your project is suffering to an
   * unacceptable degree, you can choose different options from the link above.
   */
  devtool: mode === 'production'
    ? 'source-map'
    : 'eval-source-map',

  // Dynamically produce entries from the slotfills index file and all blocks.
  entry: glob
    .sync('./blocks/**/index.js*')
    .reduce((acc, item) => {
      const entry = item
        .replace('./blocks/', '')
        .replace('/index.jsx', '')
        .replace('/index.js', '');
      acc[entry] = item;
      return acc;
    }, {
      slotfills: './slotfills/index.js',
    }),

  // Configure loaders based on extension.
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        exclude: /node_modules/,
        test: /\.(sa|sc|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
          'resolve-url-loader',
          'sass-loader',
        ],
      },
    ],
  },

  // Use different filenames for production and development builds for clarity.
  output: {
    clean: mode === 'production',
    filename: mode === 'production'
      ? '[name].bundle.min.js'
      : '[name].js',
    path: path.join(__dirname, 'build'),
  },

  // Configure plugins.
  plugins: [
    // This maps references to @wordpress/{package-name} to the wp object.
    new DependencyExtractionWebpackPlugin({ useDefaults: true }),
  ],

  // Tell webpack that we are using both .js and .jsx extensions and hook up aliases.
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
    extensions: ['.js', '.jsx'],
  },

  // Cache the generated webpack modules and chunks to improve build speed.
  // @see https://webpack.js.org/configuration/cache/
  cache: {
    type: 'filesystem',
  },
});
