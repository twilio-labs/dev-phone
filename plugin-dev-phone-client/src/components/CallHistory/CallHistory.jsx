import { useState, useEffect } from "react";
import { SyncClient } from 'twilio-sync';
import { Box, Stack, Heading, Paragraph } from "@twilio-paste/core";
import { connect } from "react-redux";
import { addCallRecord, updateCallRecord } from '../../actions'

const formatPnForForm = (pn) => `${pn.phoneNumber} [${pn.friendlyName}]`;

const setupSyncClient = (token) => {
  const debugLogs = {logLevel: 'debug'}
  const syncClient =  new SyncClient(token, debugLogs);
  return syncClient
}

function CallHistory({ callLog, addCallRecord, twilioAccessToken, updateCallRecord }) {
  const [syncClient, setSyncClient] = useState(null)

  useEffect(() => {

    async function configureCallLog(client) {
        // TODO: Maybe don't hardcode the CallLog map name
        const callLog = await client.map('CallLog')

        callLog.on('itemAdded', async (syncMapItem) => {
            const item = await syncMapItem.item
            addCallRecord(item.data)
        })

        callLog.on('itemUpdated', async (syncMapItem) => {
            const item = await syncMapItem.item
            updateCallRecord(item.data)
        })
    }

    if (!syncClient) {
      const syncClient = setupSyncClient(twilioAccessToken);
      setSyncClient(syncClient);
      configureCallLog(syncClient)
    }


}, [addCallRecord, setSyncClient, syncClient, twilioAccessToken, updateCallRecord]);

  return (
    <Stack orientation="vertical" spacing="space30">
      <Heading as="h2" variant="heading20">Call History</Heading>
        <Stack orientation="vertical" spacing="space30">
          {callLog.length > 0 ?
            callLog.map(call => {
                return (
                    <Box key={call.Sid} padding="space30">
                        <Paragraph marginBottom={"space0"}><strong>From:</strong> {call.From} <strong>To:</strong> {call.To}</Paragraph>
                        <Paragraph marginBottom={"space0"}><strong>Status:</strong> {call.Status} </Paragraph>
                        <Paragraph marginBottom={"space0"}><strong>Call Sid:</strong> {call.Sid}</Paragraph>
                        <Paragraph marginBottom={"space0"}><strong>Timestamp:</strong> {call.Timestamp}</Paragraph>
                    </Box>
                )
            }) : ''
          }
        </Stack>
    </Stack>
  );
}

const mapStateToProps = (state) => ({
  twilioAccessToken: state.twilioAccessToken,
  callLog: state.callLog
});

const mapDispatchToProps = (dispatch) => ({
  addCallRecord: (call) => dispatch(addCallRecord(call)),
  updateCallRecord: (call) => dispatch(updateCallRecord(call)),
})

export default connect(mapStateToProps, mapDispatchToProps)(CallHistory);
