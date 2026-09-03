import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Device } from '@twilio/voice-sdk'
import {
    addDebugEvent,
    updateCallInformation,
    updateMuteStatus,
    updateVoiceDeviceError,
    updateVoiceDeviceStatus,
} from '../../actions'

const QUIETER_INCOMING_RINGTONE_URL = 'https://sdk.twilio.com/js/client/sounds/releases/1.0.0/outgoing.mp3'

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

    const logDebugEvent = useCallback((level, message, data = null) => {
        dispatch(addDebugEvent({
            level,
            message,
            data,
            timestamp: new Date().toISOString(),
        }));
    }, [dispatch])

    const getCallDiagnostics = useCallback((call) => {
        const safeStatus = typeof call?.status === 'function' ? call.status() : (call?.status || null)
        const safeDirection = call?.direction || call?.parameters?.Direction || call?.parameters?.CallDirection || null
        const parameters = call?.parameters && typeof call.parameters === 'object' ? call.parameters : null

        return {
            sid: call?.parameters?.CallSid || call?._callSid || call?.sid || null,
            status: safeStatus,
            direction: safeDirection,
            from: call?.parameters?.From || call?.parameters?.from || null,
            to: call?.parameters?.To || call?.parameters?.to || null,
            parameters,
        }
    }, [])

    const getBrowserMediaDiagnostics = useCallback(async () => {
        const hasNavigator = typeof navigator !== 'undefined'
        const hasMediaDevices = !!navigator?.mediaDevices
        const hasGetUserMedia = typeof navigator?.mediaDevices?.getUserMedia === 'function'
        const isSecure = typeof window !== 'undefined' ? window.isSecureContext : null

        let permissionsApiSupported = false
        let microphonePermission = 'unknown'
        try {
            permissionsApiSupported = typeof navigator?.permissions?.query === 'function'
            if (permissionsApiSupported) {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' })
                microphonePermission = permissionStatus?.state || 'unknown'
            }
        } catch (error) {
            microphonePermission = 'unknown'
        }

        let audioInputCount = null
        try {
            if (typeof navigator?.mediaDevices?.enumerateDevices === 'function') {
                const devices = await navigator.mediaDevices.enumerateDevices()
                audioInputCount = devices.filter((device) => device.kind === 'audioinput').length
            }
        } catch (error) {
            audioInputCount = null
        }

        return {
            hasNavigator,
            isSecureContext: isSecure,
            hasMediaDevices,
            hasGetUserMedia,
            permissionsApiSupported,
            microphonePermission,
            audioInputCount,
            userAgent: hasNavigator ? navigator.userAgent : null,
        }
    }, [])

    const ensureMicrophoneAvailable = useCallback(async () => {
        const diagnostics = await getBrowserMediaDiagnostics()

        if (!diagnostics.hasMediaDevices || !diagnostics.hasGetUserMedia) {
            return {
                ok: false,
                reason: 'MediaDevices API is unavailable in this browser/runtime.',
                errorName: 'NotSupportedError',
                diagnostics,
            }
        }

        if (diagnostics.audioInputCount === 0) {
            return {
                ok: false,
                reason: 'No microphone input devices were detected by the browser.',
                errorName: 'NotFoundError',
                diagnostics,
            }
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach((track) => track.stop())
            return {
                ok: true,
                diagnostics,
            }
        } catch (error) {
            return {
                ok: false,
                reason: error?.message || 'Unable to capture microphone audio.',
                errorName: error?.name || 'GetUserMediaError',
                diagnostics,
            }
        }
    }, [getBrowserMediaDiagnostics])

    // responsible for making calls with Twilio Voice SDK
    const makeCall = async (destination) => {
        try {
            if (!voiceDevice.current) {
                console.warn('Voice device is not ready yet; cannot place call.');
                logDebugEvent('warn', 'Attempted outbound call while device was not ready');
                return;
            }
            const call = await voiceDevice.current.connect({
                params: {
                    "to": destination,
                    "from": numberInUse,
                    "identity": "dev-phone"
                }
            })
            logDebugEvent('info', 'Outbound call started', {
                to: destination,
                from: numberInUse,
                sid: call?.parameters?.CallSid || call?._callSid || null,
            });
            setActiveCall(call)
        } catch (error) {
            console.error(error)
            logDebugEvent('error', 'Outbound call failed to start', {
                message: error?.message || 'Unknown error',
                code: error?.code || null,
            });
        }
    }

    // responsible for handling call events and defining call methods
    useEffect(() => {
        if (activeCall) {
            deviceDetails.current.acceptCall = async () => {
                logDebugEvent('info', 'Answer action triggered', getCallDiagnostics(activeCall));

                const micCheck = await ensureMicrophoneAvailable()
                if (!micCheck.ok) {
                    const errorMessage = `Microphone preflight failed: ${micCheck.errorName || 'Error'}${micCheck.reason ? ` - ${micCheck.reason}` : ''}`
                    dispatch(updateVoiceDeviceStatus('error'))
                    dispatch(updateVoiceDeviceError({
                        code: micCheck.errorName || null,
                        message: errorMessage,
                        causes: [
                            'Confirm microphone permission is allowed for this site.',
                            'Ensure at least one audio input device is available.',
                            'Use a secure context (https or localhost) in a supported browser.',
                        ],
                    }))
                    logDebugEvent('error', 'Microphone preflight failed before answering', {
                        call: getCallDiagnostics(activeCall),
                        ...micCheck,
                    })
                    return
                }

                dispatch(updateVoiceDeviceError(null))
                logDebugEvent('info', 'Microphone preflight passed', {
                    call: getCallDiagnostics(activeCall),
                    diagnostics: micCheck.diagnostics,
                })
                activeCall.accept()
            }
            deviceDetails.current.declineCall = () => {
                logDebugEvent('info', 'Decline action triggered', getCallDiagnostics(activeCall));
                activeCall.reject()
                setActiveCall(null)
            }
            updateCallInfo(activeCall)

            // Responsible for disconnecting a specific call
            deviceDetails.current.hangUp = () => {
                logDebugEvent('info', 'Hang up action triggered', getCallDiagnostics(activeCall));
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
                logDebugEvent('info', 'Call accepted', {
                    sid: call?.parameters?.CallSid || call?._callSid || null,
                });
                updateCallInfo(call)
            })

            activeCall.on('connect', call => {
                logDebugEvent('info', 'Call connected', {
                    sid: call?.parameters?.CallSid || call?._callSid || null,
                });
                updateCallInfo(call)
            })

            activeCall.on('disconnect', call => {
                logDebugEvent('info', 'Call disconnected', getCallDiagnostics(call));
                call.removeAllListeners()
                setActiveCall(null)
                updateCallInfo(null)
            })

            activeCall.on('cancel', call => {
                logDebugEvent('warn', 'Call canceled', {
                    sid: call?.parameters?.CallSid || call?._callSid || null,
                });
                call.removeAllListeners()
                setActiveCall(null)
                updateCallInfo(null)
            })

            activeCall.on('reject', call => {
                logDebugEvent('warn', 'Call rejected', {
                    sid: call?.parameters?.CallSid || call?._callSid || null,
                });
                call.removeAllListeners()
                setActiveCall(null)
                updateCallInfo(null)
            })

            activeCall.on('error', (error) => {
                console.error('Active call error', error)
                logDebugEvent('error', 'Active call error', {
                    message: error?.message || 'Unknown call error',
                    code: error?.code || null,
                    causes: Array.isArray(error?.causes) ? error.causes : [],
                    call: getCallDiagnostics(activeCall),
                });
            })

            activeCall.on('mute', isMuted => {
                logDebugEvent('info', isMuted ? 'Call muted' : 'Call unmuted')
                updateIsMutedStatus(isMuted);
            })
        }
    }, [activeCall, dispatch, ensureMicrophoneAvailable, getCallDiagnostics, logDebugEvent, updateCallInfo, updateIsMutedStatus])

    useEffect(() => {
        if (!twilioAccessToken) {
            dispatch(updateVoiceDeviceStatus('disconnected'));
            dispatch(updateVoiceDeviceError(null));
            logDebugEvent('warn', 'Voice device disconnected: missing access token');
            return;
        }

        if (voiceDevice.current) {
            try {
                voiceDevice.current.destroy();
            } catch (error) {
                console.error('Failed to destroy existing voice device', error);
            }
            voiceDevice.current = null;
        }

        const device = new Device(twilioAccessToken, {
            codecPreferences: ["opus", "pcmu"],
            fakeLocalDTMF: true,
            debug: false,
            enableRingingState: true,
            sounds: {
                incoming: QUIETER_INCOMING_RINGTONE_URL
            }
        })

        device.on("registered", () => {
            console.log("Registered voice device")
            dispatch(updateVoiceDeviceStatus('registered'));
            dispatch(updateVoiceDeviceError(null));
            logDebugEvent('info', 'Voice device registered');
        })

        device.on("unregistered", () => {
            console.warn("Voice device became unregistered")
            dispatch(updateVoiceDeviceStatus('unregistered'));
            logDebugEvent('warn', 'Voice device unregistered');
        })

        device.on("incoming", (call) => {
            console.log('Incoming call received', call?.parameters?.CallSid || call?._callSid)
            logDebugEvent('info', 'Incoming call received', {
                sid: call?.parameters?.CallSid || call?._callSid || null,
                from: call?.parameters?.From || call?.parameters?.from || null,
            });
            setActiveCall(call)
        })

        device.on("error", (error) => {
            console.error("Voice device error", error)
            dispatch(updateVoiceDeviceStatus('error'));
            dispatch(updateVoiceDeviceError({
                code: error?.code || null,
                message: error?.message || 'Unknown voice device error',
                causes: Array.isArray(error?.causes) ? error.causes : [],
            }));
            logDebugEvent('error', 'Voice device error', {
                message: error?.message || 'Unknown voice device error',
                code: error?.code || null,
            });
        })

        device.on("registering", () => {
            console.log("Registering voice device")
            dispatch(updateVoiceDeviceStatus('registering'));
            dispatch(updateVoiceDeviceError(null));
            logDebugEvent('info', 'Voice device registering');
        })

        device.register()

        voiceDevice.current = device

        deviceDetails.current = {
            voiceDevice: voiceDevice,
            hangUp: () => { },
            declineCall: () => { },
            sendDTMF: () => { },
            updateCallInfo,
            makeCall,
            toggleMute: () => { }
        }

        return () => {
            try {
                device.destroy();
            } catch (error) {
                console.error('Failed to clean up voice device', error);
            }
            if (voiceDevice.current === device) {
                voiceDevice.current = null;
            }
            dispatch(updateVoiceDeviceStatus('disconnected'));
            logDebugEvent('info', 'Voice device destroyed');
        }
    }, [dispatch, logDebugEvent, twilioAccessToken, updateCallInfo])

    if (!deviceDetails.current.voiceDevice) {
        deviceDetails.current = {
            voiceDevice: voiceDevice,
            hangUp: () => { },
            declineCall: () => { },
            sendDTMF: () => { },
            updateCallInfo,
            makeCall,
            toggleMute: () => { }
        }
    }

    return (
        <TwilioVoiceContext.Provider value={deviceDetails.current}>
            {children}
        </TwilioVoiceContext.Provider>
    )

};

export default TwilioVoiceManager
