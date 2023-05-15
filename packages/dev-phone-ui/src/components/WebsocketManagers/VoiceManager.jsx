import React, {useCallback, useState, useEffect, useRef} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Device } from '@twilio/voice-sdk'
import { updateCallInformation, updateMuteStatus } from '../../actions'

// Establish context with relevant websocket resources for child components
const TwilioVoiceContext = React.createContext(null)
export { TwilioVoiceContext }

const TwilioVoiceManager = ({ children }) => {
    const voiceDevice = useRef(null)
    const deviceDetails = useRef({})
    const twilioAccessToken = useSelector(state => state.twilioAccessToken)
    const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "")
    const dispatch = useDispatch()
    const [activeCall, setActiveCall] = useState(null)

    const updateCallInfo = useCallback((call) => {
        dispatch(updateCallInformation(call))
    }, [dispatch])

    const updateIsMutedStatus = useCallback((isMuted) => {
        dispatch(updateMuteStatus(isMuted))
    }, [dispatch])

    // responsible for making calls with Twilio Voice SDK
    const makeCall = async (destination) => {
        try {
            const call = await voiceDevice.current.connect({
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

    // responsible for handling call events and defining call methods
    useEffect(() => {
        if (activeCall) {
            deviceDetails.current.acceptCall = () => activeCall.accept()
            updateCallInfo(activeCall)

            // Responsible for disconnecting a specific call
            deviceDetails.current.hangUp = () => {
                activeCall.disconnect()
                setActiveCall(null)
            }

            // Responsible for sending DTMF over the call
            deviceDetails.current.sendDTMF = (num) => {
                console.log("Sending DTMF " + JSON.stringify(num));
                activeCall.sendDigits(num);
            }

            deviceDetails.current.toggleMute = () => {
                 console.log('activeCall', activeCall);
                if (!activeCall) {
                    return;
                }
                console.log('isMuted', activeCall.isMuted());
                activeCall.mute(!activeCall.isMuted());
            }

            activeCall.on('accept', call => {
                updateCallInfo(call)
            })

            activeCall.on('connect', call => {
                updateCallInfo(call)
            })

            activeCall.on('disconnect', call => {
                call.removeAllListeners()
                updateCallInfo(null)
            })

            activeCall.on('mute', isMuted => {
                updateIsMutedStatus(isMuted);
            })
        }
    }, [activeCall, updateCallInfo])

    // Creates the Twilio Voice Device basis for this context
    if (!voiceDevice.current) {
        const device = new Device(twilioAccessToken, {
            codecPreferences: ["opus", "pcmu"],
            fakeLocalDTMF: true,
            debug: false,
            enableRingingState: true,
            logLevel: '1'
        })


        device.register()

        device.on("registered", () => {
            console.log("Registered voice device")
        })

        device.on("incoming", (call) => {
            setActiveCall(call)
        })

        voiceDevice.current = device

        deviceDetails.current = {
            voiceDevice: voiceDevice,
            hangUp: () => {},
            sendDTMF: () => {},
            updateCallInfo,
            makeCall,
            toggleMute: () => {}
        }
    }

    return (
        <TwilioVoiceContext.Provider value={deviceDetails.current}>
            {children}
        </TwilioVoiceContext.Provider>
    )

};

export default TwilioVoiceManager