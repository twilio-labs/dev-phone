import { Box, Flex, SkeletonLoader, Text } from "@twilio-paste/core"
import { useSelector } from "react-redux"
import EmptyMessageList from "./EmptyMessageList";
import MessageBubble from "./MessageBubble"

function MessageList({ devPhoneName }) {
    const messageList = useSelector(state => state.messageList)
    const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "");

    return (
        messageList ?
            <Box height={'size40'}>
                <Flex vertical vAlignContent={"bottom"} height={"100%"}>
                    <Box width={"100%"} paddingRight={"space100"} paddingBottom={"space40"} paddingLeft={"space40"} overflowY={'scroll'} overflowX={'hidden'}>
                        {messageList.length > 0 ?
                            messageList.map((message, i) => {
                                return (
                                    <MessageBubble message={message} key={message.sid} devPhoneName={devPhoneName} />
                                )
                            })
                            : <EmptyMessageList devPhoneNumber={numberInUse} />
                        }
                    </Box>
                </Flex>
            </Box> : <SkeletonLoader height={"size20"} />
    )

}

export default MessageList