module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "babel-plugin-module-resolver",
        {
          root: ["./src"],
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
          alias: {
            "@shared": "./src/shared",
            "@screens": "./src/screens",
          },
        },
      ],
      "babel-plugin-react-compiler",
    ],
  };
};
