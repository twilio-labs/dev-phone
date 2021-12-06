import './App.css';

import { useEffect, useState } from 'react';
import Konami from 'konami'

import PhoneNumberPicker from './components/PhoneNumberPicker'
import SendSmsForm from './components/SendSmsForm';


const sendSms = (from, to, body) => {
  console.log("Get it sent!");
  console.table({ from, to, body });

  if (from && to && body) {
    fetch("/send-sms", {
      method: "POST",
      headers: { "content-type": "application/json" },
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

  const [devPhonePn, setDevPhonePn] = useState(null);

  useEffect(() => {
    setupKonamiCode();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>HELLO :owlwave:</p>
      </header>

      {devPhonePn ?
        <SendSmsForm devPhonePn={devPhonePn} sendSms={sendSms} />
        :
        <PhoneNumberPicker setDevPhonePn={setDevPhonePn}/>
      }

    </div>
  );
}

export default App;
