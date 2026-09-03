import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Anchor, Box, Button, Flex, Text } from '@twilio-paste/core';
import { clearDebugEvents } from '../../actions';

function formatData(data) {
    if (!data) return '';
    try {
        const raw = typeof data === 'string' ? data : JSON.stringify(data);
        return raw.length > 320 ? `${raw.slice(0, 320)}...` : raw;
    } catch {
        return String(data);
    }
}

function formatTimestamp(isoTimestamp) {
    try {
        return new Date(isoTimestamp).toLocaleTimeString();
    } catch {
        return isoTimestamp || '';
    }
}

function DebugConsole() {
    const [isOpen, setIsOpen] = useState(false);
    const events = useSelector((state) => state.debugEvents || []);
    const dispatch = useDispatch();
    const listContainerRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !listContainerRef.current) return;
        listContainerRef.current.scrollTop = listContainerRef.current.scrollHeight;
    }, [events, isOpen]);

    const eventsLabel = useMemo(() => `${events.length} event${events.length === 1 ? '' : 's'}`, [events.length]);

    return (
        <Box
            position="fixed"
            bottom="0"
            left="0"
            right="0"
            backgroundColor="colorBackgroundBodyInverse"
            color="colorTextInverse"
            boxShadow="shadowCard"
            style={{ zIndex: 9998, borderTop: '1px solid rgba(255,255,255,0.18)' }}
        >
            <Flex hAlignContent="between" vAlignContent="center" paddingX="space60" paddingY="space30">
                <Flex vAlignContent="center" columnGap="space40">
                    <Text as="p" fontWeight="fontWeightSemibold" color="colorTextInverse">
                        Debug Console
                    </Text>
                    <Text as="p" fontSize="fontSize20" color="colorTextWeak">
                        {eventsLabel}
                    </Text>
                </Flex>
                <Flex vAlignContent="center" columnGap="space40">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => dispatch(clearDebugEvents())}
                        disabled={events.length === 0}
                    >
                        Clear
                    </Button>
                    <Anchor
                        href="javascript:void"
                        variant="inverse"
                        onClick={(event) => {
                            event.preventDefault();
                            setIsOpen((prev) => !prev);
                        }}
                    >
                        {isOpen ? 'Hide' : 'Show'}
                    </Anchor>
                </Flex>
            </Flex>

            {isOpen && (
                <Box
                    ref={listContainerRef}
                    paddingX="space60"
                    paddingBottom="space60"
                    style={{
                        maxHeight: '240px',
                        overflowY: 'auto',
                        borderTop: '1px solid rgba(255,255,255,0.18)',
                        fontFamily: 'Menlo, Monaco, Consolas, monospace',
                        fontSize: '12px',
                    }}
                >
                    {events.length === 0 ? (
                        <Text as="p" color="colorTextWeak" marginTop="space40">
                            No debug events yet.
                        </Text>
                    ) : (
                        events.map((evt, index) => (
                            <Box
                                key={`${evt.timestamp || 'evt'}-${index}`}
                                paddingY="space20"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
                            >
                                <Text as="p" color="colorTextWeak">
                                    [{formatTimestamp(evt.timestamp)}] {evt.level?.toUpperCase() || 'INFO'} - {evt.message}
                                </Text>
                                {formatData(evt.data) && (
                                    <Text as="p" color="colorTextInverse" style={{ wordBreak: 'break-word' }}>
                                        {formatData(evt.data)}
                                    </Text>
                                )}
                            </Box>
                        ))
                    )}
                </Box>
            )}
        </Box>
    );
}

export default DebugConsole;
