import { useEffect, useState } from "react";
import Konami from "konami";
import { useSelector, useDispatch } from "react-redux";
import { changeNumberInUse, configureNumberInUse } from "../../actions";
import Header from "../Header/Header"
import PhoneNumberPicker from "../PhoneNumberPicker/PhoneNumberPicker";
import DevDisclaimer from "../DevDisclaimer/DevDisclaimer";
import Softphone from "../Softphone/Softphone"

import { Box, Column, Grid, Flex } from "@twilio-paste/core";
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
      <DevDisclaimer />
      {numberInUse ? (
        <Softphone numberInUse={numberInUse} />
      ) : (
        <Grid gutter="space30">
          <Column span={6} offset={3}>
            <PhoneNumberPicker configureNumberInUse={(number) => dispatch(configureNumberInUse(number))} />
          </Column>
        </Grid>
      )}
      <Footer />
    </Box>
  )
}

export default App
