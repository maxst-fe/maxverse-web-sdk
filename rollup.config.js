/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const babel = require('@rollup/plugin-babel').default;
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve').default;
const builtins = require('builtin-modules');

const extensions = ['.js', '.ts'];

exports.generateRollupConfig = function generateRollupConfig({ packageDir, plugins }) {
  const packageJSON = require(path.join(packageDir, 'package.json'));

  plugins = plugins ?? [];

  if (packageJSON.publishConfig.exports == null) {
    throw new Error('package.json의 exports 필드를 정의해주세요.');
  }
  if (packageJSON.publishConfig.main == null) {
    throw new Error('package.json의 main 필드를 정의해주세요.');
  }
  if (packageJSON.publishConfig.module == null) {
    throw new Error('package.json의 module 필드를 정의해주세요.');
  }

  const entrypoints = Object.keys(packageJSON.exports).filter(x => x !== './package.json');

  const external = pkg => {
    const externals = [...Object.keys({ ...packageJSON.dependencies, ...packageJSON.peerDependencies }), ...builtins];

    return externals.some(externalPkg => {
      return pkg.startsWith(externalPkg);
    });
  };

  function buildJS(input, output, format) {
    const isESMFormat = format === 'es';
    return {
      input,
      external,
      output: [
        {
          format,
          ...(isESMFormat
            ? {
                dir: path.dirname(output),
                entryFileNames: `[name]${path.extname(output)}`,
                preserveModulesRoot: isESMFormat ? path.dirname(input) : undefined,
              }
            : { file: output }),
        },
      ],
      plugins: [
        resolve({
          extensions,
        }),
        commonjs(),
        babel({
          extensions,
          babelHelpers: 'bundled',
          rootMode: 'upward',
        }),
        json(),
        ...plugins,
      ],
      preserveModules: isESMFormat,
    };
  }

  function buildCJS(input, output) {
    return buildJS(input, output, 'cjs');
  }

  function buildESM(input, output) {
    return buildJS(input, output, 'es');
  }

  return entrypoints.flatMap(entrypoint => {
    const cjsEntrypoint = path.resolve(packageDir, packageJSON?.publishConfig.main);
    const cjsOutput = path.resolve(packageDir, packageJSON?.publishConfig.exports?.[entrypoint].require);

    const esmEntrypoint = path.resolve(packageDir, packageJSON?.publishConfig.module);
    const esmOutput = path.resolve(packageDir, packageJSON?.publishConfig.exports?.[entrypoint].import);

    return [buildCJS(cjsEntrypoint, cjsOutput), buildESM(esmEntrypoint, esmOutput)];
  });
};
