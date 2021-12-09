import "./App.css";

import { useEffect, useState } from "react";
import Konami from "konami";

import { fetchChannelData } from "./actions";
import { connect } from "react-redux";

import PhoneNumberPicker from './components/PhoneNumberPicker'
import SendSmsForm from './components/SendSmsForm';
import Caller from './components/Caller';

import {
  Button,
  Column,
  Grid,
  Input,
  Label,
  Stack,
  TextArea,
} from "@twilio-paste/core";

const sendSms = (from, to, body) => {
  console.log("Get it sent!");
  console.table({ from, to, body });

  if (from && to && body) {
    fetch("/send-sms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from, to, body }),
    });
  } else {
    console.log("Not sending as some data is missing");
  }
};

const setupKonamiCode = () => {
  const ninetiesMode = new Konami(() => {
    window.alert("Lets party like it's 1991!");
  });
  ninetiesMode.pattern = "383840403739373949575749";
};

function App({ channelData, fetchChannelData }) {
  const [devPhonePn, setDevPhonePn] = useState(null);

  useEffect(() => {
    setupKonamiCode();
    if(channelData) {
      setDevPhonePn(channelData.phoneNumber)
    }
  }, [channelData]);

  return (
    <div className="App">
      <header className="App-header">
        <p>HELLO :owlwave:</p>
      </header>
      <Grid gutter="space30">
        <Column span={4} offset={4}>
          {devPhonePn ? (
            <div>
              <SendSmsForm devPhonePn={devPhonePn} sendSms={sendSms} />
              <Caller devPhonePn={devPhonePn} />
            </div>
          ) : (
            <PhoneNumberPicker setDevPhonePn={setDevPhonePn} />
          )}
        </Column>
      </Grid>
    </div>
  );
}

const mapStateToProps = (state) => ({
  channelData: state.channelData,
});

const mapDispatchToProps = (dispatch) => {
  return {
    fetchChannelData: () => dispatch(fetchChannelData)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
