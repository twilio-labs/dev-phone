import './App.css';

import { useEffect, useState } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux'
import { compose, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducer'
import Konami from 'konami'

import SendSmsForm from './components/SendSmsForm';

const sendSms = (from, to, body) => {
  console.log("Get it sent!");
  console.table({ from, to, body });

  if (from && to && body){
    fetch("/send-sms", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({ from, to, body })
    })

  } else {
    console.log("Not sending as some data is missing");
  }
}

const setupKonamiCode = () => {
  const ninetiesMode = new Konami(() => {
    window.alert("Lets party like it's 1991!");
  });
  ninetiesMode.pattern = "383840403739373949575749";
}

function App() {

  const [twilioPns, setTwilioPns] = useState([]);

  useEffect(() => {

    setupKonamiCode();

    fetch("/phone-numbers")
      .then((res) => res.json())
      .then((data) => setTwilioPns(data["phone-numbers"]))
  }, []);

  const store = createStore(reducer, compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ))

  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          <p>HELLO :owlwave:</p>
          <p>You have <strong>{twilioPns.length}</strong> phone numbers</p>
        </header>
        {twilioPns.length > 0 ?
          <SendSmsForm twilioPns={twilioPns} sendSms={sendSms} />
          :
          <div><small>nothing...</small></div>
        }
      </div>
    </Provider>
  );
}

export default App;
