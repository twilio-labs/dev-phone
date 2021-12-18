import { useState, useContext } from 'react';
import { Button, Input, Stack, Heading, Paragraph, Label, Grid, Column, Card, Box} from "@twilio-paste/core";
import { useSelector } from 'react-redux'
import { TwilioVoiceContext } from './VoiceManager/VoiceManager';

function Caller({ ninetiesMode }) {
    const [destination, setCallDestination] = useState("");
    const callStatus = useSelector(state => state.callStatus)
    const dialer = useContext(TwilioVoiceContext)

    function makeCall() {
        dialer.makeCall(destination)
    }

    function hangUp() {
        dialer.hangUp()
    }

    function sendDTMF(num) {
        dialer.sendDTMF(num)
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
                                    placeholder="E.164 format please"
                                    defaultValue={destination}
                                    onChange={e => setCallDestination(e.target.value)} />
                            </Box>

                            <Grid spacing="space30" gutter="space30" marginBottom="space40">
                                <Column span={6}>
                                    {callStatus.connection ?
                                        <Button
                                            fullWidth={true}
                                            disabled={!callStatus.connection}
                                            onClick={() => callStatus.connection.accept()}
                                            variant="primary" >
                                            Accept Call
                                        </Button>
                                        : <Button
                                            fullWidth={true}
                                            disabled={callStatus.inCall || !destination || destination.length < 6}
                                            onClick={makeCall} >
                                            Call
                                        </Button>
                                    }
                                </Column>
                                <Column span={6}>
                                    <Button
                                        fullWidth={true}
                                        disabled={!callStatus.inCall}
                                        onClick={hangUp}
                                        variant="destructive" >
                                        Hang up
                                    </Button>
                                </Column>

                            </Grid>
                            <Grid spacing="space30" gutter="space30">
                                <Column span={4}>
                                    <Stack orientation="vertical" spacing="space40">
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('1')}>1</Button>
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('4')}>4</Button>
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('7')}>7</Button>
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('*')}>*</Button>
                                    </Stack>
                                </Column>
                                <Column span={4}>
                                    <Stack orientation="vertical" spacing="space40">
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('2')}>2</Button>
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('5')}>5</Button>
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('8')}>8</Button>
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('0')}>0</Button>
                                    </Stack>
                                </Column>
                                <Column span={4}>
                                    <Stack orientation="vertical" spacing="space40">
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('3')}>3</Button>
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('6')}>6</Button>
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('9')}>9</Button>
                                        <Button fullWidth={true} disabled={!callStatus.inCall} onClick={e => sendDTMF('#')}>#</Button>
                                    </Stack>
                                </Column>

                            </Grid>
                        </Stack>

                    </Card>
                </Box>

                <Paragraph>
                    Call status: <em>{callStatus.message}</em>
                </Paragraph>
            </Stack>
        </Box>
    );
}

export default Caller;
