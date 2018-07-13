const path = require("path");
const rewireLess = require("react-app-rewire-less");
const tsImportPlugin = require("ts-import-plugin");

// reference:
// https://ant.design/docs/react/use-with-create-react-app
// https://github.com/qinyang1980/create-react-antd-app

function getTsLoaderNode(config) {
  const { oneOf } = config.module.rules.find(conf => conf.oneOf);
  const rule = oneOf.find(
    ({ use }) =>
      use && use.find(({ loader }) => loader && loader.includes("ts-loader"))
  );
  return rule.use[0];
}

module.exports = function override(config, env) {
  const tsLoader = getTsLoaderNode(config);

  if (!tsLoader) {
    console.log(`could not find ts-loader node`);
    return;
  }

  const antdTransformer = tsImportPlugin({
    libraryName: "antd",
    libraryDirectory: "lib",
    style: true
  });

  tsLoader.options = {
    getCustomTransformers: () => ({ before: [antdTransformer] })
  };

  // config = rewireLess(config, env);
  config = rewireLess.withLoaderOptions({
    javascriptEnabled: true,
    modifyVars: { "@primary-color": "#08979C" }
  })(config, env);

  // For import with absolute path.
  config.resolve.modules = [path.resolve("src")].concat(config.resolve.modules);

  return config;
};
