import { useEffect, useState } from "react";
import Konami from "konami";
import { connect } from "react-redux";
import { changeNumberInUse, configureNumberInUse } from "../../actions";
import Header from "../Header/Header"
import PhoneNumberPicker from "../PhoneNumberPicker/PhoneNumberPicker";
import SendSmsForm from "../SendSmsForm/SendSmsForm";
import TwilioVoiceManager from "../VoiceManager/VoiceManager";
import Dialer from "../Dialer/Dialer";
import CallHistory from "../CallHistory/CallHistory.jsx"

import { Box, Column, Grid, Flex, Stack, Badge, Heading, Separator } from "@twilio-paste/core";
import PhoneNumberInput from "../PhoneNumberInput/PhoneNumberInput";

const setupKonamiCode = (setNinetiesMode) => {
  const ninetiesMode = new Konami(() => {
    // window.alert("Lets party like it's 1991!");
    setNinetiesMode(true)
  });
  ninetiesMode.pattern = "383840403739373949575749";
};

function App({
  channelData,
  changeNumberInUse,
  configureNumberInUse,
  numberInUse,
}) {

  const [ninetiesMode, setNinetiesMode] = useState(false);

  useEffect(() => {
    setupKonamiCode(setNinetiesMode);
    if (channelData.phoneNumber) {
      changeNumberInUse(channelData.phoneNumber);
    }
  }, [changeNumberInUse, channelData]);

  return (
    <Box width={"100vw"} height={"100vh"} backgroundColor={"colorBackground"}>
      <Header devPhoneName={channelData.devPhoneName} numberInUse={numberInUse}/>
      {numberInUse ? (
        <Grid gutter="space30">
          <Column span={4}>
            <CallHistory ninetiesMode={ninetiesMode} />
          </Column>
          <Column span={8}>
            <PhoneNumberInput />
            <Grid gutter="space30">
              <Column span={4}>
                <TwilioVoiceManager>
                  <Dialer ninetiesMode={ninetiesMode} />
                </TwilioVoiceManager>
              </Column>
              <Column span={8}>
                <SendSmsForm numberInUse={numberInUse} ninetiesMode={ninetiesMode} />
              </Column>
            </Grid>
          </Column>
        </Grid>
      ) : (
        <Grid gutter="space30">
          <Column span={6} offset={3}>
            <PhoneNumberPicker configureNumberInUse={configureNumberInUse} />
          </Column>
        </Grid>
      )}
    </Box>

  );
}

const mapStateToProps = (state) => ({
  channelData: state.channelData,
  numberInUse: state.numberInUse ? state.numberInUse.phoneNumber : "",
});

const mapDispatchToProps = (dispatch) => ({
  changeNumberInUse: (number) => dispatch(changeNumberInUse(number)),
  configureNumberInUse: (number) => dispatch(configureNumberInUse(number)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
