import { useState, useContext } from 'react';
import { useSelector } from 'react-redux'
import { Button, Input, Stack, Heading, Paragraph, Label, Grid, Column, Card, Box} from "@twilio-paste/core";
import { TwilioVoiceContext } from './VoiceManager/VoiceManager';

function Caller({ ninetiesMode }) {
    const [destination, setCallDestination] = useState("");
    const dialer = useContext(TwilioVoiceContext)
    const currentCallInfo = useSelector((state) => state.currentCallInfo)
    const { acceptCall, voiceDevice } = dialer

    function makeCall() {
        dialer.makeCall(destination)
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
                <Heading as="h2" variant="heading20">{ninetiesMode ? "👻 Who you gonna call?" : "Voice calls"}</Heading>
                <Box width="size40">
                    <Card>
                        <Stack orientation="vertical" spacing="space60">
                            <Box>
                                <Label htmlFor="calleePn" required>To</Label>
                                <Input
                                    type="text"
                                    id="calleePn"
                                    placeholder="E.164 format, e.g., +15551234567"
                                    defaultValue={destination}
                                    onChange={e => setCallDestination(e.target.value)} />
                            </Box>

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
                                            disabled={!!currentCallInfo || !destination || destination.length < 6}
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
                        </Stack>
                    </Card>
                </Box>

                <Paragraph>
                    <em>{generateStatusMessage()}</em>
                </Paragraph>
            </Stack>
        </Box>
    );
}

export default Caller;
