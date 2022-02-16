import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { compose, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducer'
import { fetchChannelData, fetchClientToken } from './actions'
import "./index.css";
import App from "./App";

import { Theme } from "@twilio-paste/core/theme";

/* TODO: make devtools conditional on dev environment */
const store = createStore(reducer, compose(
  applyMiddleware(thunk),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
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
