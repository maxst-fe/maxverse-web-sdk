/* eslint-disable @typescript-eslint/no-var-requires */
const { generateRollupConfig } = require('../../rollup.config.js');
const webWorkerLoader = require('./plugin/web-worker-loader');

module.exports = generateRollupConfig({
  packageDir: __dirname,
  plugins: [
    webWorkerLoader({
      targetPlatform: 'browser',
    }),
  ],
});
