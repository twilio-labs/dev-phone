import { useState, useEffect } from "react";
import { Client } from '@twilio/conversations'
import { Button, Input, Label, Stack, TextArea, Heading, Card, Box, Grid, Column } from "@twilio-paste/core";
import { connect } from "react-redux";
import { addMessages } from '../actions'

const setupConversationClient = (token, setCallStatus) => {
  // const debugLogs = {logLevel: 'debug'}
  const conversationClient = new Client(token);
  return conversationClient;
}

function SendSmsForm({ addMessages, numberInUse, messageList, sendSms, twilioAccessToken, channelData, ninetiesMode }) {
  const [toPn, setToPn] = useState(null);
  const [messageBody, setBody] = useState(null);
  const [conversationClient, setConversationClient] = useState(null)
  const [activeConversation, setActiveConversation] = useState(null)

  const sendIt = async () => {
    sendSms(numberInUse, toPn, messageBody);
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
        addMessages(messages.items)
        conversation.on('messageAdded', (message) => {
          console.log('Message added!')
          addMessages(message)
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
    <Box
      padding="space60"
      width="100%"
    >
      <Stack orientation="vertical" spacing="space60">

        <Heading as="h2" variant="heading20">{ninetiesMode ? "📟 Page me later" : "SMS messaging" }</Heading>

        <Box>
          <Card>
            <Stack orientation={"vertical"} spacing={"space60"}>
              <Stack>
                <Label htmlFor="sendSmsToPn" required>To</Label>
                <Input
                  type="text"
                  id="sendSmsToPn"
                  placeholder="E.164 format please"
                  defaultValue={toPn}
                  onChange={(e) => setToPn(e.target.value)} />
              </Stack>
              <Stack>
                <Label htmlFor="sendSmsBody" required>Message</Label>
                <TextArea id="sendSmsBody" onChange={(e) => setBody(e.target.value)} />
              </Stack>

              <Button variant="primary" disabled={!toPn || toPn.length < 6} onClick={sendIt}>
                Send it!
              </Button>
            </Stack>
          </Card>
        </Box>

        <Card>
          <Heading as="h2" variant="heading20">{ninetiesMode ? "📌 Messageboard" : "SMS Log"}</Heading>

          <Box maxHeight={'20rem'} overflowY={'scroll'} overflowX={'hidden'}>
            {/* TODO: Turn this into a Message List component */}
            {messageList.length > 0 ?
              messageList.map((message, i) => {
                return (
                  <Grid key={message.sid} padding="space30">
                    <Column span={8} offset={message.author === channelData.devPhoneName ? 4 : 0}>
                      <Box padding="space30">
                        <Card>
                          {message.author}: {message.body}
                        </Card>
                      </Box>
                    </Column>
                  </Grid>
                )
              })
              : 'Go ahead and send your first message!'
            }
          </Box>
        </Card>
      </Stack>
    </Box>

  );
}

const mapStateToProps = (state) => ({
  twilioAccessToken: state.twilioAccessToken,
  channelData: state.channelData,
  messageList: state.messageList,
});

const mapDispatchToProps = (dispatch) => ({
  addMessages: (messages) => dispatch(addMessages(messages))
})

export default connect(mapStateToProps, mapDispatchToProps)(SendSmsForm);
