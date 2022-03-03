import { Box, Column, Grid, Flex, Text } from "@twilio-paste/core";

function Header({ devPhoneName, numberInUse }) {
    return (
        <Box
          width="100%"
          height={"size10"}
          hAlignContent="baseline"
          backgroundColor={"colorBackgroundBrandStrong"}
          color="colorTextInverse"
          padding={"space70"}
        >
            <Grid gutter={"space50"}>
                <Column span={3}>
                    <Text color="colorTextInverse" fontSize={"fontSize90"} fontFamily={"fontFamilyCode"} as="h1">COMLINK</Text>
                </Column>
                <Column offset={5} span={2}>
                    <Flex hAlignContent={"center"} vertical>
                        <Text color="colorTextInverse">{devPhoneName ? devPhoneName : "loading"}</Text>
                        <Text as="p" color="colorTextInverse" fontWeight={"fontWeightSemibold"} variant="default">PHONE ID</Text>
                    </Flex>
                </Column>
                <Column span={2}>
                    <Flex hAlignContent={"center"} vertical>
                        <Text color="colorTextInverse">{numberInUse ? numberInUse : "N/A"}</Text>
                        <Text as="p" color="colorTextInverse" fontWeight={"fontWeightSemibold"} variant="default">TWILIO NUMBER</Text>
                    </Flex>
                </Column>
            </Grid>
        </Box>
    )
}

export default Header