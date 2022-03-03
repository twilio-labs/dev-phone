import { useState, useEffect } from "react";
import { Client, Message } from '@twilio/conversations'
import { Button, Input, Label, Stack, TextArea, Heading, Card, Box, Grid, Column } from "@twilio-paste/core";
import { addMessages } from '../../actions'
import { useSelector, useDispatch } from "react-redux";
import MessageList from "./MessageList"

const setupConversationClient = (token, setCallStatus) => {
  // const debugLogs = {logLevel: 'debug'}
  const conversationClient = new Client(token);
  return conversationClient;
}


function SendSmsForm({ numberInUse, ninetiesMode }) {
  const [messageBody, setBody] = useState(null);
  const [conversationClient, setConversationClient] = useState(null)
  const [activeConversation, setActiveConversation] = useState(null)

  const channelData = useSelector(state => state.channelData)
  const destinationNumber = useSelector(state => state.destinationNumber)
  const twilioAccessToken = useSelector(state => state.twilioAccessToken)
  const dispatch = useDispatch()

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

  const sendIt = async () => {
    sendSms(numberInUse, destinationNumber, messageBody);
    if (activeConversation) {
      await activeConversation.sendMessage(messageBody)
    }
    setBody(null)
  };

  useEffect(() => {
    // Gets conversations and adds a listener to dispatch messages to store
    async function getConversationBySid(conversationClient, sid) {
      try {
        const conversation = await conversationClient.getConversationBySid(sid)
        setActiveConversation(conversation)
        const messages = await conversation.getMessages()
        dispatch(addMessages(messages.items))
        conversation.on('messageAdded', (message) => {
          console.log('Message added!')
          dispatch(addMessages(message))
        })
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

      client.on('connectionError', (data) => {
        console.error(data)
      })
    }


}, [addMessages, activeConversation, twilioAccessToken, channelData.conversation.sid, conversationClient]);

  return (
    <Box width="100%" backgroundColor={"colorBackgroundBody"}>
      <MessageList
        devPhoneName={channelData.devPhoneName}
      />
      <Stack orientation={"vertical"} spacing={"space60"}>
        <Stack orientation={"vertical"}>
          <Label htmlFor="sendSmsBody" required>Message</Label>
          <TextArea id="sendSmsBody" onChange={(e) => setBody(e.target.value)}>
            {messageBody}
          </TextArea>
        </Stack>

        <Button variant="primary" disabled={!destinationNumber || destinationNumber.length < 6} onClick={sendIt}>
          Send it!
        </Button>
      </Stack>
    </Box>

  );
}





export default SendSmsForm;
