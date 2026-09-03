import {
    Box, Flex, SkeletonLoader,
    Text, ChatLog, ChatMessage,
    ChatBubble, ChatMessageMeta, ChatMessageMetaItem,
    Avatar
} from "@twilio-paste/core"
import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
import { useSelector } from "react-redux"
import EmptyMessageList from "./EmptyMessageList";


function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

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
                                            <Avatar size="sizeIcon30" name={message.author} icon={UserIcon} />
                                            <Flex flexDirection="column">
                                                <Text>{message.author}</Text>
                                                <Text fontSize="fontSize70" color="colorTextWeak">{formatTime(message.dateCreated)}</Text>
                                            </Flex>
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
