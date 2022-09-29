import { Box, Text, MediaObject, MediaBody, Avatar, MediaFigure } from '@twilio-paste/core';
import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
import { formatDistanceToNow } from 'date-fns';

function MessageBubble({ devPhoneName, message }) {
  const isFromDevPhone = message.author === devPhoneName;

  return <Box display="flex" justifyContent={isFromDevPhone ? "flex-end" : 'flex-start'} marginBottom="space30">
    <MediaObject as="div">
      {!isFromDevPhone && <MediaFigure as="div" align="start" spacing="space40">
        <Avatar size="sizeIcon50" name={message.author} icon={UserIcon} />
      </MediaFigure>}
      <MediaBody as="div">
        <Box
          as="div"
          color={isFromDevPhone ? "colorTextInverse" : "colorText"}
          backgroundColor={isFromDevPhone ? "colorBackgroundPrimary" : "colorBackground"}
          borderRadius="borderRadius20"
          borderTopRightRadius="borderRadius0"
          fontSize="fontSize30"
          whiteSpace="pre-wrap"
          lineHeight="lineHeight20"
          padding="space30"
          maxWidth="size30"
        >
          {message.body}
        </Box>
        <Text as="div" color="colorTextWeak" fontSize="fontSize20" textAlign={isFromDevPhone ? "right" : 'left'}>
          {isFromDevPhone ? 'Your Dev Phone' : message.author} &ndash; {formatDistanceToNow(message.dateCreated, { addSuffix: true })}
        </Text>
      </MediaBody>
      {isFromDevPhone && <MediaFigure as="div" align="end" spacing="space40">
        <Avatar size="sizeIcon50" name="DevPhone" />
      </MediaFigure>}
    </MediaObject>
  </Box>
}

export default MessageBubble