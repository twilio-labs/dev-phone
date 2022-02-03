import { useState, useContext } from 'react';
import { Button, Input, Stack, Heading, Paragraph, Label, Grid, Column, Card, Box} from "@twilio-paste/core";
import { TwilioVoiceContext } from './VoiceManager/VoiceManager';

function Caller({ ninetiesMode }) {
    const [destination, setCallDestination] = useState("");
    const dialer = useContext(TwilioVoiceContext)

    const { voiceDevice, activeCall } = dialer

    function makeCall() {
        dialer.makeCall(destination)
    }

    function hangUp() {
        console.log('voicemanager hangup invoked')
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
                    disabled={!activeCall}
                    onClick={e => sendDTMF({tone})}>{tone}</Button>
        })
    }

    function generateStatusMessage () {
        if(voiceDevice && !activeCall) {
            return 'ready'
        } 
        
        if(voiceDevice && activeCall) {
            console.log(JSON.stringify(activeCall))
            if (activeCall._wasConnected) {
                return 'connected'
            }

            return activeCall._direction === 'OUTGOING' ?
                `calling ${activeCall._options.twimlParams.to}` :
                `call from ${activeCall._options.twimlParams.from}`
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
                                    {activeCall && activeCall._direction === "INCOMING" ?
                                        <Button
                                            fullWidth={true}
                                            disabled={activeCall._direction !== "INCOMING"}
                                            onClick={() => activeCall.accept()}
                                            variant="primary" >
                                            Accept Call
                                        </Button>
                                        : <Button
                                            fullWidth={true}
                                            disabled={activeCall || !destination || destination.length < 6}
                                            onClick={makeCall} >
                                            Call
                                        </Button>
                                    }
                                </Column>
                                <Column span={6}>
                                    <Button
                                        fullWidth={true}
                                        disabled={!activeCall}
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
