import { useState, useEffect } from 'react';
import { Device } from 'twilio-client';
import { Button, Input, Stack, Heading, Paragraph, Label } from "@twilio-paste/core";
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
        setCallStatus({ inCall: true, message: `Connect: ` + JSON.stringify(conn.message) });
    });

    device.on("disconnect", (conn) => {
        setCallStatus({ inCall: false, message: "ready (disconnected)" });
    });

    return device;
}

function Caller({ devPhonePn, twilioAccessToken }) {

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
                "from": devPhonePn.phoneNumber,
                "identity": "dev-phone"
            });
        } catch (error) {
            console.error(error)
        }
    }

    const hangUp = () => {
        device.disconnectAll();
    }

    return (
        <Stack orientation="vertical" spacing="space60">
            <Heading as="h2" variant="heading20">Who you gonna call? 👻</Heading>

            <Stack orientation="vertical">
                <Label htmlFor="calleePn" required>To</Label>
                <Input
                    type="text"
                    id="calleePn"
                    placeholder="E.164 format please"
                    defaultValue={calleePn}
                    onChange={e => setCalleePn(e.target.value)} />
            </Stack>

            <Stack orientation="horizontal" spacing="space30">
                <Button
                    disabled={callStatus.inCall || !calleePn || calleePn.length < 6}
                    onClick={makeCall} >
                    Call
                </Button>
                <Button
                    disabled={!callStatus.inCall}
                    onClick={hangUp} >
                    Hang up
                </Button>
            </Stack>

            <Paragraph>
                Call status: <em>{callStatus.message}</em>
            </Paragraph>
        </Stack>
    );
}

const mapStateToProps = (state) => ({
    twilioAccessToken: state.twilioAccessToken,
  });

export default connect(mapStateToProps)(Caller);