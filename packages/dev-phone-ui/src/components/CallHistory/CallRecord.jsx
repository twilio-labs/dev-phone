import { useMemo, useState } from "react"
import { Box, Flex, Text } from "@twilio-paste/core"

function returnStatusColor(status) {
    if (status === 'completed') {
        return 'colorBorderSuccess'
    } else if (status === 'in-progress' || status === 'initiated' || status === 'ringing') {
        return 'colorBorderWarning'
    } else {
        return 'colorBorderError'
    }
}

function CallRecord({ call, liveCallDetails }) {
    const [showDetails, setShowDetails] = useState(false)
    const { Sid, Status, Timestamp, To, From } = call

    const formattedDetails = useMemo(() => {
        const snapshot = {
            callRecord: call,
            liveCallDetails: liveCallDetails || null,
        }

        return JSON.stringify(snapshot, null, 2)
    }, [call, liveCallDetails])

    function onToggleDetails() {
        setShowDetails((current) => !current)
    }

    function onCardKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggleDetails()
        }
    }

    return (
        <Box
            backgroundColor={"colorBackgroundBody"}
            borderRadius={"borderRadius20"}
            boxShadow={"shadow"}
            padding={"space60"}
            marginY={"space30"}
            borderLeftColor={returnStatusColor(Status)}
            borderLeftWidth={"borderWidth40"}
            borderLeftStyle={"solid"}
            onClick={onToggleDetails}
            onKeyDown={onCardKeyDown}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
        >
            <Text marginBottom={"space10"}>{`${Status}, ${new Date(Timestamp).toLocaleTimeString()}`}</Text>
            <Flex marginBottom={"space10"}>
                <Text fontWeight={"fontWeightBold"}>To:</Text>
                <Text marginLeft={"space30"}>{To}</Text>
                <Text marginLeft={"space60"} fontWeight={"fontWeightBold"}>From:</Text>
                <Text marginLeft={"space30"}>{From}</Text>
            </Flex>
            <Text><strong>SID:</strong> {Sid}</Text>
            <Text as="p" color="colorTextWeak" marginTop="space20">
                {showDetails ? 'Click to hide details' : 'Click to show full details'}
            </Text>

            {showDetails && (
                <Box marginTop="space40">
                    {liveCallDetails && (
                        <>
                            <Text as="p" fontWeight="fontWeightBold" marginBottom="space20">Live Call Snapshot</Text>
                            <Text as="p" marginBottom="space20">
                                <strong>{liveCallDetails.statusLabel}:</strong> {liveCallDetails.displayNumber || 'Unknown'}
                            </Text>
                            <Text as="p" marginBottom="space20">
                                <strong>Direction:</strong> {liveCallDetails.direction || 'Unknown'}
                            </Text>
                            {liveCallDetails.callSids?.map(({ label, value }) => (
                                <Text key={`${label}-${value}`} as="p" marginBottom="space10">
                                    <strong>{label}:</strong> {value}
                                </Text>
                            ))}
                            {liveCallDetails.customParams?.map(([key, value]) => (
                                <Text key={key} as="p" marginBottom="space10">
                                    <strong>{key}:</strong> {value}
                                </Text>
                            ))}
                        </>
                    )}

                    <Text as="p" fontWeight="fontWeightBold" marginTop="space30" marginBottom="space20">Raw Model</Text>
                    <Box
                        as="pre"
                        padding="space40"
                        borderRadius="borderRadius10"
                        backgroundColor="colorBackgroundStrong"
                        color="colorTextWeak"
                        overflowX="auto"
                        margin={0}
                    >
                        {formattedDetails}
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default CallRecord
