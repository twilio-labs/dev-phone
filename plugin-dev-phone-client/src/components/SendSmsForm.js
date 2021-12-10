import { useState, useEffect } from "react";
import { Client } from '@twilio/conversations'
import { Button, Input, Label, Stack, TextArea, Heading } from "@twilio-paste/core";
import { connect } from "react-redux";

const formatPnForForm = (pn) => `${pn.phoneNumber} [${pn.friendlyName}]`;

const setupConversationClient = (token, setCallStatus) => {
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
    async function getConversationBySid(conversationClient, sid) {
      console.log(conversationClient, sid)
      try {
        console.log(conversationClient, sid)
        const conversation = await conversationClient.getConversationBySid(sid)
        console.log('conversation is', conversation)
        setActiveConversation(conversation)
      } catch (error) {
        console.error(error)
      }
    }

    if (!conversationClient) {
      const client = setupConversationClient(twilioAccessToken);
      setConversationClient(client);

      client.on('connectionStateChanged', (connectionState) => {
        if (connectionState === 'connecting') {
          console.log('connecting conversations')
        }

        if (connectionState === "connected") {
          console.log('conversations connected')
          getConversationBySid(client, channelData.conversation.sid)
        }
        if (connectionState === "disconnecting") {
          console.log('conversations disconnecting')
        }
        if (connectionState === "disconnected") {
          console.log('conversations disconnected')
        }
        if (connectionState === "denied") {
          console.log('conversations denied')
        }
      })
    }


}, [activeConversation, twilioAccessToken, channelData.conversation.sid, conversationClient]);

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

const mapStateToProps = (state) => ({
  twilioAccessToken: state.twilioAccessToken,
  channelData: state.channelData
});

export default connect(mapStateToProps)(SendSmsForm);
