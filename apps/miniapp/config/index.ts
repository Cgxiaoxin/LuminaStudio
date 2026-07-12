import { defineConfig } from "@tarojs/cli";
import fs from "node:fs";
import path from "node:path";

function loadEnvFiles() {
  const root = path.resolve(__dirname, "..");
  const files = [".env.development.local", ".env.development", ".env.local", ".env"];
  for (const file of files) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;
    for (const line of fs.readFileSync(fullPath, "utf-8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  }
}

loadEnvFiles();

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
      miniCssExtractPluginOption: {
        ignoreOrder: true,
      },
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
