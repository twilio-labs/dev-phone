import { Alert, Text, Anchor } from '@twilio-paste/core';

function MissingDestinationNumber() {
  return <Alert variant="neutral">
    <Text as="span">
      <strong>Enter a valid destination number.</strong> Please enter a valid phone number at the top in order to send messages or make phone calls.
    </Text>
  </Alert>
}

export default MissingDestinationNumber;