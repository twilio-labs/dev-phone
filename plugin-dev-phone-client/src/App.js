import { useEffect } from "react";
import Konami from "konami";
import { connect } from "react-redux";
import { changeNumberInUse, configureNumberInUse } from './actions'
import PhoneNumberPicker from './components/PhoneNumberPicker'
import SendSmsForm from './components/SendSmsForm';
import Caller from './components/Caller';

import {
  Box,
  Column,
  Flex,
  Grid,
  Stack,
  Heading,
  Text,
} from "@twilio-paste/core";

const formatPnForForm = (number) => `${number} [${number}]`;

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

function App({ channelData, changeNumberInUse, configureNumberInUse, numberInUse }) {
  useEffect(() => {
    setupKonamiCode();
    if(channelData.phoneNumber) {
      changeNumberInUse(channelData.phoneNumber)
    }
  }, [changeNumberInUse, channelData]);

  return (
    <Grid padding="space30">
      <Column span={12}>
        <Flex>
          <Flex>
            <Box padding="space40">
              <Heading as="h1" variant="heading20">Twilio dev-phone</Heading>
            </Box>
          </Flex>
          <Flex grow>
            <Box
              padding="space40"
              width="100%"
            >
              <Text>
                This is{" "}
                {channelData ? channelData.devPhoneName : "loading"}
              </Text>
              {numberInUse ? (
                <Text>We are {formatPnForForm(numberInUse)}</Text>
              ) : (
                ""
              )}
            </Box>
          </Flex>
        </Flex>
        <header></header>
      </Column>
      <Column span={8} offset={2}>
        {numberInUse ? (
          <Stack orientation="vertical" spacing="space60">
            <SendSmsForm numberInUse={numberInUse} sendSms={sendSms} />
            <Caller numberInUse={numberInUse} />
          </Stack>
        ) : (
          <PhoneNumberPicker configureNumberInUse={configureNumberInUse} />
        )}
      </Column>
    </Grid>
  );
}

const mapStateToProps = (state) => ({
  channelData: state.channelData,
  numberInUse: state.numberInUse ? state.numberInUse.phoneNumber : ''
});

const mapDispatchToProps = (dispatch) => ({
  changeNumberInUse: (number) => dispatch(changeNumberInUse(number)),
  configureNumberInUse: (number) => dispatch(configureNumberInUse(number))
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
