const resources = require("@office-iss/sdx-build-tools/lib/haul-resources");
const path = require("path");
// import { addPathMapping } from "@msfast/webpack-path-mapping/lib/index";

const haulConfig = resources.createHaulConfig({
  allowedPackageDups: ["fbjs", "prop-types", "escape-string-regexp"], // These are small enough that it's probably ok that we have multiple copies
});

const sdxWebpackConfig = haulConfig.webpack;
haulConfig.webpack = (options) => {
  const config = sdxWebpackConfig(options);

  console.dir(config);

  // The loader overrides typescripts declaration property to false.  But doesn't also override declarationMap
  // The default config doesn't do that yet, since some partners are still using typescript < 3.
  const tsLoaderConfig = config.module.rules.find(
    (_) => _.loader === "ts-loader"
  );

  if (tsLoaderConfig.options.compilerOptions.declarationMap === false) {
    console.log(
      require("chalk").yellow(
        "The default config has been updated, so the lpc-office-android haul.config.js can be simplified"
      )
    );
  } else {
    tsLoaderConfig.options.compilerOptions.declarationMap = false;
  }
  tsLoaderConfig.options.compilerOptions.composite = false;
  tsLoaderConfig.options.compilerOptions.incremental = true;

  disableImportExportTransform(config);

//   if (process.env["NODE_ENV"] === "development") {
//     return addPathMapping(transformReactNativePackages(config), {
//       includePresetEnv: false,
//     });
//   }

  return {
    ...transformReactNativePackages(config),
    plugins: [...(config.plugins || []), new oss.NodeModulesListPlugin()],
  };
};

function disableImportExportTransform(config) {
  const isBabelLoader = (loader) => loader.loader.includes("babel-loader");
  const ruleWithBabelLoader = config.module.rules.find(
    (rule) => rule.use && rule.use.find(isBabelLoader)
  );
  const babelLoader = ruleWithBabelLoader.use.find(isBabelLoader);
  babelLoader.options = {
    ...babelLoader.options,
    presets: babelLoader.options.presets.map((preset) =>
      Array.isArray(preset) &&
      preset[0].includes("metro-react-native-babel-preset")
        ? [preset[0], { disableImportExportTransform: true }]
        : preset
    ),
  };
}

function transformReactNativePackages(config) {
  const rules = (config.module && config.module.rules) || [];
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        {
          test: /\.js$/,
          include: /node_modules[\/\\](react|metro)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["module:metro-react-native-babel-preset"],
            },
          },
        },
        ...rules,
      ],
    },
    resolve: {
      ...config.resolve,
      // Ignore 'react-native' field because some @react-native-community
      // packages ship with TypeScript
      mainFields: ["browser", "main"],
      alias: {
        "react-native": path.dirname(
          require.resolve("react-native/package.json")
        ),
      },
    },
  };
}

export default haulConfig;
