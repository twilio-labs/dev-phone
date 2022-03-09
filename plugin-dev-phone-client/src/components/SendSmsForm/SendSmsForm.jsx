import { useState, useEffect, useMemo } from "react";
import { Client } from '@twilio/conversations'
import { Button, Input, Label, Box, Grid, Column, HelpText } from "@twilio-paste/core";
import { addMessages } from '../../actions'
import { useSelector, useDispatch } from "react-redux";
import MessageList from "./MessageList"

const setupConversationClient = (token, setCallStatus) => {
  // const debugLogs = {logLevel: 'debug'}
  const conversationClient = new Client(token);
  return conversationClient;
}


function SendSmsForm({ numberInUse }) {
  const [messageBody, setMessageBody] = useState('');
  const [conversationClient, setConversationClient] = useState(null)
  const [activeConversation, setActiveConversation] = useState(null)

  const channelData = useSelector(state => state.channelData)
  const destinationNumber = useSelector(state => state.destinationNumber)
  const twilioAccessToken = useSelector(state => state.twilioAccessToken)
  const dispatch = useDispatch()

  const canSendMessages = useMemo(() => {
    return destinationNumber && destinationNumber.length > 6;
  }, [destinationNumber]);

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

  const sendIt = async (e) => {
    e.preventDefault()
    if (canSendMessages) {
      sendSms(numberInUse, destinationNumber, messageBody);
      if (activeConversation) {
        await activeConversation.sendMessage(messageBody)
      }
      setMessageBody('')
    } else {
      setShowWarning(true)
    }
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
      <form onSubmit={(e) => sendIt(e)} method={"GET"}>
        <Label htmlFor="sendSmsBody" required>Message</Label>
        <Grid gutter={"space20"} marginBottom="space40">
          <Column span={10}>
            <Input id="sendSmsBody" type="text" value={messageBody} placeholder="Enter your message here" onChange={(e) => setMessageBody(e.target.value)} />
            {!canSendMessages && <HelpText id="email_error_help_text" variant="error">Please enter a valid destination phone number above.</HelpText>}
          </Column>
          <Column span={2}>
            <Button type={"submit"} disabled={!canSendMessages}>
              Send
            </Button>
          </Column>
        </Grid>
      </form>
    </Box>

  );
}





export default SendSmsForm;
