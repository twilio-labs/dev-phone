import { Box, Flex, SkeletonLoader, Text} from "@twilio-paste/core"
import { useSelector } from "react-redux"

function MessageList({ devPhoneName }) {
    const messageList = useSelector(state => state.messageList)

    return (
        messageList ?
        <Box height={'size40'}>
            <Flex vertical vAlignContent={"bottom"} height={"100%"}>
                <Box width={"100%"} paddingRight={"space100"} paddingBottom={"space40"} paddingLeft={"space40"} overflowY={'scroll'} overflowX={'hidden'}>
                    {messageList.length > 0 ?
                        messageList.map((message, i) => {
                            return (
                            <Box 
                                key={message.sid}
                                marginLeft={message.author === devPhoneName ? "auto" : "0"}
                                marginBottom={"space50"}
                                maxWidth={"fit-content"}
                                backgroundColor={message.author === devPhoneName ? "colorBackgroundPrimary" : "colorBackgroundStrong"}
                                borderRadius={"borderRadius30"}
                                boxShadow={"shadow"}
                                paddingTop="space30"
                                paddingBottom="space30"
                                paddingLeft={"space50"}
                                paddingRight={"space50"}
                            >
                                <Text color={message.author === devPhoneName ? "colorTextInverse" : "colorText"}>{message.body}</Text>
                            </Box>
                            )
                    })
                    : 'Go ahead and send your first message!'
                    }
                </Box>
            </Flex>            
        </Box> : <SkeletonLoader height={"size20"} />
    )
    
}

  export default MessageList