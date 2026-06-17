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
    defineConstants: {
      API_BASE_URL: JSON.stringify(process.env.TARO_APP_API || 'http://localhost:3000/api'),
    },
    copy: { patterns: [], options: {} },
    framework: "react",
    compiler: "webpack5",
    mini: {
      projectConfig: {
        appid: "wx6ffa1da368b4ddb5",
        projectname: "LuminaStudio",
        description: "LuminaStudio WeChat Mini Program",
        setting: {
          urlCheck: false,
          es6: true,
          postcss: true,
          minified: true,
          enhance: false,
        },
      },
    },
    h5: {},
  };

  const envConfig = process.env.NODE_ENV === "production" ? await import("./prod") : await import("./dev");
  return merge({}, baseConfig, envConfig.default);
});
