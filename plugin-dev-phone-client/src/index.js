import React from "react";
import ReactDOM from "react-dom";
import { Provider, useSelector, useDispatch } from 'react-redux'
import { compose, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducer'
import { fetchChannelData, fetchClientToken } from './actions'
import "./index.css";
import App from "./App";

import { Theme } from "@twilio-paste/core/theme";

const store = createStore(reducer, compose(
  applyMiddleware(thunk),
  window.devToolsExtension ? window.devToolsExtension() : f => f
))

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
