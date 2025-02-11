import { Box, SkeletonLoader } from "@twilio-paste/core"
import { ChatLog, ChatMessage, ChatBubble, ChatMessageMeta, ChatMessageMetaItem } from "@twilio-paste/chat-log";
import { Avatar } from "@twilio-paste/avatar";
import { useSelector } from "react-redux"
import EmptyMessageList from "./EmptyMessageList";



function MessageList({ devPhoneName }) {
    const messageList = useSelector(state => state.messageList)
    const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "");

    return (
        messageList ?
            <Box overflowY="scroll" height="size40" tabIndex={0}>
                <ChatLog>
                    {messageList.length > 0 ?
                        messageList.map((message, i) => {
                            const isFromDevPhone = message.author === devPhoneName;
                            return (
                                <ChatMessage variant={!isFromDevPhone ? "outbound" : "inbound"}>
                                    <ChatBubble>
                                        {message.body}
                                    </ChatBubble>
                                    <ChatMessageMeta aria-label={!isFromDevPhone ? "said by outbound user" : "said by dev phone"}>
                                        <ChatMessageMetaItem>
                                            <Avatar size="sizeIcon30" name={message.author} />
                                            {message.author}
                                        </ChatMessageMetaItem>
                                    </ChatMessageMeta>
                                </ChatMessage>
                            )
                        })
                        : <EmptyMessageList devPhoneNumber={numberInUse} />
                    }
                </ChatLog>
            </Box>
            : <SkeletonLoader height={"size20"} />
    )
}

export default MessageList