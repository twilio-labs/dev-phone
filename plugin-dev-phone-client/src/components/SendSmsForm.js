import { useState } from "react";
import { Button, Input, Label, Stack, TextArea } from "@twilio-paste/core";

const formatPnForForm = (pn) => `${pn.phoneNumber} [${pn.friendlyName}]`;

function SendSmsForm({ devPhonePn, sendSms }) {
  const [toPn, setToPn] = useState(null);
  const [body, setBody] = useState(null);

  const sendIt = () => {
    sendSms(devPhonePn.phoneNumber, toPn, body);
  };

  return (
    <Stack orientation="vertical" spacing="space60">
      <Label htmlFor="sendSmsFromPn">From</Label>
      <Input
        id="sendSmsFromPn"
        disabled={true}
        value={formatPnForForm(devPhonePn)}
      />

      <Label htmlFor="sendSmsToPn">To</Label>
      <Input
        id="sendSmsToPn"
        placeholder="E.164 format please"
        defaultValue={toPn}
        onChange={(e) => setToPn(e.target.value)}
      />

      <Label htmlFor="sendSmsBody">Message</Label>
      <TextArea id="sendSmsBody" onChange={(e) => setBody(e.target.value)} />

      <Button variant="primary" onClick={sendIt}>
        Send it!
      </Button>
    </Stack>
  );
}

export default SendSmsForm;
