import { Alert, Text, Button } from '@twilio-paste/core';
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
    <Flex>
    <Text as="span">
      The Dev Phone is strictly designed to be used <Text as="span" textDecoration={"underline"}>only for developing Twilio apps</Text>. It is not intended to be used for other purposes.
    </Text>
    <Button onClick={hidePermanently} variant="link">Don't show again.</Button>
    </Flex>
  </Alert> : null;
}

export default DevDisclaimer;