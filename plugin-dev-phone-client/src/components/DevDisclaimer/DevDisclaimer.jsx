import { Alert, Text, Button, Flex } from '@twilio-paste/core';
import { useState } from 'react';

const LOCAL_STORAGE_KEY = 'HIDE_DEV_PHONE_WARNING';

function DevDisclaimer() {
  const [showDisclaimer, setShowDisclaimer] = useState(localStorage.getItem(LOCAL_STORAGE_KEY) === 'true' ? false : true);

  function hide() {
    setShowDisclaimer(false);
  }

  function hidePermanently() {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    hide();
  }

  return showDisclaimer ? <Alert onDismiss={hide} variant="warning" role="warning">
    <Flex vAlignContent={"baseline"}>
      <Text as="span" paddingRight={"space20"}>
        The Dev Phone is only designed <Text as="span" textDecoration={"underline"}>for developing Twilio apps</Text>. It is not intended for other purposes.
      </Text>
      <Button onClick={hidePermanently} variant="link">Don't show again.</Button>
    </Flex>
  </Alert> : null;
}

export default DevDisclaimer;