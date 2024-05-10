module.exports = {
  babelrc: false, // 告诉 Babel 不要使用任何外部的.babelrc配置文件，从而避免配置冲突。
  ignore: ['/node_modules/'], // 指定了 Babel 应该忽略的文件路径，通常情况下 node_modules 目录包含第三方库，这些库通常已经被编译，不需要 Babel 再次编译。
  presets: [['@babel/preset-env', { loose: true, modules: false }]], // Babel 预设的集合，用于告诉 Babel 使用哪些特性
  // @babel/preset-env 会根据你的目标环境（比如特定版本的浏览器或Node.js）自动决定哪些 JavaScript 新特性需要被转换，哪些可以保留。这意味着它可以避免不必要的转换，使得最终的代码更加精简和高效。
  // loose: true：这个选项会启用“宽松”模式，生成的代码会更简洁、更快
  // modules: false：这个选项阻止 Babel 将 ES6 模块语法转换为其他模块类型（如 CommonJS），这里会交由 Rollup 来处理。
  plugins: [ // 定义了一组 Babel 插件，用于转换特定的 JavaScript 特性或语法
    [
      // 这个插件用于转换 JSX 语法（通常用于 React）。runtime: 'automatic'选项自动导入必要的 JSX 转换而不需要手动导入 React。
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
      },
    ],
    // 这个插件添加了对 TypeScript 的支持。isTSX: true指定插件应该支持 TSX 文件（TypeScript 中的 JSX）。
    ['@babel/plugin-transform-typescript', { isTSX: true }],
  ],
}
