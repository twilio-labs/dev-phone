import React, { useContext, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Label, Box, Grid, HelpText, Column, AutoScrollPlugin } from "@twilio-paste/core";
import { ChatComposer } from "@twilio-paste/core/chat-composer";
import { TwilioConversationsContext } from '../WebsocketManagers/ConversationsManager';
import MessageList from "./MessageList"
import { $getRoot, ClearEditorPlugin } from "@twilio-paste/core/lexical-library";
import SendButtonPlugin from "./SendButtonPlugin";

// Top-level container for Dev Phone SMS
function SendSmsForm({ numberInUse }) {
  const [messageBody, setMessageBody] = useState('');

  const channelData = useSelector(state => state.channelData)
  const destinationNumber = useSelector(state => state.destinationNumber)

  const conversationsClient = useContext(TwilioConversationsContext)
  const { sendMessage, sendSms } = conversationsClient

  const canSendMessages = useMemo(() => {
    return destinationNumber && destinationNumber.length > 6;
  }, [destinationNumber]);

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
    <Box width="100%" backgroundColor={"default"} overflowX="hidden" overflowY="auto">
      <MessageList
        devPhoneName={channelData.devPhoneName}
      />
      <Label htmlFor="sendSmsBody" required>Message</Label>

      <Grid gutter={"space20"} marginBottom="space40">
        <Column span={12}>
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
              element="SEND_SMS_COMPOSER"
            >
              <ClearEditorPlugin />
              <SendButtonPlugin canSendMessages={canSendMessages} onClick={sendIt} />
            </ChatComposer>
          <HelpText id="send_sms_help_text">Enter at most 1600 characters</HelpText>
        </Column>
      </Grid>
    </Box>

  );
}

export default SendSmsForm;
