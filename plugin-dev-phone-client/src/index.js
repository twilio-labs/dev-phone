import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { compose, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './reducer'
import { fetchChannelData, fetchClientToken } from './actions'
import "./index.css";
import App from "./components/App/App";

import { Theme } from "@twilio-paste/core/theme";

/* TODO: make devtools conditional on dev environment */
const store = createStore(reducer, composeWithDevTools(
  applyMiddleware(thunk)
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
