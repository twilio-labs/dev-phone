import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { compose, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducer'
import { fetchChannelData, fetchClientToken } from './actions'
import "./index.css";
import App from "./components/App/App";

import { Theme } from "@twilio-paste/core/theme";

debugger
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(reducer, composeEnhancers(
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
