import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Flex, MediaBody, MediaFigure, MediaObject, ScreenReaderOnly, Text } from "@twilio-paste/core";
import { CopyIcon } from "@twilio-paste/icons/esm/CopyIcon";

function getIncomingCallerNumber(call) {
    if (!call) {
        return null;
    }

    const customFrom = call.customParameters && typeof call.customParameters.get === 'function'
        ? call.customParameters.get('From') || call.customParameters.get('from')
        : null;

    return call.parameters?.From
        || call.parameters?.from
        || call._options?.twimlParams?.from
        || customFrom
        || null;
}

function getOutgoingDestinationNumber(call) {
    if (!call) {
        return null;
    }

    return call._options?.twimlParams?.to
        || call.parameters?.To
        || call.parameters?.to
        || null;
}

function getConnectedPeerNumber(call) {
    if (!call) {
        return null;
    }

    if (call._direction === 'OUTGOING') {
        return getOutgoingDestinationNumber(call);
    }

    return getIncomingCallerNumber(call);
}

function getCallSid(call) {
    if (!call) {
        return null;
    }

    return call.parameters?.CallSid
        || call.parameters?.callSid
        || call._options?.callSid
        || call._callSid
        || null;
}

function CallStatusMessage({ voiceDevice, currentCallInfo }) {
    const [message, setMessage] = useState('initializing')
    const [statusColor, setStatusColor] = useState('colorBackgroundBusy')
    const [showCopyToast, setShowCopyToast] = useState(false)
    const [copyToastMessage, setCopyToastMessage] = useState('Copied to clipboard')
    const copyToastTimeoutRef = useRef(null)

    const connectedPeerNumber = currentCallInfo && currentCallInfo._wasConnected
        ? getConnectedPeerNumber(currentCallInfo)
        : null;
    const callSid = currentCallInfo ? getCallSid(currentCallInfo) : null;

    useEffect(() => {
        return () => {
            if (copyToastTimeoutRef.current) {
                clearTimeout(copyToastTimeoutRef.current)
            }
        }
    }, [])

    function showCopiedToast(toastMessage) {
        setCopyToastMessage(toastMessage)
        setShowCopyToast(true)
        if (copyToastTimeoutRef.current) {
            clearTimeout(copyToastTimeoutRef.current)
        }
        copyToastTimeoutRef.current = setTimeout(() => setShowCopyToast(false), 2000)
    }

    function copyConnectedPeerNumber() {
        if (!connectedPeerNumber || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
            return;
        }

        navigator.clipboard.writeText(connectedPeerNumber)
            .then(() => showCopiedToast('Copied connected number to clipboard'))
            .catch(() => { })
    }

    function copyCallSid() {
        if (!callSid || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
            return;
        }

        navigator.clipboard.writeText(callSid)
            .then(() => showCopiedToast('Copied call SID to clipboard'))
            .catch(() => { })
    }

    useEffect(() => {
        if (voiceDevice && !currentCallInfo) {
            setMessage('ready for calls')
            setStatusColor('colorBackgroundSuccess')
        }

        if (voiceDevice && currentCallInfo) {
            setStatusColor('colorBackgroundBusy')
            if (currentCallInfo._direction === 'OUTGOING') {
                const destinationNumber = getOutgoingDestinationNumber(currentCallInfo)
                setMessage(destinationNumber ? `calling ${destinationNumber}` : 'calling')
            } else {
                setMessage('incoming call')
            }
            if (currentCallInfo && currentCallInfo._wasConnected) {
                const peerNumber = getConnectedPeerNumber(currentCallInfo)
                setMessage(peerNumber ? `Connected to ${peerNumber}` : 'Call connected')
                setStatusColor('colorBackgroundSuccess')
            }
        }
    }, [voiceDevice, currentCallInfo])

    return (
        <Box>
            <Flex hAlignContent={"center"}>
                <MediaObject verticalAlign="center">
                    <MediaFigure spacing={"space20"}><Box borderRadius={"borderRadiusCircle"} padding={"space20"} backgroundColor={statusColor} /></MediaFigure>
                    <MediaBody>
                        <Flex vAlignContent="center" columnGap="space30">
                            <Text as={"p"} fontStyle={"italic"}>{message}</Text>
                            {connectedPeerNumber && (
                                <Button variant="secondary_icon" size="reset" onClick={copyConnectedPeerNumber}>
                                    <ScreenReaderOnly>Copy connected number</ScreenReaderOnly>
                                    <CopyIcon decorative={false} title="Copy connected number" />
                                </Button>
                            )}
                        </Flex>
                        {callSid && (
                            <Flex marginTop="space20" vAlignContent="center" columnGap="space30">
                                <Text as="p" fontSize="fontSize20" color="colorTextWeak">
                                    SID: {callSid}
                                </Text>
                                <Button variant="secondary_icon" size="reset" onClick={copyCallSid}>
                                    <ScreenReaderOnly>Copy call SID</ScreenReaderOnly>
                                    <CopyIcon decorative={false} title="Copy call SID" />
                                </Button>
                            </Flex>
                        )}
                    </MediaBody>
                </MediaObject>
            </Flex>
            {showCopyToast && (
                <>
                    <style>{`
                        @keyframes toastFadeOut {
                            0%, 75% { opacity: 1; }
                            100% { opacity: 0; }
                        }
                    `}</style>
                    <Box
                        position="fixed"
                        bottom="space70"
                        right="space70"
                        zIndex="zIndex90"
                        boxShadow="shadowCard"
                        style={{ animation: 'toastFadeOut 2s ease-in forwards', minWidth: '240px' }}
                    >
                        <Alert variant="neutral">{copyToastMessage}</Alert>
                    </Box>
                </>
            )}
        </Box>
    )
}

export default CallStatusMessage
