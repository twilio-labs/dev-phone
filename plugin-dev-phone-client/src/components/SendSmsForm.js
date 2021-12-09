import { useState } from "react";
import { Button, Input, Label, Stack, TextArea, Heading } from "@twilio-paste/core";

function SendSmsForm({ devPhonePn, sendSms }) {
  const [toPn, setToPn] = useState(null);
  const [body, setBody] = useState(null);

  const sendIt = () => {
    sendSms(devPhonePn.phoneNumber, toPn, body);
  };

  return (
    <Stack orientation="vertical" spacing="space60">

      <Heading as="h2" variant="heading20">SMS messaging</Heading>

      <Stack orientation="vertical">
        <Label htmlFor="sendSmsToPn" required>To</Label>
        <Input
          type="text"
          id="sendSmsToPn"
          placeholder="E.164 format please"
          defaultValue={toPn}
          onChange={(e) => setToPn(e.target.value)} />
      </Stack>

      <Stack orientation="vertical">
        <Label htmlFor="sendSmsBody" required>Message</Label>
        <TextArea id="sendSmsBody" onChange={(e) => setBody(e.target.value)} />
      </Stack>

      <Button variant="primary" disabled={!toPn || toPn.length < 6} onClick={sendIt}>
        Send it!
      </Button>
    </Stack>
  );
}

export default SendSmsForm;
