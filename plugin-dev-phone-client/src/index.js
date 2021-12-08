import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { Theme } from "@twilio-paste/core/theme";

ReactDOM.render(
  <React.StrictMode>
    <Theme.Provider theme="default">
      <App />
    </Theme.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
