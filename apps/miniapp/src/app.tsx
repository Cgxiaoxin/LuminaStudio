import React from "react";
import { useLaunch } from "@tarojs/taro";
import { ensureGuestContext } from "./services/api";
import "./app.scss";

function App(props: { children: React.ReactNode }) {
  useLaunch(() => {
    ensureGuestContext();
  });

  return props.children;
}

export default App;
