import { Box, Column, Flex, Grid, Heading, Paragraph, Text } from '@twilio-paste/core';
import SuccessIllustration from '../Illustrations/SuccessIllustration';

function EmptyMessageList({ devPhoneNumber }) {
  return <Grid gutter="space40">
    <Column span={8} offset={2}>
      <Flex hAlignContent={"center"} >
        <SuccessIllustration />
      </Flex>
      <Box marginY="space80">
        <Heading as="h3" variant="heading20" marginBottom="space0">You are all set</Heading>
        <Text as={"span"}>
          Your Dev Phone is ready to be used. Any messages you send or receive will show up here. Enter a destination phone number and start sending your first messages. Alternatively send an SMS from your own device to <Text as={"span"} display={"inline-block"} fontFamily={"fontFamilyCode"}>{devPhoneNumber}</Text>.
        </Text>
      </Box>
    </Column>
  </Grid>
}

export default EmptyMessageList;