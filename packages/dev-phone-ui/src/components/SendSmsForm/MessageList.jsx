import { Box, Flex, SkeletonLoader, Text, ChatMessage, ChatBubble, ChatMessageMeta, ChatMessageMetaItem, Avatar } from "@twilio-paste/core"
import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
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
                                const isFromDevPhone = message.author === devPhoneName;
                                return (
                                    <ChatMessage variant={!isFromDevPhone ? "outbound" : "inbound"}>
                                        <Box as="div" width="size30" display="flex" justifyContent={isFromDevPhone ? "flex-end" : 'flex-start'} marginBottom="space30">
                                            <ChatBubble>
                                                {message.body}
                                            </ChatBubble>
                                            <ChatMessageMeta aria-label="said by Gibby Radki at 3:35 PM">
                                                <ChatMessageMetaItem>
                                                    <Avatar name="Gibby Radki" size="sizeIcon20" />
                                                    Gibby Radki ・ 3:35 PM
                                                </ChatMessageMetaItem>
                                            </ChatMessageMeta>
                                        </Box>
                                    </ChatMessage>
                                    // <MessageBubble message={message} key={message.sid} devPhoneName={devPhoneName} />
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