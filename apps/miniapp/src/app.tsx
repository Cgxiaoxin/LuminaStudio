import React from "react";
import { useLaunch } from "@tarojs/taro";
import "./app.scss";

function App(props: { children: React.ReactNode }) {
  useLaunch(() => {
    console.log("LuminaStudio mini app launched");
  });

  return props.children;
}

export default App;
