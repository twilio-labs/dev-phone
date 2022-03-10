import { useState } from 'react';
import { Anchor, Box, Button, Heading, Flex, Label, Option, Select, Stack, Alert, Text, SkeletonLoader, Paragraph, Card } from "@twilio-paste/core";
import SuccessIllustration from "../Illustrations/SuccessIllustration";

const LOCAL_STORAGE_KEY = 'DEV_PHONE_HIDE_WELCOME';

function WelcomeDialog() {
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(!(localStorage.getItem(LOCAL_STORAGE_KEY) === 'true'));

  function dismiss() {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    setShowWelcomeDialog(false);
  }

  if (!showWelcomeDialog) {
    return null;
  }

  return <Box marginBottom={"space120"}>
    <Card>
      <Stack orientation={"vertical"} spacing={"space40"}>
        <SuccessIllustration />
        <Heading as="h2" variant="heading20">Welcome to the Dev Phone</Heading>
        <Paragraph>
          The Dev Phone is your friendly companion when building Twilio applications.
          You can use this tool to test the behavior of your Twilio applications when you don't feel like grabbing
          your phone, or when you don't have good cell phone coverage.
        </Paragraph>
        <Paragraph>
          This tool is a Twilio Labs project, meaning it is <em>not</em> covered by Twilio Support. If you find any issues, want to look under the hood, or even contribute to the tool,
          the project is 100% open-source and <Anchor href="https://github.com/twilio-labs/dev-phone" showExternal>available on GitHub</Anchor>.
        </Paragraph>
        <Paragraph>
          <strong>We can't wait to see what you build!</strong>
        </Paragraph>
        <Flex hAlignContent={"between"} vAlignContent="center">
          <Button as="a" variant="secondary" href="https://www.twilio.com/docs/labs/dev-phone">Read the docs</Button>
          <Button onClick={dismiss} variant="link">Don't show this again.</Button>
        </Flex>
      </Stack>
    </Card>
  </Box>
}

export default WelcomeDialog;