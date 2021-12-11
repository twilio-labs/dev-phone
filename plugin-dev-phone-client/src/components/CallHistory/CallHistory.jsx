import { useState, useEffect } from "react";
import { SyncClient } from 'twilio-sync';
import { Box, Card, Heading, Text } from "@twilio-paste/core";
import { connect } from "react-redux";
import { addCallRecord, updateCallRecord } from '../../actions'

function returnStatusColor(status){
  if(status === 'completed') {
    return 'colorBackgroundSuccess'
  } else if (status === 'in-progress' || status === 'initiated')  {
    return 'colorBackgroundBusy'
  } else {
    return 'colorBackgroundError'
  }
}

const setupSyncClient = (token) => {
  const debugLogs = {logLevel: 'debug'}
  const syncClient =  new SyncClient(token, debugLogs);
  return syncClient
}

function CallHistory({ callLog, addCallRecord, twilioAccessToken, updateCallRecord, ninetiesMode }) {
  const [syncClient, setSyncClient] = useState(null)

  useEffect(() => {

    async function configureCallLog(client) {
        // TODO: Maybe don't hardcode the CallLog map name
        const callLog = await client.map('CallLog')

        const existingLogs = await callLog.getItems()

        existingLogs.items.forEach(call => {
            addCallRecord(call.data)
        })

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
    <Box spacing="space30">
      <Heading as="h2" variant="heading20">{ ninetiesMode ? "📞 Rolodex" : "Call History" }</Heading>
        <Box maxHeight={'17rem'} overflowY={'scroll'} overflowX={'hidden'}>
          {callLog.length > 0 ?
            callLog.map(call => {
                return (
                    <Card key={call.Sid} >
                        <Text marginBottom={"space10"}>{`${call.Status}, ${call.Timestamp}`}</Text>
                        <Text marginBottom={"space10"}><strong>From:</strong> {call.From} <strong>To:</strong> {call.To}</Text>
                        <Text marginBottom={"space30"}><strong>Call Sid:</strong> {call.Sid}</Text>
                        <Box padding={'space10'} backgroundColor={returnStatusColor(call.Status)}></Box>
                    </Card>
                )
            }) : ''
          }
        </Box>
    </Box>
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
