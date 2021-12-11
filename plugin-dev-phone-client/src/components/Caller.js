import { useState, useEffect } from 'react';
import { Device } from 'twilio-client';
import { Button, Input, Stack, Heading, Paragraph, Label, Grid, Column, Card, Box} from "@twilio-paste/core";
import { connect } from 'react-redux'

const setupDevice = (token, setCallStatus) => {
    // See: https://www.twilio.com/docs/voice/tutorials/browser-calls-node-express
    const device = new Device(token, {
        codecPreferences: ["opus", "pcmu"],
        fakeLocalDTMF: true,
        debug: true,
        enableRingingState: true
    });

    device.on("ready", () => {
        setCallStatus({ inCall: false, message: "ready" });
    });

    device.on("error", (error) => {
        setCallStatus({ inCall: false, message: `Error : ${error.message}` });
    });

    device.on("connect", (conn) => {
        console.log('connected', conn)
        setCallStatus({
            inCall: true,
            message: `${Object.keys(conn.message).length === 0 ? 'Speaking with ' + conn.parameters.From : JSON.stringify(conn.message)}`,
            connection: conn
        });
    });

    device.on("disconnect", (conn) => {
        setCallStatus({ inCall: false, message: "ready (disconnected)", connection: null });
    });

    device.on("incoming", (conn) => {
        setCallStatus({
            inCall: true,
            message: `Incoming call from ${conn.parameters.From}`,
            connection: conn
        })
    })

    return device;
}

function Caller({ numberInUse, twilioAccessToken, ninetiesMode }) {

    const [callStatus, setCallStatus] = useState({ inCall: false, message: "initializing" });
    const [device, setDevice] = useState(null);
    const [calleePn, setCalleePn] = useState("");

    useEffect(() => {
        const device = setupDevice(twilioAccessToken, setCallStatus);
        setDevice(device);
    }, [twilioAccessToken]);

    const makeCall = () => {
        try {
            device.connect({
                "to": calleePn,
                "from": numberInUse,
                "identity": "dev-phone"
            });
        } catch (error) {
            console.error(error)
        }
    }

    const hangUp = () => {
        device.disconnectAll();
    }

    const sendDTMF = (num) => {
        if (callStatus.connection) {
            console.log("Sending DTMF " + num);
            callStatus.connection.sendDigits(num);
        }
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
                                    defaultValue={calleePn}
                                    onChange={e => setCalleePn(e.target.value)} />
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
                                            disabled={callStatus.inCall || !calleePn || calleePn.length < 6}
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

const mapStateToProps = (state) => ({
    twilioAccessToken: state.twilioAccessToken,
});

export default connect(mapStateToProps)(Caller);
