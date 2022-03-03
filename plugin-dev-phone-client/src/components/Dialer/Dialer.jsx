import { useState, useContext } from 'react';
import { useSelector } from 'react-redux'
import { Button, Input, Stack, Heading, Paragraph, Label, Grid, Column, Card, Box} from "@twilio-paste/core";
import { TwilioVoiceContext } from '../VoiceManager/VoiceManager';

function Dialer({ ninetiesMode }) {
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
            return <Button 
                    key={tone}
                    fullWidth={true}
                    disabled={!currentCallInfo}
                    onClick={e => sendDTMF(tone)}>{tone}</Button>
        })
    }

    function generateStatusMessage () {
        if (voiceDevice && !currentCallInfo) {
            return 'ready'
        }
        
        if(voiceDevice && currentCallInfo) {
            if (currentCallInfo && currentCallInfo._wasConnected) {
                return 'connected'
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
                <Box width="size40">
                    <Paragraph>
                        <em>{generateStatusMessage()}</em>
                    </Paragraph>
                    <Grid spacing="space30" gutter="space30">
                        <Column span={4}>
                            <Stack orientation="vertical" spacing="space40">
                                {generateDTMFColumn(['1', '4', '7', '*'])}
                            </Stack>
                        </Column>
                        <Column span={4}>
                            <Stack orientation="vertical" spacing="space40">
                                {generateDTMFColumn(['2', '5', '8', '0'])}
                            </Stack>
                        </Column>
                        <Column span={4}>
                            <Stack orientation="vertical" spacing="space40">
                                {generateDTMFColumn(['3', '6', '9', '#'])}
                            </Stack>
                        </Column>
                    </Grid>
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
