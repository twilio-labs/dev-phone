const {
    TwilioServerlessApiClient,
} = require('@twilio-labs/serverless-api');
const fs = require('fs');
const path = require('path');

const constants = {
    SYNC_CALL_HISTORY: 'sync-call-history',
    INCOMING_CALL_HANDLER: 'incoming-call-handler',
    OUTBOUND_CALL_HANDLER: 'outbound-call-handler',
    INCOMING_MESSAGE_HANDLER: 'incoming-message-handler'
}

async function deployServerless(
    username,
    password,
    env,
    onUpdate
) {
    const config = {
        username,
        password,
        env,
        pkgJson: {},
        serviceName: env.DEV_PHONE_NAME,
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
        if (onUpdate) {
            client.on('status-update', (evt) => {
                onUpdate(evt.message);
            });
        }
        const result = await client.deployProject(config);
        return result;
    } catch (err) {
        console.log(err);
        throw new Error('Something went wrong. Try again later');
    }
}

module.exports = {
    deployServerless,
    constants
}
