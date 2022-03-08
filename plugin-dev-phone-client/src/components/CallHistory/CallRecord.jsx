import { Box, Card, Column, Flex, Grid, Text } from "@twilio-paste/core"

function returnStatusColor(status){
    if(status === 'completed') {
      return 'colorBorderSuccess'
    } else if (status === 'in-progress' || status === 'initiated' || status === 'ringing')  {
      return 'colorBorderWarning'
    } else {
      return 'colorBorderError'
    }
}

function CallRecord ({call}) {
    
    const {Sid, Status, Timestamp, To, From} = call
    return (
        <Box
            backgroundColor={"colorBackgroundBody"}
            borderRadius={"borderRadius20"}
            boxShadow={"shadow"}
            padding={"space60"}
            marginY={"space30"}
            borderLeftColor={returnStatusColor(Status)}
            borderLeftWidth={"borderWidth40"}
            borderLeftStyle={"solid"}
        >
            <Text marginBottom={"space10"}>{`${Status}, ${new Date(Timestamp).toLocaleTimeString()}`}</Text>
            <Flex marginBottom={"space10"}>
                <Text fontWeight={"fontWeightBold"}>To:</Text>
                <Text marginLeft={"space30"}>{To}</Text>
                <Text marginLeft={"space60"} fontWeight={"fontWeightBold"}>From:</Text>
                <Text marginLeft={"space30"}>{From}</Text>
            </Flex>
            <Text><strong>SID:</strong> {Sid}</Text>
        </Box>
    )
}

export default CallRecord