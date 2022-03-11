import { TwilioServerlessApiClient } from '@twilio-labs/serverless-api';
import fs from 'fs';
import path from 'path';

export const constants = {
    SYNC_CALL_HISTORY: 'sync-call-history',
    INCOMING_CALL_HANDLER: 'incoming-call-handler',
    OUTBOUND_CALL_HANDLER: 'outbound-call-handler',
    INCOMING_MESSAGE_HANDLER: 'incoming-message-handler'
}

interface deployEvent {status: string, message: string}

interface devPhoneServerlessConfig {
    username: string,
    password: string,
    env: {
        SYNC_SERVICE_SID: string,
        CONVERSATION_SID: string,
        CONVERSATION_SERVICE_SID: string,
        DEV_PHONE_NAME: string,
        CALL_LOG_MAP_NAME: string,
        DEV_PHONE_VERSION: string
    },
    onUpdate?: (event: deployEvent) => void
}

export async function deployServerless(context: devPhoneServerlessConfig) {
    const config = {
        username: context.username,
        password: context.password,
        env: context.env,
        pkgJson: {
            "dependencies" : {
                "twilio": "^3.71.3"
            }
        },
        serviceName: context.env.DEV_PHONE_NAME,
        overrideExistingService: true,
        functionsEnv: '',
        functions: [
            {
                name: 'Sync Call History',
                path: `/${constants.SYNC_CALL_HISTORY}`,
                content: fs.readFileSync(path.join(__dirname, `../serverless/functions/${constants.SYNC_CALL_HISTORY}.js`)),
                access: 'protected',
            },
            {
                name: 'Incoming Call Handler',
                path: `/${constants.INCOMING_CALL_HANDLER}`,
                content: fs.readFileSync(path.join(__dirname, `../serverless/functions/${constants.INCOMING_CALL_HANDLER}.js`)),
                access: 'protected',
            },
            {
                name: 'Incoming Message Handler',
                path: `/${constants.INCOMING_MESSAGE_HANDLER}`,
                content: fs.readFileSync(path.join(__dirname,`../serverless/functions/${constants.INCOMING_MESSAGE_HANDLER}.js`)),
                access: 'protected',
            },
            {
                name: 'Outbound Call Handler',
                path: `/${constants.OUTBOUND_CALL_HANDLER}`,
                content: fs.readFileSync(path.join(__dirname,`../serverless/functions/${constants.OUTBOUND_CALL_HANDLER}.js`)),
                access: 'protected',
            },
        ],
        assets: []
    };

    try {
        const client = new TwilioServerlessApiClient(config);
        if (context.onUpdate) {
            const onUpdate = context.onUpdate
            //@ts-ignore
            client.on('status-update', (evt: deployEvent) => {
                onUpdate(evt);
            });
        }
        //@ts-ignore
        const result = await client.deployProject(config);
        return result;
    } catch (err) {
        console.log(err);
        throw new Error('Issue deploying functions. Try again later');
    }
}
