import React, { useContext, useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Button, Input, Label, Box, Grid, TextArea, HelpText, Column, AutoScrollPlugin } from "@twilio-paste/core";
import { ChatComposer } from "@twilio-paste/core/chat-composer";
import { SendIcon } from '@twilio-paste/icons/esm/SendIcon';
import {$getRoot, $createParagraphNode, $createTextNode} from '@twilio-paste/lexical-library';
import { TwilioConversationsContext } from '../WebsocketManagers/ConversationsManager';
import MessageList from "./MessageList"
import { CLEAR_HISTORY_COMMAND } from "lexical";

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

  const editorStateRef = useRef();

  // const messageSent = useMemo(() =>{
  //   return 
  // })

  const disabledInitialText = () => {
    const root = $getRoot();

    if (root.getFirstChild() !== null) {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode('').toggleFormat('italic'));
  
      root.append(paragraph);
    }
  };

  // Hansdles the UI state for sending messages
  const sendIt = async (editorState) => {
    console.log("ROOT", editorState);
    editorState.read(() =>{
      const root = $getRoot();
      setMessageBody(root.getTextContent())
    })
    // editorState.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    // editorState.read(() => {
    //   const root = $getRoot();
    //   setMessageBody(root.getTextContent());
    // });
    // console.log("Current editor state", editorStateRef)
    // e.preventDefault()
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
    // create an event listener that looks for a submission and then clears the editor state
    // component will need to recognize thaat the message body become null and we'll need to null out the chatcomposer
   
    <Box  width="100%" backgroundColor={"default"}>
      <MessageList
        devPhoneName={channelData.devPhoneName}
      />
      <Label htmlFor="sendSmsBody" required>Message</Label>

      <Grid gutter={"space20"} marginBottom="space40">
        <Column span={10}>
          <ChatComposer
            config={{
              editorState: disabledInitialText,
              namespace: "send_sms",
              onError: (e) => {
                throw e;
              }
            }}
            placeholder="Chat text"
            ariaLabel="A basic chat composer"
            onChange={editorState => editorStateRef.current = editorState}
          >
          </ChatComposer>
          <HelpText id="send_sms_help_text">Enter at most 1600 characters</HelpText>
        </Column>
        <Column span={2}>
          <Button onClick={() => {
            if(editorStateRef.current) {
              sendIt(editorStateRef.current)
            }
          }} type={"submit"} disabled={!canSendMessages}>
            <SendIcon decorative />
            Send
          </Button>
        </Column>
      </Grid>
    </Box>

  );
}





export default SendSmsForm;
