import { useState, useEffect } from "react";
import { Client } from '@twilio/conversations'
import { Button, Input, Label, Stack, TextArea } from "@twilio-paste/core";
import { connect } from "react-redux";

const formatPnForForm = (pn) => `${pn.phoneNumber} [${pn.friendlyName}]`;

const setupConversationClient = (token, setCallStatus) => {

  // See: https://www.twilio.com/docs/voice/tutorials/browser-calls-node-express
  const conversationClient = new Client(token);

  return conversationClient;
}

function SendSmsForm({ devPhonePn, sendSms, twilioAccessToken, channelData }) {
  const [toPn, setToPn] = useState(null);
  const [body, setBody] = useState(null);
  const [conversationClient, setConversationClient] = useState(null)
  const [activeConversation, setActiveConversation] = useState(null)

  const sendIt = () => {
    sendSms(devPhonePn.phoneNumber, toPn, body);
  };

  // TODO: go from the conversation CLient to the Actual Conversation Object
  useEffect(() => {
    // async function getConversationBySid(conversationClient, sid) {
    //   if (conversationClient) {
    //     const conversation = await conversationClient.getConversationBySid(channelData.conversation.sid)
    //     setActiveConversation(conversation)
    //   }
    // }

    const client = setupConversationClient(twilioAccessToken);
    setConversationClient(client);
    // getConversationBySid(conversationClient, channelData.conversation.sid)
}, [twilioAccessToken, channelData.conversation.sid, conversationClient]);

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

const mapStateToProps = (state) => ({
  twilioAccessToken: state.twilioAccessToken,
  channelData: state.channelData
});

export default connect(mapStateToProps)(SendSmsForm);
