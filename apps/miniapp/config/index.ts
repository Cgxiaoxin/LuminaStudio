import { defineConfig } from "@tarojs/cli";

export default defineConfig(async (merge) => {
  const baseConfig = {
    projectName: "LuminaStudio",
    date: "2026-06-13",
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2,
    },
    sourceRoot: "src",
    outputRoot: "dist",
    plugins: [],
    defineConstants: {},
    copy: { patterns: [], options: {} },
    framework: "react",
    compiler: "webpack5",
    mini: {},
    h5: {},
  };

  const envConfig = process.env.NODE_ENV === "production" ? await import("./prod") : await import("./dev");
  return merge({}, baseConfig, envConfig.default);
});
