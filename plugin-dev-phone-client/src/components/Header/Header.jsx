import { Box, Column, Grid, Flex, Text, MediaFigure, MediaBody, MediaObject } from "@twilio-paste/core";
import { LogoTwilioIcon } from '@twilio-paste/icons/esm/LogoTwilioIcon';

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
                    {/* <Text color="colorTextInverse" fontSize={"fontSize90"} fontFamily={"fontFamilyCode"} as="h1">COMLINK</Text> */}
                </Column>
                <Column offset={5} span={2}>
                    <Flex hAlignContent={"center"} vertical grow height="100%" vAlignContent={"center"} >
                        <Text color="colorTextInverse">{devPhoneName ? devPhoneName : "loading"}</Text>
                        <Text as="p" color="colorTextInverse" fontWeight={"fontWeightSemibold"} variant="default">PHONE ID</Text>
                    </Flex>
                </Column>
                <Column span={2}>
                    <Flex hAlignContent={"center"} vertical grow height="100%" vAlignContent={"center"} >
                        <Text color="colorTextInverse">{numberInUse ? numberInUse : "N/A"}</Text>
                        <Text as="p" color="colorTextInverse" fontWeight={"fontWeightSemibold"} variant="default">TWILIO NUMBER</Text>
                    </Flex>
                </Column>
            </Grid>
        </Box>
    )
}

export default Header