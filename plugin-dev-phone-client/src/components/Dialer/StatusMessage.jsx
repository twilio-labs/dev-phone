import { useEffect, useState } from "react";
import { Box, Flex, MediaBody, MediaFigure, MediaObject, Text } from "@twilio-paste/core";

function CallStatusMessage({voiceDevice, currentCallInfo}) {
    const [message, setMessage] = useState('initializing')
    const [statusColor, setStatusColor] = useState('colorBackgroundBusy')

    useEffect(() => {
        if (voiceDevice && !currentCallInfo) {
            setMessage('ready for calls')
            setStatusColor('colorBackgroundSuccess')
        }

        if (voiceDevice && currentCallInfo) {
            setStatusColor('colorBackgroundBusy')
            if (currentCallInfo._direction === 'OUTGOING') {
                setMessage(`calling ${currentCallInfo._options.twimlParams.to}`)
            } else {
                setMessage(`call from ${currentCallInfo.parameters.From}`)
            }
            if (currentCallInfo && currentCallInfo._wasConnected) {
                setMessage('call connected')
                setStatusColor('colorBackgroundSuccess')
            }
        }
    }, [voiceDevice, currentCallInfo])

    return (
        <Flex hAlignContent={"center"}>
            <MediaObject verticalAlign="center">
                <MediaFigure spacing={"space20"}><Box borderRadius={"borderRadiusCircle"} padding={"space20"} backgroundColor={statusColor}/></MediaFigure>
                <MediaBody><Text as={"p"} fontStyle={"italic"}>{message}</Text></MediaBody>
            </MediaObject>
        </Flex>
    )
}

export default CallStatusMessage