import { useEffect } from "react";
import Konami from "konami";
import { connect } from "react-redux";
import { changeNumberInUse, configureNumberInUse } from "./actions";
import PhoneNumberPicker from "./components/PhoneNumberPicker";
import SendSmsForm from "./components/SendSmsForm";
import Caller from "./components/Caller";
import CallHistory from "./components/CallHistory/CallHistory.jsx"

import { Box, Column, Grid, Flex, Stack, Badge, Heading, Separator } from "@twilio-paste/core";

import {
  MediaObject,
  MediaBody,
  MediaFigure,
} from "@twilio-paste/media-object";

import { LogoTwilioIcon } from "@twilio-paste/icons/esm/LogoTwilioIcon";
import { ProductVoiceIcon } from "@twilio-paste/icons/esm/ProductVoiceIcon";


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

function App({
  channelData,
  changeNumberInUse,
  configureNumberInUse,
  numberInUse,
}) {
  useEffect(() => {
    setupKonamiCode();
    if (channelData.phoneNumber) {
      changeNumberInUse(channelData.phoneNumber);
    }
  }, [changeNumberInUse, channelData]);

  return (
    <Box>
      <Grid width="100%">
        <Box 
          width="100%"
          backgroundColor="colorBackgroundBrandHighlight"
          color="colorTextInverse"
        >
          <Flex wrap>
            <Flex hAlignContent="center" vAlignContent="center" padding="space60">
              <MediaObject verticalAlign="center" margin="0" padding="0">
                <MediaFigure as="h1" spacing="space40" margin="0">
                  <LogoTwilioIcon
                    decorative={false}
                    title="Twilio Icon"
                  />
                </MediaFigure>
                <MediaBody as="h2">Dev-Phone</MediaBody>
              </MediaObject>
            </Flex>
            <Flex grow hAlignContent="center" padding="space60">
              <Stack orientation="horizontal" >
                <Heading as="h3" variant="heading30">
                  <Badge variant="default">Dev Phone Name:</Badge>&nbsp;
                    {channelData ? channelData.devPhoneName : "loading"}
                </Heading>
    
                {numberInUse ? (
                  <Separator orientation="vertical" horizontalSpacing="space40" />
                ) : (
                  ""
                )}

                {numberInUse ? (
                  <Heading as="h3" variant="heading30">
                    <Badge variant="default">
                      <ProductVoiceIcon decorative size="sizeIcon10" />
                      Selected Number:</Badge>&nbsp;
                    {numberInUse}
                  </Heading>
                ) : (
                  ""
                )}
              </Stack>
            </Flex>
          </Flex>
            
        </Box>
      </Grid>

      {numberInUse ? (
          <Grid gutter="space30">
            <Column span={3} offset={1}>
              <Caller numberInUse={numberInUse} />
              <CallHistory />
            </Column>
            <Column span={6} offset={1}>
              <SendSmsForm numberInUse={numberInUse} sendSms={sendSms} />
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
