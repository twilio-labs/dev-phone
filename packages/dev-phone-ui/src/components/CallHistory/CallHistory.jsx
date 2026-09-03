import { useState, useEffect } from "react";
import { SyncClient } from 'twilio-sync';
import { Box, Flex, Text } from "@twilio-paste/core";
import { addCallRecord, updateCallRecord } from '../../actions'
import { useSelector, useDispatch } from "react-redux";
import CallRecord from "./CallRecord";

const setupSyncClient = (token) => {
  const debugLogs = { logLevel: 'debug' }
  const syncClient = new SyncClient(token, debugLogs);
  return syncClient
}

function getIncomingCallerNumber(call) {
  if (!call) return null;
  const customFrom = call.customParameters && typeof call.customParameters.get === 'function'
    ? call.customParameters.get('From') || call.customParameters.get('from')
    : null;
  return call.parameters?.From
    || call.parameters?.from
    || call._options?.twimlParams?.from
    || customFrom
    || null;
}

function getOutgoingDestinationNumber(call) {
  if (!call) return null;
  return call._options?.twimlParams?.to
    || call.parameters?.To
    || call.parameters?.to
    || null;
}

function getConnectedPeerNumber(call) {
  if (!call) return null;
  if (call._direction === 'OUTGOING') return getOutgoingDestinationNumber(call);
  return getIncomingCallerNumber(call);
}

function getCallSids(call) {
  if (!call) return [];
  const cp = call.customParameters && typeof call.customParameters.get === 'function'
    ? call.customParameters
    : null;
  const sidCandidates = [
    { label: 'Params SID', value: call.parameters?.CallSid || call.parameters?.callSid || null },
    { label: 'SDK SID', value: call._callSid || null },
    { label: 'Options SID', value: call._options?.callSid || null },
    { label: 'Inbound SID', value: cp?.get('CallSid') || null },
    { label: 'Parent SID', value: cp?.get('ParentCallSid') || null },
  ];

  const seen = new Set();
  return sidCandidates.filter(({ value }) => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function getCustomParams(call) {
  const cp = call?.customParameters;
  if (!cp || typeof cp.entries !== 'function') return [];

  return Array.from(cp.entries()).filter(([key, value]) => (
    key !== 'request' &&
    key !== 'CallToken' &&
    value !== null &&
    value !== '' &&
    !String(value).startsWith('[object')
  ));
}

function buildLiveCallDetails(call) {
  if (!call) return null;

  const direction = call._direction;
  const isIncoming = direction === 'INCOMING';
  const isConnected = !!call._wasConnected;

  let statusLabel;
  let displayNumber;
  if (isConnected) {
    statusLabel = 'Connected to';
    displayNumber = getConnectedPeerNumber(call);
  } else if (isIncoming) {
    statusLabel = 'Incoming from';
    displayNumber = getIncomingCallerNumber(call);
  } else {
    statusLabel = 'Calling';
    displayNumber = getOutgoingDestinationNumber(call);
  }

  return {
    statusLabel,
    displayNumber,
    direction,
    wasConnected: isConnected,
    callSids: getCallSids(call),
    customParams: getCustomParams(call),
  };
}

function CallHistory() {
  const twilioAccessToken = useSelector(state => state.twilioAccessToken)
  const callLog = useSelector(state => state.callLog)
  const currentCallInfo = useSelector(state => state.currentCallInfo)
  const dispatch = useDispatch()
  const [syncClient, setSyncClient] = useState(null)
  const [liveCallDetailsBySid, setLiveCallDetailsBySid] = useState({})

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

  useEffect(() => {
    if (!currentCallInfo) {
      return;
    }

    const liveCallDetails = buildLiveCallDetails(currentCallInfo);
    if (!liveCallDetails) {
      return;
    }

    const sidValues = liveCallDetails.callSids.map(({ value }) => value).filter(Boolean);
    if (!sidValues.length) {
      return;
    }

    setLiveCallDetailsBySid((currentMap) => {
      const updatedMap = { ...currentMap };
      sidValues.forEach((sid) => {
        updatedMap[sid] = liveCallDetails;
      });
      return updatedMap;
    });
  }, [currentCallInfo]);

  return (
    <Box spacing="space30" backgroundColor={"colorBackground"} maxHeight={"size80"} height={"100%"} borderRightWidth={"borderWidth10"} borderRightColor={"colorBorder"} borderRightStyle={"solid"}>
      <Flex vertical vAlignContent={"bottom"} height={"100%"}>
        <Box width={"100%"} padding={"space80"} overflowY={'scroll'} overflowX={'hidden'}>
          {callLog.length > 0 ?
            callLog.map(call => {
              return (
                <CallRecord key={call.Sid} call={call} liveCallDetails={liveCallDetailsBySid[call.Sid]} />
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
