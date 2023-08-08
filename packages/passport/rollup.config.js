/* eslint-disable @typescript-eslint/no-var-requires */
const { generateRollupConfig } = require('../../rollup.config.js');
const webWorkerLoader = require('rollup-plugin-web-worker-loader');

module.exports = generateRollupConfig({
  packageDir: __dirname,
  plugins: [
    webWorkerLoader({
      pattern: /shared-worker:(.+)/,
      targetPlatform: 'browser',
    }),
  ],
});
