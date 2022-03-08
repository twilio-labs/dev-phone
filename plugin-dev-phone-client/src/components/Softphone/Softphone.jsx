import { Box, Column, Grid } from "@twilio-paste/core";
import CallHistory from "../CallHistory/CallHistory.jsx"
import Dialer from "../Dialer/Dialer";
import PhoneNumberInput from "../PhoneNumberInput/PhoneNumberInput"
import SendSmsForm from "../SendSmsForm/SendSmsForm";
import TwilioVoiceManager from "../VoiceManager/VoiceManager";

function Softphone ({ numberInUse }) {
    return (
        <Box
            maxWidth={"75%"}
            margin={"auto"}
            marginY={"space120"}
            backgroundColor={"colorBackgroundBody"}
            boxShadow={"shadow"}
            borderRadius={"borderRadius20"}
        >
            <Grid gutter={"space40"}>
                <Column span={4}>
                    <CallHistory />
                </Column>
                <Column span={8}>
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
                </Column>
            </Grid>
        </Box>
    )
}

export default Softphone