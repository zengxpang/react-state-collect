const createBabelConfig = require('./babel.config.js')
const resolve = require('@rollup/plugin-node-resolve') // 用于帮助 Rollup 解析第三方模块的导入。在 JavaScript 中，当你使用 import 语句导入模块时，需要一个机制来定位和加载这些模块。
const babelPlugin = require('@rollup/plugin-babel') // 用于集成 Babel 编译器到 Rollup 打包过程
const commonjs = require('@rollup/plugin-commonjs') // 主要作用是将 CommonJS 模块转换为 ES6 模块。这个插件对于处理那些以 CommonJS 格式编写的第三方模块（通常是在 Node.js 环境中使用的模块）非常有用。
const { dts } = require('rollup-plugin-dts') // 用于处理 TypeScript 的类型声明文件（*.d.ts）

const extensions = ['.ts', '.tsx']

function getBabelOptions() {
  return {
    ...createBabelConfig,
    extensions,
    babelHelpers: 'bundled',
    comments: false,
  }
}

function createDeclarationConfig(input, output) {
  return {
    input,
    output: {
      file: output,
      format: 'es',
    },
    plugins: [dts()],
  }
}

function createESMConfig(input, output) {
  return {
    input,
    output: { file: output, format: 'esm' },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babelPlugin(getBabelOptions()),
    ],
  }
}

function createCommonJSConfig(input, output) {
  return {
    input,
    output: { file: output, format: 'cjs' },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babelPlugin(getBabelOptions()),
    ],
  }
}

function createUMDConfig(input, output, name) {
  return {
    input,
    output: { file: output, format: 'umd', name },
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babelPlugin(getBabelOptions()),
    ],
  }
}

module.exports = (args) => {
  const packageName = args.package

  const input = `packages/${packageName}/src/index.ts`
  const output = `packages/${packageName}/dist`

  return [
    createDeclarationConfig(input, `${output}/index.d.ts`), // TypeScript 定义
    createESMConfig(input, `${output}/index.mjs`), // UMD
    createCommonJSConfig(input, `${output}/index.cjs`), // CJS
    createUMDConfig(input, `${output}/index.umd.js`, packageName), // MJS
  ]
}
