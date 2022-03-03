import { useState, useEffect } from "react";

import {
  Box,
  Button,
  Heading,
  Label,
  Option,
  Select,
  Stack,
  Alert,
  Text,
  Card,
  SkeletonLoader
} from "@twilio-paste/core";

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

function PhoneNumberPicker({ configureNumberInUse, phoneNumbers }) {
  const [twilioPns, setTwilioPns] = useState(null);
  const [selectedPn, setSelectedPn] = useState(null);

  useEffect(async() => {
    if(!selectedPn) {
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
        
  }, [selectedPn]);
  
  if (twilioPns === null) {
    return (<SkeletonLoader height={"size50"}/>)
  } else if (twilioPns.length === 0) {
    return (
      <Box backgroundColor={"colorBackgroundBody"}>
        <Text as="p">I couldn't find any phone numbers on your account!</Text>
        <Anchor
          href="https://support.twilio.com/hc/en-us/articles/223135247-How-to-Search-for-and-Buy-a-Twilio-Phone-Number-from-Console"
          target="_blank"
        >Please purchase a phone number to get started. :)</Anchor>
      </Box>
      )
  } else {
    return (
      <Box backgroundColor={"colorBackgroundBody"} padding={"space120"}>
        <Heading as="h2" variant="heading20">Choose a phone number for this dev-phone</Heading>
        <Stack orientation="vertical">
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
      </Box>
    );
  }
}

export default PhoneNumberPicker;
