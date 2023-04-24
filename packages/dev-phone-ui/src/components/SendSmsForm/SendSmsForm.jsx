import { useContext, useState, useMemo } from "react";
import { Button, Input, Label, Box, Grid, Column } from "@twilio-paste/core";
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

  const inputContainer = {
    boxSizing: "border-box",
    display: "flex",
    width: "100%",
    backgroundColor: "rgb(255, 255, 255)",
    boxShadow: "0 0 0 1px #8891aa",
    borderRadius: "5px",
    transition: "box-shadow 100ms ease-in",
    cursor: "text",
    height: "36px"
  }
  const textAreaStyle = {
    boxSizing: "border-box",
    appearance: "none",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "5px",
    boxShadow: "none",
    color: "inherit",
    cursor: "auto",
    display: "block",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    fontWeight: "500",
    lineHeight: "1.25rem",
    margin: "0",
    outline: "none",
    padding: "0.5rem 0.75rem",
    resize: "none",
    width: "100%",
    whiteSpace: "pre-wrap",
  }


  // Handles the UI state for sending messages
  const sendIt = async (e) => {
    formatMessage(messageBody)
    e.preventDefault()
    if (canSendMessages) {
      sendSms(numberInUse, destinationNumber, messageBody);
      await sendMessage(messageBody)
      setMessageBody('')
    } else {
      setShowWarning(true)
    }
  };

  return (
    <Box width="100%" backgroundColor={"colorBackgroundBody"}>
      <MessageList
        devPhoneName={channelData.devPhoneName}
      />
      <form onSubmit={(e) => sendIt(e)} method={"GET"}>
        <Label htmlFor="sendSmsBody" required>Message</Label>
        <Grid gutter={"space20"} marginBottom="space40">
          <Column span={10}>
            <div style={inputContainer}>
              <textarea style={textAreaStyle} id="sendSmsBody" type="text" value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
            </div>
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
