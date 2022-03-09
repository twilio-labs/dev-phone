import { Anchor, Box, Flex, Paragraph, Text } from '@twilio-paste/core';
import { LogoTwilioIcon } from '@twilio-paste/icons/esm/LogoTwilioIcon';

function Footer() {
  return <Box>
    <Flex vertical hAlignContent={"center"}>
      <Box marginBottom={"space40"}>
        <LogoTwilioIcon decorative color="colorTextWeak" />
      </Box>
      <Paragraph marginBottom='space0'>
        <Text fontSize={"fontSize20"}>
          The Dev Phone is an open-source <Anchor href="https://www.twilio.com/labs">Twilio Labs Project</Anchor>.
        </Text>
      </Paragraph>
      <Paragraph>
        <Text fontSize={"fontSize20"}>
          For issues and contributions <Anchor href="https://github.com/twilio-labs/dev-phone" showExternal>check out our GitHub project</Anchor>.
        </Text>
      </Paragraph>
    </Flex>
  </Box>
}

export default Footer;