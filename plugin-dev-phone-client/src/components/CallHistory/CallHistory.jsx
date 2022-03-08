import { useState, useEffect } from "react";
import { SyncClient } from 'twilio-sync';
import { Box, Flex, Text } from "@twilio-paste/core";
import { addCallRecord, updateCallRecord } from '../../actions'
import { useSelector, useDispatch } from "react-redux";
import CallRecord from "./CallRecord";

const setupSyncClient = (token) => {
  const debugLogs = {logLevel: 'debug'}
  const syncClient =  new SyncClient(token, debugLogs);
  return syncClient
}

function CallHistory() {
  const twilioAccessToken = useSelector(state => state.twilioAccessToken)
  const callLog = useSelector(state => state.callLog)
  const dispatch = useDispatch()
  const [syncClient, setSyncClient] = useState(null)

  useEffect(() => {

    async function configureCallLog(client) {
        // TODO: Maybe don't hardcode the CallLog map name
        const callLog = await client.map('CallLog')

        const existingLogs = await callLog.getItems()

        existingLogs.items.forEach(call => {
            dispatch(addCallRecord(call.data))
        })

        callLog.on('itemAdded', async (syncMapItem) => {
            const item = await syncMapItem.item
            dispatch(addCallRecord(item.data))
        })

        callLog.on('itemUpdated', async (syncMapItem) => {
            const item = await syncMapItem.item
            dispatch(updateCallRecord(item.data))
        })
    }

    if (!syncClient) {
      const syncClient = setupSyncClient(twilioAccessToken);
      setSyncClient(syncClient);
      configureCallLog(syncClient)
    }


}, [addCallRecord, setSyncClient, syncClient, twilioAccessToken, updateCallRecord]);

  return (
    <Box spacing="space30" backgroundColor={"colorBackground"} height={"100%"} borderRightWidth={"borderWidth10"} borderRightColor={"colorBorder"} borderRightStyle={"solid"}>
        <Flex vertical vAlignContent={"bottom"} height={"100%"}>
            <Box width={"100%"} padding={"space80"} overflowY={'scroll'} overflowX={'hidden'}>
              {callLog.length > 0 ?
                callLog.map(call => {
                    return (
                        <CallRecord key={call.Sid} call={call} />
                    )
                }) : <Text textAlign={"center"} fontStyle={"italic"}> Make a call! I'll maintain a record of them here. </Text>
              }
            </Box>
            <Box backgroundColor={"colorBackgroundBrand"} width={"100%"} paddingY={"space50"}>
              <Text as="h2" variant="heading20" fontSize={"fontSize60"} color="colorTextInverse" textAlign={"center"}>Call History</Text>
            </Box>
          </Flex>
    </Box>
  );
}

export default CallHistory
