import { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Alert, Box, Button, Flex, ScreenReaderOnly, Text } from "@twilio-paste/core";
import { CopyIcon } from "@twilio-paste/icons/esm/CopyIcon";
import { CallIncomingIcon } from "@twilio-paste/icons/esm/CallIncomingIcon";
import { CallFailedIcon } from "@twilio-paste/icons/esm/CallFailedIcon";
import { TwilioVoiceContext } from "../WebsocketManagers/VoiceManager";

function getFromNumber(call) {
    if (!call) return null;
    const customFrom = call.customParameters && typeof call.customParameters.get === 'function'
        ? call.customParameters.get('From') || call.customParameters.get('from')
        : null;

    return call.parameters?.From
        || call.parameters?.from
        || call._options?.twimlParams?.from
        || customFrom
        || null;
}

function getToNumber(call) {
    if (!call) return null;
    const customTo = call.customParameters && typeof call.customParameters.get === 'function'
        ? call.customParameters.get('To') || call.customParameters.get('to')
        : null;

    return call.parameters?.To
        || call.parameters?.to
        || call._options?.twimlParams?.to
        || customTo
        || null;
}

function getClientIdentity(value) {
    if (!value || typeof value !== 'string') return null;
    if (!value.startsWith('client:')) return null;
    return value.slice('client:'.length);
}

function getIncomingCallerNumber(call) {
    if (!call) return null;
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
    if (!call) return null;

    return call._options?.twimlParams?.to
        || call.parameters?.To
        || call.parameters?.to
        || null;
}

function getConnectedPeerNumber(call) {
    if (!call) return null;
    if (call._direction === 'OUTGOING') return getOutgoingDestinationNumber(call);
    return getIncomingCallerNumber(call);
}

function getCallSid(call) {
    if (!call) return null;

    return call.parameters?.CallSid
        || call.parameters?.callSid
        || call._options?.callSid
        || call._callSid
        || null;
}

