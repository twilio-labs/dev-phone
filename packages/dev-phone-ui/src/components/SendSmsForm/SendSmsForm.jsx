import { useContext, useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Button, Input, Label, Box, Grid, TextArea, HelpText, Column, AutoScrollPlugin } from "@twilio-paste/core";
import { ChatComposer } from "@twilio-paste/core/chat-composer";
import { SendIcon } from '@twilio-paste/icons/esm/SendIcon';
import {
  $getRoot
} from "@twilio-paste/lexical-library";
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


  const myOnChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      setMessageBody(root.getTextContent());
    });
  };


  return (
    <Box width="100%" backgroundColor={"default"}>
      <MessageList
        devPhoneName={channelData.devPhoneName}
      />
      <Label htmlFor="sendSmsBody" required>Message</Label>

      <Grid gutter={"space20"} marginBottom="space40">
        <Column span={10}>
          <ChatComposer
            config={{
              namespace: "send_sms",
              onError: (e) => {
                throw e;
              }
            }}
            placeholder="Chat text"
            ariaLabel="A basic chat composer"
            onChange={myOnChange}
          >
          </ChatComposer>
          <HelpText id="send_sms_help_text">Enter at most 1600 characters</HelpText>
        </Column>
        <Column span={2}>
          <Button onClick={sendIt} type={"submit"} disabled={!canSendMessages}>
            <SendIcon decorative />
            Send
          </Button>
        </Column>
      </Grid>
    </Box>

  );
}





export default SendSmsForm;
