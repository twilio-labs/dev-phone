import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import reducer from './reducer'
import { fetchChannelData, fetchClientToken } from './actions'
import "./index.css";
import App from "./App";

import { Theme } from "@twilio-paste/core/theme";

/* TODO: make devtools conditional on dev environment */
//@ts-ignore
const store = configureStore({reducer: reducer })

store.dispatch(fetchClientToken())
store.dispatch(fetchChannelData())

ReactDOM.render(
  <React.StrictMode>
    <Theme.Provider theme="default">
      <Provider store={store}>
        <App />
      </Provider>
    </Theme.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
