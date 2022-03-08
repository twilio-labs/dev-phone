import { Label, Flex, Box } from "@twilio-paste/core"
import { useDispatch, useSelector } from "react-redux"
import { setDestinationNumber } from "../../actions"

const inputStyles = {
   backgroundColor: "#fff",
   width: "50%",
   textAlign: "center",
   fontSize: "3rem",
   outline: "none",
   borderStyle: "hidden",
   borderBottom: "2px groove rgba(0, 0, 0, .7)",
   marginBottom: ".25rem"
}

export default function PhoneNumberInput() {
    const dispatch = useDispatch()
    const destinationNumber = useSelector(state => state.destinationNumber)

    return (
        <Box backgroundColor={"colorBackgroundBody"}>
            <Flex height={"size20"} vertical hAlignContent={"center"} vAlignContent={"bottom"} padding={"space70"}>
                <input
                    type="text"
                    id="sendSmsToPn"
                    placeholder="+15551234545"
                    defaultValue={destinationNumber}
                    style={inputStyles}
                    onChange={(e) => dispatch(setDestinationNumber(e.target.value))}/>
                <Label htmlFor="destinationNumber" required>Destination Number</Label>
            </Flex>
        </Box>
    )
}