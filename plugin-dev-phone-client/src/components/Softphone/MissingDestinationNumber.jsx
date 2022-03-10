import { Alert, Text } from '@twilio-paste/core';

function MissingDestinationNumber() {
  return <Alert variant="neutral">
    <Text as="span">
      <strong>Enter a destination number.</strong> Please enter a valid destination number to send messages or make phone calls.
    </Text>
  </Alert>
}

export default MissingDestinationNumber;