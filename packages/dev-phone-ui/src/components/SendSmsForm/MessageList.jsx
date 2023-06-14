import {
    Box, Flex, SkeletonLoader,
    Text, ChatLog, ChatMessage,
    ChatBubble, ChatMessageMeta, ChatMessageMetaItem,
    Avatar
} from "@twilio-paste/core"
import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
import { useSelector } from "react-redux"
import EmptyMessageList from "./EmptyMessageList";
import MessageBubble from "./MessageBubble"

function MessageList({ devPhoneName }) {
    const messageList = useSelector(state => state.messageList)
    const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "");

    return (
        messageList ?
            // Replace Box with Chat Log
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
                                    <ChatMessageMeta aria-label="">
                                        <ChatMessageMetaItem>
                                            <Avatar size="sizeIcon30" name={message.author} icon={UserIcon} />
                                            {message.author}
                                        </ChatMessageMetaItem>
                                    </ChatMessageMeta>

                                </ChatMessage>
                                // <MessageBubble message={message} key={message.sid} devPhoneName={devPhoneName} />
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