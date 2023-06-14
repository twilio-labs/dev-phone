import { useState, useEffect } from "react";

import { Anchor, Box, Button, Heading, Label, Option, Select, Stack, Alert, Text, SkeletonLoader, Paragraph, Card } from "@twilio-paste/core";
import WelcomeDialog from "./WelcomeDialog";

const hasExistingSmsConfig = (pn) => {
  return pn.smsUrl && pn.smsUrl !== "https://demo.twilio.com/welcome/sms/reply";
};

const hasExistingVoiceConfig = (pn) => {
  return (
    pn.voiceUrl && pn.voiceUrl !== "https://demo.twilio.com/welcome/voice/"
  );
};

const hasExistingConfig = (pn) => {
  return hasExistingSmsConfig(pn) || hasExistingVoiceConfig(pn);
};

const getSelectLabelForPn = (pn) => {
  const warning = hasExistingConfig(pn) ? "⚠️ " : "";
  return `${warning}${pn.phoneNumber} [${pn.friendlyName}]`;
};

const getPnDetailsByNumber = (pn, allPns) => {
  return allPns.filter((thisPn) => thisPn.phoneNumber === pn)[0];
};

const sortUnconfiguredNumbersFirstThenAlphabetically = (pn1, pn2) => {
  if (hasExistingConfig(pn1) && !hasExistingConfig(pn2)) return 1;
  if (hasExistingConfig(pn2) && !hasExistingConfig(pn1)) return -1;
  return pn1.phoneNumber.localeCompare(pn2.phoneNumber);
};

function PhoneNumberPickerContainer({ children }) {
  return <Box
    maxWidth={"75%"}
    margin={"auto"}
    marginY={"space120"}
    padding={"space120"}
    backgroundColor={"colorBackgroundBody"}
    boxShadow={"shadow"}
    borderRadius={"borderRadius20"}
  >
    {children}
  </Box>
}

function PhoneNumberPicker({ configureNumberInUse, phoneNumbers }) {
  const [twilioPns, setTwilioPns] = useState(null);
  const [selectedPn, setSelectedPn] = useState(null);

  useEffect(() => {
    const asyncNumPicker = async () => {
      if (!selectedPn) {
        try {
          const response = await fetch('/phone-numbers')
          const data = await response.json()
          data["phone-numbers"].sort(
            sortUnconfiguredNumbersFirstThenAlphabetically
          )
          setTwilioPns(data["phone-numbers"]);
          if (data["phone-numbers"].length !== 0) {
            setSelectedPn(
              getPnDetailsByNumber(
                data["phone-numbers"][0].phoneNumber,
                data["phone-numbers"]
              )
            );
          }
        } catch (error) {
          console.error(error)
        }
      }
    }

    asyncNumPicker();
  }, [selectedPn]);

  if (twilioPns === null) {
    return (<SkeletonLoader height={"size50"} />)
  } else if (twilioPns.length === 0) {
    return (
      <PhoneNumberPickerContainer>
        <WelcomeDialog />
        <Stack orientation={"vertical"}>
          <Box width="200px" as="img" src="https://paste.twilio.design/images/patterns/empty-no-results-found.png" alt="" />
          <Heading as="h2" variant="heading20">Could not find any phone numbers.</Heading>
          <Paragraph>In order to use the Dev Phone you'll need to have a Twilio Phone Number. Once you purchased a phone number you can refresh this page to get started.</Paragraph>
          <Button
            as="a"
            href="https://support.twilio.com/hc/en-us/articles/223135247-How-to-Search-for-and-Buy-a-Twilio-Phone-Number-from-Console"
            target="_blank"
          >Purchase a phone number to get started.</Button>
        </Stack>
      </PhoneNumberPickerContainer>
    )
  } else {
    return (
      <PhoneNumberPickerContainer>
        <WelcomeDialog />
        <Stack orientation="vertical">
          <Heading as="h2" variant="heading20">Select a phone number</Heading>
          <Paragraph>
            Pick one of the phone numbers from your Twilio account to configure your Dev Phone. This phone number will be the one to send messages and make calls.
            Any calls and text messages sent to this number will show up in the Dev Phone.
          </Paragraph>
          <Label htmlFor="devPhonePn" required>
            Phone number
          </Label>
          <Select
            id="devPhonePn"
            onChange={(e) =>
              setSelectedPn(getPnDetailsByNumber(e.target.value, twilioPns))
            }
          >
            {twilioPns.map((pn) => (
              <Option key={pn.phoneNumber} value={pn.phoneNumber}>
                {getSelectLabelForPn(pn)}
              </Option>
            ))}
          </Select>
        </Stack>

        {selectedPn ? (
          <Stack orientation="vertical" spacing="space60">
            {hasExistingConfig(selectedPn) ? (
              <Stack orientation="vertical" spacing="space30">
                <Alert variant="warning">
                  This phone number has existing config which will be overwritten
                </Alert>
                {hasExistingSmsConfig(selectedPn) ? (
                  <Text >Configured SMS URL: <em>{selectedPn.smsUrl}</em></Text>
                ) : (
                  ""
                )}
                {hasExistingVoiceConfig(selectedPn) ? (
                  <Text>Configured Voice URL: <em>{selectedPn.voiceUrl}</em></Text>
                ) : (
                  ""
                )}
              </Stack>
            ) : (
              ""
            )}

            <Button variant="primary" onClick={(e) => configureNumberInUse(selectedPn)}>
              Use this phone number
            </Button>
          </Stack>
        ) : (
          ""
        )}
      </PhoneNumberPickerContainer>
    );
  }
}

export default PhoneNumberPicker;
