const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;

const { isSmsUrlSet, isVoiceUrlSet } = require('../phone-number-utils');

const express = require('express');

const PORT = process.env.PORT || 3001;

const reformatTwilioPns = twilioResponse => {
    return {
        "phone-numbers": twilioResponse.map(
            ({ phoneNumber, friendlyName, smsUrl, voiceUrl, capabilities }) =>
                ({ phoneNumber, friendlyName, smsUrl, voiceUrl, capabilities }))
    }
}

class DevPhoneServer extends TwilioClientCommand {
    constructor(argv, config, secureStorage) {
        super(argv, config, secureStorage);

        this.showHeaders = true;
        this.latestLogEvents = [];
    }

    async run() {
        await super.run();

        const props = this.parseProperties() || {};
        this.validatePropsAndFlags(props, this.flags);

        process.on('SIGINT', function () {
            // TODO: clean developer's console changes
            console.log("Caught interrupt signal");
            process.exit();
        });

        const app = express();
        app.use(express.json()); // request body parser

        // create conversation for SMS/web interface
        this.cliSettings.conversation = await createConversation();

        app.get("/ping", (req, res) => {
            res.json({pong: true});
        })

        app.get("/phone-numbers", (req, res) => {
            this.twilioClient.incomingPhoneNumbers.list()
                .then(pns => res.json(reformatTwilioPns(pns)))
                .catch( err => {
                    console.error('APIs throwed an error', err);
                    res.status(err.data ? err.data.status : 400).send({ error: err });
                });
        })

        app.post("/send-sms", async (req, res) => {
            await this.twilioClient.messages
                .create({
                    body: req.body.body,
                    from: req.body.from,
                    to: req.body.to
                })
                .then(message => res.json({ result: message }))
                .catch( err => {
                    console.error('APIs throwed an error', err);
                    res.status(err.data ? err.data.status : 400).send({ error: err });
                });
        })

        app.listen(PORT, () => {
            console.log(`Hello 👋 Your local webserver is listening on port ${PORT}`);
            console.log(`Use ctrl-c to stop it`);
        });
    }

    validatePropsAndFlags(props, flags) {
        // Flags defined below can be validated and used here. Example:
        // https://github.com/twilio/plugin-debugger/blob/main/src/commands/debugger/logs/list.js#L46-L56
    }

    async createConversation () {
        return await this.twilioClient.conversations.conversations.list()
        .then( async conversations => {
            let devConversations = conversations.filter( c => c.friendlyName === 'dev-phone');
            for (var conversation of devConversations) {
                await this.twilioClient.conversations.conversations(conversation.sid)
                    .remove();
            }
            return await this.twilioClient.conversations.conversations
                .create({friendlyName: 'dev-phone'});
        });
    }

    async destroyConversation(conversation_sid) {
        await this.twilioClient.conversations.conversations(conversation_sid)
            .remove();
    }

}

DevPhoneServer.description = `Dev Phone local express server`

// Example of how to define flags and properties:
// https://github.com/twilio/plugin-debugger/blob/main/src/commands/debugger/logs/list.js#L99-L126
DevPhoneServer.PropertyFlags = {};
DevPhoneServer.flags = {};

module.exports = DevPhoneServer;
