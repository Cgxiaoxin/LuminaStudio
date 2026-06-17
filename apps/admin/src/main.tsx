import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import "./styles/global.css";
import { App } from "./app/App";
import { I18nProvider, useI18n } from "./i18n";

function AntdLocaleBridge({ children }: { children: React.ReactNode }) {
  const { antdLocale } = useI18n();
  return <ConfigProvider locale={antdLocale}>{children}</ConfigProvider>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <AntdLocaleBridge>
        <App />
      </AntdLocaleBridge>
    </I18nProvider>
  </React.StrictMode>,
);
