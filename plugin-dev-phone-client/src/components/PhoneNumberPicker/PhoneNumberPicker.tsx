import { useState, useEffect } from "react";

import {
  Button,
  Heading,
  Label,
  Option,
  Select,
  Stack,
  Alert,
  Text,
  Card
} from "@twilio-paste/core";
import { useDispatch } from "react-redux";
import { configureNumberInUse } from "../../actions";


interface phoneNumber {
  smsUrl: string,
  voiceUrl: string,
  phoneNumber: string,
  friendlyName: string
}

const hasExistingSmsConfig = (pn: phoneNumber) => {
  return pn.smsUrl && pn.smsUrl !== "https://demo.twilio.com/welcome/sms/reply";
};

const hasExistingVoiceConfig = (pn: phoneNumber) => {
  return (
    pn.voiceUrl && pn.voiceUrl !== "https://demo.twilio.com/welcome/voice/"
  );
};

const hasExistingConfig = (pn: phoneNumber) => {
  return hasExistingSmsConfig(pn) || hasExistingVoiceConfig(pn);
};

const getSelectLabelForPn = (pn: phoneNumber) => {
  const warning = hasExistingConfig(pn) ? "⚠️ " : "";
  return `${warning}${pn.phoneNumber} [${pn.friendlyName}]`;
};

const getPnDetailsByNumber = (pn: string, allPns: phoneNumber[]) => {
  return allPns.filter((thisPn) => thisPn.phoneNumber === pn)[0];
};

const sortUnconfiguredNumbersFirstThenAlphabetically = (pn1: phoneNumber, pn2: phoneNumber) => {
  if (hasExistingConfig(pn1) && !hasExistingConfig(pn2)) return 1;
  if (hasExistingConfig(pn2) && !hasExistingConfig(pn1)) return -1;
  return pn1.phoneNumber.localeCompare(pn2.phoneNumber);
};

function PhoneNumberPicker() {
  const [twilioPns, setTwilioPns] = useState<null | phoneNumber[]>(null);
  const [chosenPn, setChosenPn] = useState<null | phoneNumber>(null);
  const dispatch = useDispatch()

  useEffect(() => {
    if(chosenPn) {
      return 
    }

    async function getPhoneNumbers() {
      const phoneNumbers = await fetch("/phone-numbers").then((res) => res.json())
      phoneNumbers["phone-numbers"].sort(
          sortUnconfiguredNumbersFirstThenAlphabetically
        )
      setTwilioPns(phoneNumbers["phone-numbers"]);
      if (phoneNumbers["phone-numbers"].length !== 0) {
        setChosenPn(
          getPnDetailsByNumber(
            phoneNumbers["phone-numbers"][0].phoneNumber,
            phoneNumbers["phone-numbers"]
          )
        );
      }
    };

    getPhoneNumbers()
  }, [chosenPn]);

  if (twilioPns === null) {
    return "loading phone numbers...";
  } else if (twilioPns.length === 0) {
    return "you have no phone numbers, please buy one (TODO: implement the 'buy' flow)";
  } else {
    return (
      <Card padding="space90">

        <Stack orientation="vertical" spacing="space60">

          <Heading as="h2" variant="heading20">Choose a phone number for this dev-phone</Heading>

          <Stack orientation="vertical" spacing="space60">
            <Label htmlFor="devPhonePn" required>
              Phone number
            </Label>
            <Select
              id="devPhonePn"
              onChange={(e) =>
                setChosenPn(getPnDetailsByNumber(e.target.value, twilioPns))
              }
            >
            {twilioPns.map((pn: phoneNumber) => (
              <Option key={pn.phoneNumber} value={pn.phoneNumber}>
                {getSelectLabelForPn(pn)}
              </Option>
            ))}
            </Select>
          </Stack>

          {chosenPn ? (
            <Stack orientation="vertical" spacing="space60">
              {hasExistingConfig(chosenPn) ? (
                <Stack orientation="vertical" spacing="space30">
                  <Alert variant="warning">
                    This phone number has existing config which will be overwritten
                  </Alert>
                  {hasExistingSmsConfig(chosenPn) ? (
                    <Text as="p" >Configured SMS URL: <em>{chosenPn.smsUrl}</em></Text>
                  ) : (
                    ""
                  )}
                  {hasExistingVoiceConfig(chosenPn) ? (
                    <Text as="p">Configured Voice URL: <em>{chosenPn.voiceUrl}</em></Text>
                  ) : (
                    ""
                  )}
                </Stack>
              ) : (
                ""
              )}

              <Button variant="primary" onClick={(e) => dispatch(configureNumberInUse(chosenPn))}>
                Use this phone number
              </Button>
            </Stack>
          ) : (
            ""
          )}
        </Stack>
      </Card>
    );
  }
}

export default PhoneNumberPicker;
