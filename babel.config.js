module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "babel-plugin-module-resolver",
        {
          root: ["."],
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
          alias: {
            "@shared": "./src/shared",
            "@screens": "./src/screens",
            "@assets": "./assets",
          },
        },
      ],
      "babel-plugin-react-compiler",
    ],
  };
};
