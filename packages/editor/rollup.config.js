/* eslint-disable @typescript-eslint/no-var-requires */
const { generateRollupConfig } = require('../../rollup.config.js');

module.exports = generateRollupConfig({
  packageDir: __dirname,
});
