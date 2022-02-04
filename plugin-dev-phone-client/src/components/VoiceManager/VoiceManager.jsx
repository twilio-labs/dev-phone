import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Device } from '@twilio/voice-sdk'
import { setActiveCall } from '../../actions'

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

    const addCallToStore = (call) => {
        dispatch(setActiveCall(call))
    }

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
            addCallToStore(call)
        } catch (error) {
            console.error(error)
        }
    }

    // Responsible for disconnecting a specific call
    const hangUp = (call) => {
        call.disconnect()
        addCallToStore(null)
    }

    // Responsible for sending DTMF over the call
    const sendDTMF = (num, call) => {
        console.log("Sending DTMF " + num);
        call.sendDigits(num);
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

        voiceDevice.register()

        voiceDevice.on("registered", () => {
            console.log("Registered voice device")
        });

        voiceDevice.on("incoming", (call) => {
            console.log("Receiving incoming call")
            addCallToStore(call)
        })

        deviceDetails = {
            voiceDevice: voiceDevice,
            callStatus,
            addCallToStore,
            hangUp,
            makeCall,
            sendDTMF
        }
    }

    return (
        <TwilioVoiceContext.Provider value={deviceDetails}>
            {children}
        </TwilioVoiceContext.Provider>
    )

};

export default TwilioVoiceManager