import { useEffect, useState } from "react";
import Konami from "konami";

import PhoneNumberPicker from "./components/PhoneNumberPicker";
import SendSmsForm from "./components/SendSmsForm";
import Caller from "./components/Caller";

import {
  Box,
  Column,
  Flex,
  Grid,
  Stack,
  Heading,
  Text,
} from "@twilio-paste/core";

const formatPnForForm = (pn) => `${pn.phoneNumber} [${pn.friendlyName}]`;

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

function App() {
  const [devPhonePn, setDevPhonePn] = useState(null);
  const [pluginSettings, setPluginSettings] = useState(null);

  useEffect(() => {
    setupKonamiCode();

    fetch("/plugin-settings")
      .then((res) => res.json())
      .then((settings) => {
        setPluginSettings(settings);
        if (settings.phoneNumber) {
          setDevPhonePn(settings.phoneNumber);
        }
      });
  }, []);

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
                {pluginSettings ? pluginSettings.devPhoneName : "loading"}
              </Text>
              {devPhonePn ? (
                <Text>We are {formatPnForForm(devPhonePn)}</Text>
              ) : (
                ""
              )}
            </Box>
          </Flex>
        </Flex>
        <header></header>
      </Column>
      <Column span={8} offset={2}>
        {devPhonePn ? (
          <Stack orientation="vertical" spacing="space60">
            <SendSmsForm devPhonePn={devPhonePn} sendSms={sendSms} />
            <Caller devPhonePn={devPhonePn} />
          </Stack>
        ) : (
          <PhoneNumberPicker setDevPhonePn={setDevPhonePn} />
        )}
      </Column>
    </Grid>
  );
}

export default App;
