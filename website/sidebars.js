/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  tutorialSidebar: [
    // 通用写法
    {
      type: "category",
      label: "zxx",
      items: ["tutorial-basics/create-a-document"],
    },
    {
      type: "link",
      label: "掘金",
      href: "https://juejin.cn/",
    },
    {
      type: "html",
      value: '<a target="_blank" href="https://juejin.cn/">掘金</a>', // The HTML to be rendered
      defaultStyle: true, // Use the default menu item styling
    },
  ],

};

export default sidebars;
