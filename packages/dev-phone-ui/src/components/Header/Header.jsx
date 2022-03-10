import { Anchor, Box, Column, Grid, Flex, Text, MediaFigure, MediaBody, MediaObject, Tooltip } from "@twilio-paste/core";
import { LogoTwilioIcon } from '@twilio-paste/icons/esm/LogoTwilioIcon';
import { InformationIcon } from "@twilio-paste/icons/esm/InformationIcon";

function Header({ devPhoneName, numberInUse }) {
    return (
        <Box
            width="100%"
            height={"size10"}
            hAlignContent="center"
            backgroundColor={"colorBackgroundBrandStrong"}
            color="colorTextInverse"
            padding={"space60"}
        >
            <Grid gutter={"space50"}>
                <Column span={3}>
                    <MediaObject verticalAlign="center">
                        <MediaFigure spacing="space40">
                            <LogoTwilioIcon display="block" size={42} decorative />
                        </MediaFigure>
                        <MediaBody>
                            <Text as="h2" fontSize="fontSize60" lineHeight="lineHeight60">
                                <Text href="/" as="a" color="colorTextInverse" fontSize="inherit" lineHeight="inherit" textDecoration="none">Dev Phone</Text>
                            </Text>
                            <Text as="h3" fontSize="fontSize20" lineHeight="lineHeight20" color="colorTextWeak">
                                Twilio Labs Project
                            </Text>
                        </MediaBody>
                    </MediaObject>
                </Column>
                <Column offset={5} span={2}>
                    <Flex hAlignContent={"center"} vertical grow height="100%" vAlignContent={"center"} >
                        <Text as="p" color={"colorTextInverse"}>{devPhoneName ? devPhoneName : "loading"}</Text>
                        <Flex width={"100%"} hAlignContent={"center"}>
                            <Text as="p" marginRight={"space20"} color="colorTextInverse" fontWeight={"fontWeightSemibold"} variant="default">Dev Phone ID</Text>
                            <Tooltip text="This is the ID I made to create and use Twilio services for your Dev Phone.">
                                <Anchor href="javascript:void" variant="inverse">
                                    <InformationIcon decorative={false} title="Show details about Dev Phone ID" display="block" />
                                </Anchor>
                            </Tooltip>
                        </Flex>
                    </Flex>
                </Column>
                <Column span={2}>
                    <Flex hAlignContent={"center"} vertical grow height="100%" vAlignContent={"center"} >
                        <Text as="p" color={"colorTextInverse"}> {numberInUse ? numberInUse : "N/A"}</Text>
                        <Flex width={"100%"} hAlignContent={"center"}>
                            <Text as="p" marginRight={"space20"} color="colorTextInverse" fontWeight={"fontWeightSemibold"} variant="default">Twilio Number</Text>
                            <Tooltip text="Text or call this Twilio phone number to connect to your Dev Phone.">
                                <Anchor href="javascript:void" variant="inverse">
                                    <InformationIcon decorative={false} title="Show details about Twilio Phone Number" display="block" />
                                </Anchor>
                            </Tooltip>
                        </Flex>
                    </Flex>
                </Column>
            </Grid>
        </Box>
    )
}

export default Header