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

function CallHistory({ addCallRecord, twilioAccessToken }) {
  const [callList, setCallList] = useState([]);
  const [syncClient, setSyncClient] = useState(null)

  useEffect(() => {

    async function configureCallLog(client) {
        const callLog = await client.map('CallLog')

        callLog.on('itemAdded', (syncMapItem) => {
            addCallRecord(syncMapItem.data)
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
      {["Hello", "Hello2"].map(call => {
          <Box></Box>
      })}
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
