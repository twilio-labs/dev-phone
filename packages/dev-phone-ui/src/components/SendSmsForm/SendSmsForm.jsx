import React, { useContext, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Button, Label, Box, Grid, HelpText, Column, AutoScrollPlugin, Flex } from "@twilio-paste/core";
import { ChatComposer } from "@twilio-paste/core/chat-composer";
import { SendIcon } from '@twilio-paste/icons/esm/SendIcon';
import { TwilioConversationsContext } from '../WebsocketManagers/ConversationsManager';
import MessageList from "./MessageList"
import { $getRoot, ClearEditorPlugin, useLexicalComposerContext, CLEAR_EDITOR_COMMAND } from "@twilio-paste/core/lexical-library";



function SendButtonPlugin({ onClick, canSendMessages }) {
  const [editor] = useLexicalComposerContext();

  const sendIt = (e) => {
    onClick(e);
    editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
  }


  return (
    <Button onClick={sendIt} type={"submit"} disabled={!canSendMessages}>
      <SendIcon decorative />
      Send
    </Button>
  )
}

function SendSmsForm({ numberInUse }) {
  const myRef = React.createRef()

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
            style={{ display: "flex" }}
          >
            <Flex horizontal>
              <Flex grow>
                <Box
                >
                  <ClearEditorPlugin />
                </Box>
              </Flex>
              <Flex grow>
                <Box
                  padding="space10"
                  width="100%"
                  display="flex"
                  justifyContent="end"
                >
                  <SendButtonPlugin canSendMessages={canSendMessages} onClick={sendIt} />
                </Box>
              </Flex>
            </Flex>

          </ChatComposer>
          <HelpText id="send_sms_help_text">Enter at most 1600 characters</HelpText>
        </Column>
      </Grid>
    </Box>

  );
}





export default SendSmsForm;
