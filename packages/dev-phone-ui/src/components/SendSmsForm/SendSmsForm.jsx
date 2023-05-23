import { useContext, useState, useEffect, useMemo } from "react";
import { Button, Input, Label, Box, Grid, TextArea, HelpText, Column } from "@twilio-paste/core";
import { ChatComposer } from "@twilio-paste/core/chat-composer";
import { SendIcon } from '@twilio-paste/icons/esm/SendIcon';
import { useSelector } from "react-redux";
import { TwilioConversationsContext } from '../WebsocketManagers/ConversationsManager';
import MessageList from "./MessageList"

function SendSmsForm({ numberInUse }) {
  const [messageBody, setMessageBody] = useState('');

  const channelData = useSelector(state => state.channelData)
  const destinationNumber = useSelector(state => state.destinationNumber)

  const conversationsClient = useContext(TwilioConversationsContext)
  const { sendMessage, sendSms } = conversationsClient

  const canSendMessages = useMemo(() => {
    return destinationNumber && destinationNumber.length > 6;
  }, [destinationNumber]);


  // Handles the UI state for sending messages
  const sendIt = async (e) => {
    e.preventDefault()
    if (canSendMessages) {
      sendSms(numberInUse, destinationNumber, messageBody);
      await sendMessage(messageBody)
      setMessageBody('')
    } else {
      setShowWarning(true)
    }
  };


  const handleChange = (e) => {
    setMessageBody(e.target.value)
  }

  return (
    <Box width="100%" backgroundColor={"colorBackgroundBody"}>
      <MessageList
        devPhoneName={channelData.devPhoneName}
      />
      <form onSubmit={(e) => sendIt(e)} method={"GET"}>
        <Label htmlFor="sendSmsBody" required>Message</Label>

        <Grid gutter={"space20"} marginBottom="space40">
          <Column span={10}>
          <ChatComposer config={{namespace: ''}} onChange={handleChange} placeholder="Chat text" ariaLabel="A basic chat composer" />
            <TextArea resize="vertical" maxLength={1600} id="sendSmsBody" type="text" onChange={(e) => setMessageBody(e.target.value)} aria-describedby="send_sms_help_text" required />
            <HelpText id="send_sms_help_text">Enter at most 1600 characters</HelpText>
          </Column>
          <Column span={2}>
            <Button type={"submit"} disabled={!canSendMessages}>
              <SendIcon decorative />
              Send
            </Button>
          </Column>
        </Grid>


      </form>
    </Box>

  );
}





export default SendSmsForm;
