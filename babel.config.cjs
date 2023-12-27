function isWebTarget(caller) {
  return Boolean(caller && caller.target === "web");
}

export default (api) => {
  const web = api.caller(isWebTarget);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage",
          corejs: 3,
          targets: !web
            ? { node: "current" }
            : {
                browsers: ["Android >= 4.4", "iOS >= 9"],
              },
          modules: web ? "auto" : "commonjs",
        },
      ],
      [
        "@babel/preset-react",
        {
          runtime: "automatic",
        },
      ],
      ["@babel/preset-typescript"],
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-proposal-class-properties", { loose: false }],
      ["@babel/plugin-proposal-private-methods", { loose: false }],
      ["@babel/plugin-proposal-private-property-in-object", { loose: false }],
      ["@babel/plugin-transform-runtime"],
    ],
  };
};
