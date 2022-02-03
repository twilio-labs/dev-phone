import React, { useState, useEffect } from 'react'
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
    const [activeCall, setActiveCall] = useState(null);
    const dispatch = useDispatch()

    let voiceDevice
    let deviceDetails

    // responsible for handling call events
    useEffect(() => {
        if (activeCall) {
            activeCall.on('accept', call => {
                console.log('connected', call)
                dispatch(setCallStatus({
                    inCall: true,
                    connection: call
                }))
            })
        }
    }, [activeCall, dispatch])

    // responsible for making calls with Twilio Voice SDK
    const makeCall = async (destination) => {
        try {
            const call = await voiceDevice.connect({
                params: {
                    "to": destination,
                    "from": numberInUse,
                    "identity": "dev-phone"
                }
            })
            setActiveCall(call)
        } catch (error) {
            console.error(error)
        }
    }

    // Responsible for disconnecting a specific call
    const hangUp = () => {
        console.log('voicemanager hangup invoked')
        if(activeCall) {
            activeCall.disconnect()
            setActiveCall(null)
        }
    }

    // Responsible for sending DTMF over the call
    const sendDTMF = (num) => {
        if (activeCall) {
            console.log("Sending DTMF " + num);
            activeCall.sendDigits(num);
        }
    }

    if (!voiceDevice) {
        // initialize voiceDevice with Access Token Action/State from Redux?
        voiceDevice = new Device(twilioAccessToken, {
            codecPreferences: ["opus", "pcmu"],
            fakeLocalDTMF: true,
            debug: true,
            enableRingingState: true,
            logLevel: '1'
        })

        voiceDevice.on("registered", () => {
            console.log("Registered voice device")
        });

        voiceDevice.on("incoming", (call) => {
            console.log("Receiving incoming call")
            setActiveCall(call)
        })

        voiceDevice.on('connect', call => {
            call.on('disconnect', call => {
                console.log('voicemanager disconnect event called')
            })
        })

        // voiceDevice.on('disconnect', call => {
        //     console.log('voicemanager disconnect event called')
        //     dispatch(setCallStatus(call))
        //     // setCallStatus({ inCall: false, message: "ready (disconnected)", connection: null });
        // })


        deviceDetails = {
            voiceDevice: voiceDevice,
            activeCall,
            callStatus,
            makeCall,
            sendDTMF,
            hangUp,
        }
    }

    return (
        <TwilioVoiceContext.Provider value={deviceDetails}>
            {children}
        </TwilioVoiceContext.Provider>
    )

};

export default TwilioVoiceManager