function formatDuration(totalMs) {
    if (!totalMs || totalMs < 1000) return '0:00';

    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function extractPhoneNumber(value) {
    if (!value || typeof value !== 'string') return null;

    const normalized = value.trim();
    // Keep copy behavior strict: only allow E.164-like values (optionally wrapped in common separators).
    const match = normalized.match(/\+\d[\d\s().-]{6,}\d/);
    if (!match) return null;

    const digitsOnly = match[0].replace(/[^\d+]/g, '');
    return digitsOnly.startsWith('+') ? digitsOnly : `+${digitsOnly}`;
}

function CallStatusBar() {
    const currentCallInfo = useSelector((state) => state.currentCallInfo);
    const devPhoneNumber = useSelector((state) => state.numberInUse?.phoneNumber || null);
    const dialer = useContext(TwilioVoiceContext);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [lastCallInfo, setLastCallInfo] = useState(null);
    const [callSessionMeta, setCallSessionMeta] = useState({
        callSid: null,
        startedAt: null,
        connectedAt: null,
        endedAt: null,
        direction: null,
        lastConnectedPeerNumber: null,
    });
    const toastTimeoutRef = useRef(null);
    const isLiveCall = !!currentCallInfo;
    const displayCallInfo = currentCallInfo || lastCallInfo;

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
                toastTimeoutRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!currentCallInfo) {
            setCallSessionMeta((prev) => {
                if (!prev.startedAt || prev.endedAt) return prev;
                return { ...prev, endedAt: Date.now() };
            });
            return;
        }

        setLastCallInfo(currentCallInfo);

        const activeCallSid = getCallSid(currentCallInfo);
        const isConnectedNow = currentCallInfo._mediaStatus === 'open' || !!currentCallInfo._wasConnected;
        const connectedPeerPhone = extractPhoneNumber(getConnectedPeerNumber(currentCallInfo));
        setCallSessionMeta((prev) => {
            const now = Date.now();
            const isNewSession = !prev.startedAt
                || !!prev.endedAt
                || (activeCallSid && prev.callSid && prev.callSid !== activeCallSid);

            const base = isNewSession
                ? {
                    callSid: activeCallSid || null,
                    startedAt: now,
                    connectedAt: null,
                    endedAt: null,
                    direction: currentCallInfo._direction || null,
                    lastConnectedPeerNumber: connectedPeerPhone,
                }
                : {
                    ...prev,
                    callSid: activeCallSid || prev.callSid,
                    endedAt: null,
                    direction: currentCallInfo._direction || prev.direction,
                };

            const connectedAt = isConnectedNow ? (base.connectedAt || now) : base.connectedAt;
            const lastConnectedPeerNumber = connectedPeerPhone || base.lastConnectedPeerNumber;

            if (
                prev.callSid === base.callSid
                && prev.startedAt === base.startedAt
                && prev.connectedAt === connectedAt
                && prev.endedAt === base.endedAt
                && prev.direction === base.direction
                && prev.lastConnectedPeerNumber === lastConnectedPeerNumber
            ) {
                return prev;
            }

            return {
                ...base,
                connectedAt,
                lastConnectedPeerNumber,
            };
        });
    }, [currentCallInfo]);

    if (!displayCallInfo) {
        return null;
    }

    const toNumber = getToNumber(displayCallInfo);
    const fromNumber = getFromNumber(displayCallInfo);
    const toClientIdentity = getClientIdentity(toNumber);
    const callDirection = displayCallInfo._direction || callSessionMeta.direction;
    const isIncomingDirection = callDirection === 'INCOMING';
    const isConnected = isLiveCall && (currentCallInfo._mediaStatus === 'open' || !!currentCallInfo._wasConnected);
    const connectedPeerNumber = isConnected ? getConnectedPeerNumber(displayCallInfo) : null;
    const incomingToPhoneValue = extractPhoneNumber(toNumber)
        || extractPhoneNumber(devPhoneNumber)
        || devPhoneNumber
        || toNumber
        || null;
    const outgoingToPhoneValue = extractPhoneNumber(connectedPeerNumber)
        || callSessionMeta.lastConnectedPeerNumber
        || extractPhoneNumber(toNumber)
        || toNumber
        || null;
    const toPhoneValue = isIncomingDirection ? incomingToPhoneValue : outgoingToPhoneValue;
    const toCopyValue = extractPhoneNumber(toPhoneValue) || extractPhoneNumber(toNumber);
    const fromCopyValue = extractPhoneNumber(fromNumber);
    const isIncomingCall = !!currentCallInfo && !!dialer?.acceptCall && currentCallInfo._direction === 'INCOMING';
    const isIncomingCallRinging = isIncomingCall && currentCallInfo._mediaStatus !== "open";
    const canEndLiveCall = !!currentCallInfo && !isIncomingCallRinging && !!dialer?.hangUp;
    const directionLabel = callDirection === 'INCOMING'
        ? 'Incoming'
        : callDirection === 'OUTGOING'
            ? 'Outgoing'
            : null;
    const durationStart = callSessionMeta.connectedAt || callSessionMeta.startedAt;
    const durationEnd = callSessionMeta.endedAt || (isLiveCall ? Date.now() : null);
    const durationLabel = durationStart && durationEnd
        ? formatDuration(Math.max(durationEnd - durationStart, 0))
        : null;
    const activityLabel = isLiveCall
        ? (isConnected ? 'Live' : 'Ringing')
        : 'Ended';
    const statsSummary = [activityLabel, directionLabel, durationLabel ? `Duration ${durationLabel}` : null]
        .filter(Boolean)
        .join(' • ');

    function showCopiedToast(msg) {
        setToastMessage(msg);
        setShowToast(true);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2000);
    }

    function copyValue(value, label) {
        if (!value || !navigator.clipboard?.writeText) return;
        navigator.clipboard.writeText(value)
            .then(() => showCopiedToast(`Copied ${label} to clipboard`))
            .catch(() => { });
    }

    return (
        <Box
            width="100%"
            backgroundColor="colorBackgroundInfo"
            paddingY="space50"
            paddingX="space60"
            borderBottomStyle="solid"
            borderBottomWidth="borderWidth10"
            borderBottomColor="colorBorderInfoWeak"
        >
            <style>{`
                .callActionButton {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 58px;
                    height: 58px;
                    border-radius: 9999px;
                    border: 1px solid transparent;
                    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
                    transition: transform 140ms ease, box-shadow 140ms ease, filter 140ms ease;
                }

                .callActionButton:hover {
                    transform: translateY(-1px);
                    filter: brightness(1.03);
                    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.24);
                }

                .callActionButton:active {
                    transform: translateY(0);
                }

                .callActionButton:focus-visible {
                    outline: 2px solid rgba(2, 99, 224, 0.45);
                    outline-offset: 3px;
                }

                .callActionAnswer {
                    background: #e9fcef;
                    border-color: #7ccf8a;
                }

                .callActionEnd {
                    background: #ffe9e9;
                    border-color: #f08a8a;
                }

                .callContactCard {
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.86));
                    border: 1px solid rgba(2, 99, 224, 0.24);
                    border-radius: 14px;
                    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
                    padding: 14px 16px;
                }

                .callConnectionHeader {
                    display: flex;
                    align-items: center;
                    column-gap: 10px;
                    padding-bottom: 12px;
                    margin-bottom: 12px;
                    border-bottom: 1px solid rgba(2, 99, 224, 0.2);
                }

                .callConnectionMeta {
                    display: block;
                    margin-top: 2px;
                }

                .callConnectionGrid {
                    display: grid;
                    row-gap: 12px;
                }

                .callConnectionRow {
                    display: grid;
                    grid-template-columns: minmax(45px, auto) 1fr auto;
                    align-items: center;
                    column-gap: 10px;
                    padding: 10px 12px;
                    border: 1px solid rgba(15, 23, 42, 0.12);
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.9);
                }

                .callConnectionValue {
                    display: inline-flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 6px;
                    min-width: 0;
                    word-break: break-word;
                }

                .callCopyButton {
                    min-width: 64px;
                }

                @media (max-width: 680px) {
                    .callConnectionRow {
                        grid-template-columns: minmax(45px, auto) 1fr;
                    }

                    .callCopyButton {
                        grid-column: 1 / -1;
                        justify-self: start;
                    }
                }

                .callActionGroup {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    row-gap: 9px;
                }

                .callActionLabel {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    opacity: 0;
                    transform: translateY(-2px);
                    transition: opacity 140ms ease, transform 140ms ease;
                    user-select: none;
                }

                .callActionGroup:hover .callActionLabel,
                .callActionGroup:focus-within .callActionLabel {
                    opacity: 1;
                    transform: translateY(0);
                }

                @media (min-width: 900px) {
                    .callActionLabel {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            <Box className="callContactCard">
                <Box className="callConnectionHeader">
                    <Box
                        borderRadius="borderRadiusCircle"
                        backgroundColor={isConnected ? "colorBackgroundSuccess" : (isLiveCall ? "colorBackgroundWarning" : "colorBackground")}
                        style={{ width: '10px', height: '10px' }}
                    />
                    <Box>
                        <Text as="span" fontWeight="fontWeightSemibold" fontSize="fontSize40">
                            {isLiveCall ? (isConnected ? 'Connected:' : 'Connecting...') : 'Last call:'}
                        </Text>
                        <Text as="span" fontSize="fontSize20" color="colorTextWeak" className="callConnectionMeta">
                            {statsSummary}
                        </Text>
                    </Box>
                </Box>
                <Box className="callConnectionGrid">
                    <Box className="callConnectionRow">
                        <Text as="span" fontWeight="fontWeightSemibold" fontSize="fontSize30">
                            To:
                        </Text>
                        <Box className="callConnectionValue">
                            {toClientIdentity && (
                                <Text as="span" fontSize="fontSize30" fontWeight="fontWeightSemibold">
                                    {toClientIdentity}
                                </Text>
                            )}
                            <Text as="span" fontSize="fontSize30" color="colorTextWeak">
                                {toPhoneValue || 'Unknown'}
                            </Text>
                        </Box>
                        {toCopyValue && (
                            <Button
                                variant="secondary"
                                size="small"
                                className="callCopyButton"
                                onClick={() => copyValue(toCopyValue, 'destination number')}
                            >
                                <ScreenReaderOnly>Copy connected number</ScreenReaderOnly>
                                <Box as="span" display="inline-flex" alignItems="center" columnGap="space20">
                                    <CopyIcon decorative={false} title="Copy connected number" />
                                    <Text as="span" fontSize="fontSize20">Copy</Text>
                                </Box>
                            </Button>
                        )}
                    </Box>
                    <Box className="callConnectionRow">
                        <Text as="span" fontWeight="fontWeightSemibold" fontSize="fontSize30">
                            From:
                        </Text>
                        <Box className="callConnectionValue">
                            <Text as="span" fontSize="fontSize30" color="colorTextWeak">
                                {fromNumber || 'Unknown'}
                            </Text>
                        </Box>
                        {fromCopyValue && (
                            <Button
                                variant="secondary"
                                size="small"
                                className="callCopyButton"
                                onClick={() => copyValue(fromCopyValue, 'source number')}
                            >
                                <ScreenReaderOnly>Copy source number</ScreenReaderOnly>
                                <Box as="span" display="inline-flex" alignItems="center" columnGap="space20">
                                    <CopyIcon decorative={false} title="Copy source number" />
                                    <Text as="span" fontSize="fontSize20">Copy</Text>
                                </Box>
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
            {(isIncomingCallRinging || canEndLiveCall) && (
                <Flex hAlignContent="center" vAlignContent="center" columnGap="space120" marginTop="space60">
                    {isIncomingCallRinging && (
                        <Box as="span" className="callActionGroup">
                            <Button variant="secondary_icon" size="reset" onClick={dialer.acceptCall}>
                                <ScreenReaderOnly>Answer call</ScreenReaderOnly>
                                <Box as="span" className="callActionButton callActionAnswer" color="colorTextSuccess">
                                    <CallIncomingIcon decorative={false} title="Answer call" size="sizeIcon70" />
                                </Box>
                            </Button>
                            <Text as="span" className="callActionLabel" color="colorTextSuccess">
                                Answer
                            </Text>
                        </Box>
                    )}
                    {(isIncomingCallRinging || canEndLiveCall) && (
                        <Box as="span" className="callActionGroup">
                            <Button
                                variant="secondary_icon"
                                size="reset"
                                onClick={isIncomingCallRinging ? dialer.declineCall : dialer.hangUp}
                            >
                                <ScreenReaderOnly>{isIncomingCallRinging ? 'Decline call' : 'Hang up call'}</ScreenReaderOnly>
                                <Box as="span" className="callActionButton callActionEnd" color="colorTextError">
                                    <CallFailedIcon
                                        decorative={false}
                                        title={isIncomingCallRinging ? 'Decline call' : 'Hang up call'}
                                        size="sizeIcon70"
                                    />
                                </Box>
                            </Button>
                            <Text as="span" className="callActionLabel" color="colorTextError">
                                {isIncomingCallRinging ? 'Decline' : 'End'}
                            </Text>
                        </Box>
                    )}
                </Flex>
            )}
            {showToast && (
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
                        boxShadow="shadowCard"
                        style={{ animation: 'toastFadeOut 2s ease-in forwards', minWidth: '240px', zIndex: 9999 }}
                    >
                        <Alert variant="neutral">{toastMessage}</Alert>
                    </Box>
                </>
            )}
        </Box>
    );
}

export default CallStatusBar;
