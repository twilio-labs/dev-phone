import { useState, useEffect } from "react";
import { SyncClient } from 'twilio-sync';
import { Box, Stack, Heading } from "@twilio-paste/core";
import { connect } from "react-redux";
import { addCallRecord } from '../../actions'

const formatPnForForm = (pn) => `${pn.phoneNumber} [${pn.friendlyName}]`;

const setupSyncClient = (token) => {
  const debugLogs = {logLevel: 'debug'}
  const syncClient =  new SyncClient(token, debugLogs);
  return syncClient
}

function CallHistory({ callLog, addCallRecord, twilioAccessToken }) {
  const [syncClient, setSyncClient] = useState(null)

  useEffect(() => {

    async function configureCallLog(client) {
        // TODO: Maybe don't hardcode the CallLog map name
        const callLog = await client.map('CallLog')

        console.log('checking for existing logs')
        const existingLogs = await callLog.getItems()
        console.log(existingLogs)

        existingLogs.items.forEach(call => {
            addCallRecord(call.data)
        })

        callLog.on('itemAdded', async (syncMapItem) => {
            const item = await syncMapItem.item
            console.log('raw sync map item', syncMapItem, item)
            addCallRecord(item.data)
        })
    }

    if (!syncClient) {
      const syncClient = setupSyncClient(twilioAccessToken);
      setSyncClient(syncClient);
      configureCallLog(syncClient)
    }


}, [addCallRecord, setSyncClient, syncClient, twilioAccessToken]);

  return (
    <Stack orientation="vertical" spacing="space60">
      <Heading as="h2" variant="heading20">Call History</Heading>
      {callLog.length > 0 ? 
        callLog.map(call => {
            return <Box key={call.Sid}>
              <p>{call.From}</p>
              <p>{call.To}</p>
              <p>{call.Status}</p>
              <p>{call.Sid}</p></Box>
        }) : ''
      }
    </Stack>
  );
}

const mapStateToProps = (state) => ({
  twilioAccessToken: state.twilioAccessToken,
  callLog: state.callLog
});

const mapDispatchToProps = (dispatch) => ({
  addCallRecord: (call) => dispatch(addCallRecord(call))
})

export default connect(mapStateToProps, mapDispatchToProps)(CallHistory);
