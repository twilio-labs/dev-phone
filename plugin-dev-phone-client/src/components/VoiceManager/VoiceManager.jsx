import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Device } from '@twilio/voice-sdk'
import { setCallStatus } from '../../actions'


// Establish context with default values
const TwilioVoiceContext = React.createContext(null)
export { TwilioVoiceContext }
// export const useTwilioVoice = () => React.useContext(TwilioVoiceContext)

// const setupDevice = (token, dispatch) => {
//     // See: https://www.twilio.com/docs/voice/tutorials/browser-calls-node-express

//     device.on("connect", (conn) => {
//         console.log('connected', conn)
//         dispatch(setCallStatus({
//             inCall: true,
//             message: `${Object.keys(conn.message).length === 0 ? 'Speaking with ' + conn.parameters.From : JSON.stringify(conn.message)}`,
//             connection: conn
//         }))
//     });
// }

const TwilioVoiceManager = ({ children }) => {
    const twilioAccessToken = useSelector(state => state.twilioAccessToken)
    const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "")
    const callStatus = useSelector(state => state.callStatus)
    const dispatch = useDispatch()

    let voiceDevice
    let deviceDetails

    const makeCall = async (destination) => {
        try {
            const activeCall = await voiceDevice.connect({
                params: {
                    "to": destination,
                    "from": numberInUse,
                    "identity": "dev-phone"
                }
            });
            activeCall.on('accept', call => {
                console.log('connected', call)
                dispatch(setCallStatus({
                    inCall: true,
                    connection: call
                }))
            })
        } catch (error) {
            console.error(error)
        }
    }

    const hangUp = () => {
        voiceDevice.disconnectAll();
    }

    const sendDTMF = (num) => {
        if (callStatus.connection) {
            console.log("Sending DTMF " + num);
            callStatus.connection.sendDigits(num);
        }
    }

    if (!voiceDevice) {
        // initialize voiceDevice with Access Token Action/State from Redux?
        voiceDevice = new Device(twilioAccessToken, {
            codecPreferences: ["opus", "pcmu"],
            fakeLocalDTMF: true,
            debug: true,
            enableRingingState: true
        })

        voiceDevice.on("registered", () => {
            setCallStatus({ inCall: false, message: "ready" });
        });

        voiceDevice.on("incoming", (call) => {
            setCallStatus({
                inCall: true,
                message: `Incoming call from ${call.parameters.From}`,
                call
            })
        })

        voiceDevice.on('connect', call => {
            dispatch(setCallStatus(call))
        })

        voiceDevice.on('disconnect', call => {
            dispatch(setCallStatus(call))
            // setCallStatus({ inCall: false, message: "ready (disconnected)", connection: null });
        })

        deviceDetails = {
            voiceDevice: voiceDevice,
            makeCall,
            sendDTMF,
            hangUp
        }
    }

    return (
        <TwilioVoiceContext.Provider value={deviceDetails}>
            {children}
        </TwilioVoiceContext.Provider>
    )

};

export default TwilioVoiceManager