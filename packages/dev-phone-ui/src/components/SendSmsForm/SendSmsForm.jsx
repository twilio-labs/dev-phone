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
  const {sendMessage, sendSms} = conversationsClient

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

  return (
    <Box width="100%" backgroundColor={"colorBackgroundBody"}>
      <MessageList
        devPhoneName={channelData.devPhoneName}
      />
      <form onSubmit={(e) => sendIt(e)} method={"GET"}>
        <Label htmlFor="sendSmsBody" required>Message</Label>
        <Grid gutter={"space20"} marginBottom="space40">
          <Column span={10}>
            <Input id="sendSmsBody" type="text" value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
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
