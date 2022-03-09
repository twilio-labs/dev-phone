import { Box, Button, Column, Grid } from "@twilio-paste/core";
import { ChevronLeftIcon } from '@twilio-paste/icons/esm/ChevronLeftIcon';
import { ChevronRightIcon } from '@twilio-paste/icons/esm/ChevronRightIcon';
import { useState, useMemo } from 'react';
import { useSelector } from "react-redux";

import CallHistory from "../CallHistory/CallHistory.jsx"
import Dialer from "../Dialer/Dialer";
import PhoneNumberInput from "../PhoneNumberInput/PhoneNumberInput"
import SendSmsForm from "../SendSmsForm/SendSmsForm";
import TwilioVoiceManager from "../VoiceManager/VoiceManager";
import MissingDestinationNumber from "./MissingDestinationNumber.jsx";

function Softphone({ numberInUse }) {
    const [showCallHistory, setCallHistory] = useState(true);
    const destinationNumber = useSelector(state => state.destinationNumber)

    const isValidDestinationNumber = useMemo(() => {
        return destinationNumber && destinationNumber.length > 6;
    }, [destinationNumber]);

    function toggleCallHistory() {
        setCallHistory((current) => {
            return !current;
        });
    }

    return (
        <Box
            maxWidth={"75%"}
            margin={"auto"}
            marginY={"space120"}
            backgroundColor={"colorBackgroundBody"}
            boxShadow={"shadow"}
            borderRadius={"borderRadius20"}
        >
            <Grid gutter={"space0"}>
                <Column span={showCallHistory ? 4 : 0}>
                    {showCallHistory && <CallHistory />}
                </Column>
                <Column span={showCallHistory ? 8 : 12}>
                    <Box padding="space40">
                        <Button onClick={toggleCallHistory} variant="link">
                            {showCallHistory ? <ChevronLeftIcon decorative /> : <ChevronRightIcon decorative />}
                            {showCallHistory ? 'Hide' : 'Show'} Call History
                        </Button>
                        <PhoneNumberInput />
                        <Grid gutter={"space40"}>
                            <Column span={4}>
                                <TwilioVoiceManager>
                                    <Dialer />
                                </TwilioVoiceManager>
                            </Column>
                            <Column span={8}>
                                <SendSmsForm numberInUse={numberInUse} />
                            </Column>
                        </Grid>
                    </Box>
                    {!isValidDestinationNumber && <MissingDestinationNumber />}
                </Column>
            </Grid>
        </Box>
    )
}

export default Softphone