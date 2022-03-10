import { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, Flex, Stack, Grid, Column, Box } from "@twilio-paste/core";
import { TwilioVoiceContext } from '../VoiceManager/VoiceManager';
import DTMFButton from './DtmfButton';
import { addDigitToDestinationNumber } from '../../actions';
import CallStatusMessage from './StatusMessage';

function Dialer() {
    const currentCallInfo = useSelector((state) => state.currentCallInfo)
    const destinationNumber = useSelector(state => state.destinationNumber)
    const dispatch = useDispatch();

    const dialer = useContext(TwilioVoiceContext)
    const { acceptCall, voiceDevice } = dialer

    const hasValidDestinationNumber = useMemo(() => {
        return destinationNumber && destinationNumber.length > 6
    }, [destinationNumber])

    function makeCall() {
        dialer.makeCall(destinationNumber)
    }

    function hangUp() {
        dialer.hangUp()
    }

    function sendDTMF(num) {
        if (!currentCallInfo) {
            dispatch(addDigitToDestinationNumber(num))
        } else {
            dialer.sendDTMF(num)
        }
    }

    function generateDTMFColumn(col) {
        return col.map(tone => {
            return <DTMFButton
                key={tone}
                tone={tone}
                fullWidth={true}
                onClick={e => sendDTMF(tone)} />
        })
    }

    const isCallInProgress = !!currentCallInfo;
    const isIncomingCall = acceptCall && currentCallInfo && currentCallInfo._direction === 'INCOMING';

    return (
        <Box width="100%" paddingTop="space60">
            <Stack orientation="vertical" spacing="space60">
                <Box width="100%">
                    <CallStatusMessage voiceDevice={voiceDevice} currentCallInfo={currentCallInfo} />
                    <Flex>
                        {generateDTMFColumn(['1', '2', '3'])}
                    </Flex>
                    <Flex>
                        {generateDTMFColumn(['4', '5', '6'])}
                    </Flex>
                    <Flex>
                        {generateDTMFColumn(['7', '8', '9'])}
                    </Flex>
                    <Flex>
                        {generateDTMFColumn(['*', '0', '#'])}
                    </Flex>
                    <Grid spacing="space30" gutter="space30" marginBottom="space40">
                        <Column span={isIncomingCall ? 6 : !isCallInProgress ? 12 : 0}>
                            {isIncomingCall ?
                                <Button
                                    fullWidth={true}
                                    disabled={currentCallInfo._mediaStatus === "open"}
                                    onClick={acceptCall}
                                    variant="primary" >
                                    Accept call
                                </Button>
                                : isCallInProgress ? null : <Button
                                    fullWidth={true}
                                    disabled={!!currentCallInfo || !hasValidDestinationNumber}
                                    onClick={makeCall} >
                                    Call
                                </Button>
                            }
                        </Column>
                        <Column span={isCallInProgress && isIncomingCall ? 6 : isCallInProgress ? 12 : 0}>
                            {(isCallInProgress || isIncomingCall) && <Button
                                fullWidth={true}
                                disabled={!currentCallInfo}
                                onClick={hangUp}
                                variant="destructive" >
                                Hang up
                            </Button>}
                        </Column>
                    </Grid>
                </Box>
            </Stack>
        </Box>
    );
}

export default Dialer;
