import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Device } from '@twilio/voice-sdk'

// Establish context with default values
export const TwilioVoiceContext = React.createContext(null)
export const useTwilioVoice = () => React.useContext(TwilioVoiceContext)

const TwilioVoiceManager = ({ children }) => {
    const twilioAccessToken = useSelector((state) => state.twilioAccessToken)
    let voiceDevice
    let deviceDetails

    const dispatch = useDispatch()

    const makeCall = (destination) => {
        // create a payload
        // send this using the phone
        // dispatch an action to update UI accordingly
    }

    if (!voiceDevice) {
        // initialize voiceDevice with Access Token Action/State from Redux?
        voiceDevice = new Device()

        voiceDevice.on('incoming', connection => {
            // immediately accepts incoming connection
            connection.accept()
            // dispatch(handleIncomingCall({status: connection.status()}))
        })

        voiceDevice.on('ready', device => {
            const payload = {
                status: 'device ready',
                ready: true
            }
            // dispatch(toggleVoiceReady(payload) )
        })

        voiceDevice.on('connect', connection => {
            const payload = {status: connection.status}
            // dispatch(handleVoiceConnection(payload))
        })

        voiceDevice.on('disconnect', connection => {
            const payload = {status: connection.status}
            // dispatch(handleVoiceConnection(payload))
        })

        deviceDetails = {
            voiceDevice: voiceDevice,
            makeCall
        }
    }

    return (
        <TwilioVoiceContext.Provider value={deviceDetails}>
            {children}
        </TwilioVoiceContext.Provider>
    )

};

export default TwilioVoiceManager