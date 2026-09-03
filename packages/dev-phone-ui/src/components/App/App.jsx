import { useEffect, useState } from "react";
import Konami from "konami";
import { useSelector, useDispatch } from "react-redux";
import { changeNumberInUse, configureNumberInUse } from "../../actions";
import Header from "../Header/Header"
import PhoneNumberPicker from "../PhoneNumberPicker/PhoneNumberPicker";
import DevDisclaimer from "../DevDisclaimer/DevDisclaimer";
import Softphone from "../Softphone/Softphone"
import CallStatusBar from "../CallStatusBar/CallStatusBar"
import DebugConsole from "../DebugConsole/DebugConsole";
import TwilioVoiceManager from "../WebsocketManagers/VoiceManager";

import { Box, Column, Grid } from "@twilio-paste/core";
import Footer from "../Footer/Footer";

const setupKonamiCode = (setNinetiesMode) => {
  const ninetiesMode = new Konami(() => {
    // window.alert("Lets party like it's 1991!");
    setNinetiesMode(true)
  });
  ninetiesMode.pattern = "383840403739373949575749";
};

function App() {
  const channelData = useSelector(state => state.channelData)
  const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "")
  const dispatch = useDispatch()

  const [ninetiesMode, setNinetiesMode] = useState(false);

  useEffect(() => {
    setupKonamiCode(setNinetiesMode);
    if (channelData.phoneNumber) {
      dispatch(changeNumberInUse(channelData.phoneNumber));
    }
  }, [changeNumberInUse, channelData]);

  return (
    <Box width={"100vw"} minHeight={"100vh"} backgroundColor={"colorBackground"}>
      <Header devPhoneName={channelData.devPhoneName} numberInUse={numberInUse} />
      {channelData.devPhoneName && (
        <>
          <style>{`
            @keyframes waitingSweep {
              0%   { background-position: 0% 50%; }
              100% { background-position: 100% 50%; }
            }
          `}</style>
          <Box
            width="100%"
            height="11px"
            style={{
              background: 'linear-gradient(90deg, #c8e6fa, #0263e0, #004099, #0263e0, #c8e6fa)',
              backgroundSize: '200% 100%',
              animation: 'waitingSweep 2.5s ease-in-out infinite alternate',
            }}
          />
        </>
      )}
      {numberInUse ? (
        <TwilioVoiceManager>
          <DevDisclaimer />
          <CallStatusBar />
          <Softphone numberInUse={numberInUse} />
        </TwilioVoiceManager>
      ) : (
        <>
          <DevDisclaimer />
          <CallStatusBar />
          <Grid gutter="space30">
            <Column span={6} offset={3}>
              <PhoneNumberPicker configureNumberInUse={(number) => dispatch(configureNumberInUse(number))} />
            </Column>
          </Grid>
        </>
      )}
      <Footer />
      <DebugConsole />
    </Box>
  )
}

export default App
