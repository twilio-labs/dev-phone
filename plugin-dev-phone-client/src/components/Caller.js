import { useState, useEffect } from 'react';
import { Device } from 'twilio-client';
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
        setCallStatus({inCall: false, message: "ready"});
    });

    device.on("error", (error) => {
        setCallStatus({inCall: false, message: `Error : ${error.message}`});
    });

    device.on("connect", (conn) => {
        setCallStatus({inCall: true, message: `Connect: ` + JSON.stringify(conn.message)});
    });

    device.on("disconnect", (conn) => {
        setCallStatus({inCall: false, message: "ready (disconnected)"});
    });

    return device;
}

function Caller({ devPhonePn, twilioAccessToken }) {

    const [callStatus, setCallStatus] = useState({inCall: false, message: "initializing"});
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
        <div className="caller">
            <h3>Who you gonna call? 👻</h3>
            <div>
                <input
                    placeholder="E.164 format please"
                    defaultValue={calleePn}
                    onChange={e => setCalleePn(e.target.value)} />
            </div>
            <div>
                <button
                    disabled={callStatus.inCall || !calleePn || calleePn.length < 6}
                    onClick={makeCall} >
                    Call
                </button>
                <button
                    disabled={!callStatus.inCall}
                    onClick={hangUp} >
                    Hang up
                </button>
            </div>
            <div>
                Call status: <em>{callStatus.message}</em>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    twilioAccessToken: state.twilioAccessToken,
  });

export default connect(mapStateToProps)(Caller);