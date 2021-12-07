import './App.css';

import { useEffect, useState } from 'react';
import Konami from 'konami'

import PhoneNumberPicker from './components/PhoneNumberPicker'
import SendSmsForm from './components/SendSmsForm';
import ListSms from './components/ListSms';


const sendSms = async (from, to, body) => {
  console.log("Get it sent!");
  console.table({ from, to, body });
  if (from && to && body) {
    await fetch("/send-sms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from, to, body })
    })

  } else {
    console.log("Not sending as some data is missing");
  }
}

const listSms = () => {
  console.log('Getting list of messages');

}

const setupKonamiCode = () => {
  const ninetiesMode = new Konami(() => {
    window.alert("Lets party like it's 1991!");
  });
  ninetiesMode.pattern = "383840403739373949575749";
}


function App() {

  const [devPhonePn, setDevPhonePn] = useState(null);
  const [toPn, setToPn] = useState(null);
  const [conversation, setConversation] = useState(null);

  useEffect(async () => {
    setupKonamiCode();
    await fetch("/plugin-settings")
    .then((res) => res.json())
    .then((settings) => {
      console.log('new settings ', settings);
      if (settings.phoneNumber) {
        setDevPhonePn(settings.phoneNumber);
      }
      if (settings.conversation) {
        setConversation(settings.conversation);
      }
    })

  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>HELLO :owlwave:</p>
      </header>

      {devPhonePn ?
        <div>
          <SendSmsForm devPhonePn={devPhonePn} sendSms={sendSms} />
          <ListSms />
        </div>
        :
        <PhoneNumberPicker setDevPhonePn={setDevPhonePn}/>
      }

    </div>
  );
}

export default App;
