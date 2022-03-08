import { useContext } from 'react';
import { useSelector } from 'react-redux'
import { Button, Flex, Stack, Grid, Column, Box, Text} from "@twilio-paste/core";
import { TwilioVoiceContext } from '../VoiceManager/VoiceManager';
import DTMFButton from './DtmfButton';

function Dialer() {
    const currentCallInfo = useSelector((state) => state.currentCallInfo)
    const destinationNumber = useSelector(state => state.destinationNumber)
    const dialer = useContext(TwilioVoiceContext)
    const { acceptCall, voiceDevice } = dialer

    function makeCall() {
        dialer.makeCall(destinationNumber)
    }

    function hangUp() {
        dialer.hangUp()
    }

    function sendDTMF(num) {
        dialer.sendDTMF(num)
    }

    function generateDTMFColumn(col) {
        return col.map(tone => {
            return <DTMFButton 
                    key={tone}
                    tone={tone}
                    fullWidth={true}
                    disabled={!currentCallInfo}
                    onClick={e => sendDTMF(tone)} />
        })
    }

    function generateStatusMessage () {
        if (voiceDevice && !currentCallInfo) {
            return 'ready to call'
        }
        
        if(voiceDevice && currentCallInfo) {
            if (currentCallInfo && currentCallInfo._wasConnected) {
                return 'call connected'
            }

            return currentCallInfo._direction === 'OUTGOING' ?
                `calling ${currentCallInfo._options.twimlParams.to}` :
                `call from ${currentCallInfo.parameters.From}`
        }
            
        return 'initializing'
    }

    return (
        <Box width="100%" paddingTop="space60">
            <Stack orientation="vertical" spacing="space60">
                <Box width="100%">
                    <Text fontStyle={"italic"} textAlign={"center"}>{generateStatusMessage()}</Text>
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
                        <Column span={6}>
                            {acceptCall && currentCallInfo && currentCallInfo._direction === "INCOMING" ?
                                <Button
                                    fullWidth={true}
                                    disabled={currentCallInfo._mediaStatus === "open"}
                                    onClick={acceptCall}
                                    variant="primary" >
                                    Accept Call
                                </Button>
                                : <Button
                                    fullWidth={true}
                                    disabled={!!currentCallInfo || !destinationNumber || destinationNumber.length < 6}
                                    onClick={makeCall} >
                                    Call
                                </Button>
                            }
                        </Column>
                        <Column span={6}>
                            <Button
                                fullWidth={true}
                                disabled={!currentCallInfo}
                                onClick={hangUp}
                                variant="destructive" >
                                Hang up
                            </Button>
                        </Column>

                    </Grid>
                </Box>
            </Stack>
        </Box>
    );
}

export default Dialer;
