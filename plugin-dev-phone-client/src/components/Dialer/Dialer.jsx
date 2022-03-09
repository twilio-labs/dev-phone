import { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, Flex, Stack, Grid, Column, Box, Text, HelpText, Badge } from "@twilio-paste/core";
import { TwilioVoiceContext } from '../VoiceManager/VoiceManager';
import DTMFButton from './DtmfButton';
import { addDigitToDestinationNumber } from '../../actions';
import { VoiceCapableIcon } from '@twilio-paste/icons/esm/VoiceCapableIcon';
import { CloseIcon } from '@twilio-paste/icons/esm/CloseIcon';
import { SuccessIcon } from '@twilio-paste/icons/esm/SuccessIcon';
import { LoadingIcon } from '@twilio-paste/icons/esm/LoadingIcon';

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

    function generateStatusMessage() {
        let message = 'initializing';
        let variant = 'default';
        let icon = <></>;
        if (voiceDevice && !currentCallInfo) {
            message = 'ready for calls';
            variant = 'info';
            icon = <></>;
        }

        if (voiceDevice && currentCallInfo) {
            if (currentCallInfo._direction === 'OUTGOING') {
                message = `calling ${currentCallInfo._options.twimlParams.to}`;
                variant = 'info';
                icon = <></>;
            } else {
                message = `incoming call from ${currentCallInfo.parameters.From}`;
                variant = 'new';
                icon = <LoadingIcon decorative />
            }

            if (currentCallInfo && currentCallInfo._wasConnected) {
                message = 'call connected';
                variant = 'success';
                icon = <SuccessIcon decorative />;
            }
        }
        return <Badge as="span" variant={variant}>{icon}{message}</Badge>;
    }

    const isCallInProgress = !!currentCallInfo;
    const isIncomingCall = acceptCall && currentCallInfo && currentCallInfo._direction === 'INCOMING';

    return (
        <Box width="100%" paddingTop="space60">
            <Stack orientation="vertical" spacing="space60">
                <Box width="100%">
                    <Flex hAlignContent={"center"}>{generateStatusMessage()}</Flex>
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
                                    <VoiceCapableIcon decorative />
                                    Accept call
                                </Button>
                                : isCallInProgress ? null : <Button
                                    fullWidth={true}
                                    disabled={!!currentCallInfo || !hasValidDestinationNumber}
                                    onClick={makeCall} >
                                    <VoiceCapableIcon decorative />
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
                                <CloseIcon decorative />
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
