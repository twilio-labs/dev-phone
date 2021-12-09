const { flags } = require('@oclif/command');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;

const AccessToken = require('twilio').jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const VoiceGrant = AccessToken.VoiceGrant;
const SyncGrant = AccessToken.SyncGrant;

const { isSmsUrlSet, isVoiceUrlSet } = require('../phone-number-utils');

const express = require('express');

const PORT = process.env.PORT || 3001;

const reformatTwilioPns = twilioResponse => {
    return {
        "phone-numbers": twilioResponse.map(
            ({ phoneNumber, friendlyName, smsUrl, voiceUrl, sid }) =>
                ({ phoneNumber, friendlyName, smsUrl, voiceUrl, sid }))
    }
}

const generateRandomPhoneName = () => {
    let rand = Math.random().toString().substr(2, 6)
    return `dev-phone-${rand}`;
}

class DevPhoneServer extends TwilioClientCommand {
    constructor(argv, config, secureStorage) {
        super(argv, config, secureStorage);
        this.cliSettings = {};
        this.pns = [];
        this.jwt = null;
        this.apikey = {};
        this.twimlApp = {};
        this.devPhoneName = generateRandomPhoneName();
        this.voiceUrl = null;
        this.smsUrl = null;
    }

    async run() {
        await super.run();

        const props = this.parseProperties() || {};
        await this.validatePropsAndFlags(props, this.flags);

        console.log(`Hello 👋 I'm your dev-phone and my name is ${this.devPhoneName}\n`);

        // create conversation for SMS/web interface
        this.cliSettings.conversation = await this.createConversation();

        // create Sync for Call History interface
        this.cliSettings.sync = await this.createSync();

        // create API KEY and API SECRET to be generate JWT AccessToken for ChatGrant, VoiceGrant and SyncGrant
        this.apikey = await this.reuseOrCreateApiKey();

        // create TwiML App
        this.twimlApp = await this.createTwimlApp();

        // create JWT Access Token with ChatGrant, VoiceGrant and SyncGrant
        this.jwt = await this.createJwt();

        // create Function to handle inbound-voice, inbound-sms and outbound-voice (voip)
        await this.createFunction(); 

        const onShutdown = async () => {
            await this.destroyConversations()
            await this.destroyTwimlApps()
            await this.destroyApiKeys()
            await this.destroySyncs()
        }

        process.on('SIGINT', async function () {
            console.log("\n👋 Shutting down");
            await onShutdown();

            process.exit();
        });

        const app = express();
        app.use(express.json()); // request body parser

        app.get("/ping", (req, res) => {
            res.json({ pong: true });

            console.log('TWILIO', this.twilioClient);
        })

        app.get("/plugin-settings", (req, res) => {
            res.json({
                ...this.cliSettings,
                devPhoneName: this.devPhoneName
            });
        })

        app.get("/phone-numbers", (req, res) => {
            if (this.pns.length === 0) {
                return this.twilioClient.incomingPhoneNumbers.list()
                    .then(pns => {
                        this.pns = pns;
                        res.json(reformatTwilioPns(pns));
                    }).catch(err => {
                        console.error('APIs throwed an error', err);
                        res.status(err.data ? err.data.status : 400).send({ error: err });
                    });
            } else {
                return res.json(reformatTwilioPns(this.pns));
            }
        })

        app.post("/send-sms", (req, res) => {
            this.twilioClient.messages
                .create({
                    body: req.body.body,
                    from: req.body.from,
                    to: req.body.to
                })
                .then(message => res.json({ result: message }))
                .catch(err => {
                    console.error('APIs throwed an error', err);
                    res.status(err.data ? err.data.status : 400).send({ error: err });
                });
        })

        app.all("/choose-phone-number", async (req, res) => {
            let phoneNumbers = await this.twilioClient.incomingPhoneNumbers
            .list({phoneNumber: req.body.phoneNumber, limit: 20})
            .then(incomingPhoneNumbers => {
                return reformatTwilioPns(incomingPhoneNumbers)["phone-numbers"];
            });

            if (phoneNumbers.length > 0) {
                this.cliSettings.phoneNumber = phoneNumbers[0];
                await this.updatePhoneWebhooks();
                res.json({ message: 'Phone number updated!' });
            } else {
                console.error('Phone number not found!');
                res.json({ error: 'Phone number not found!' });
            }
        })

        app.get("/client-token", async (req, res) => {

            if (!this.jwt) {
                this.jwt = await this.createJwt();
            }

            res.json({ token: this.jwt });
        })

        app.listen(PORT, () => {
            console.log(`🚀 Your local webserver is listening on port ${PORT}`);
            console.log('▶️  Use ctrl-c to stop your dev-phone');
        });
    }

    async createFunction() {

        // If the phoneNumber is already choosen from the command line, we need to update the URLs here
    
        // TODO: CHANGE TO NEW FUNCTION TO HANDLE VOICE WEBHOOKS WITHOUT PASSING VARIABLES
        // const voiceUrl = '[PUT NEW FUNCTION URL HERE!]/inbound-call'

        // TODO: CHANGE TO NEW FUNCTION TO HANDLE MESSAGING WEBHOOKS WITHOUT PASSING VARIABLES
        // const smsUrl = `[PUT NEW FUNCTION URL HERE!]/inbound-sms`

        this.voiceUrl = 'https://demo.twilio.com/welcome/voice/'
        this.smsUrl = `https://demo.twilio.com/welcome/sms/reply`

    }

    async updatePhoneWebhooks() {
        // TODO: update phone number webhooks for voice and messaging
        // TODO: WARNING: change this code to use a new deployed function from the own user's account!
        
        this.cliSettings.phoneNumber.voiceUrl = this.voiceUrl;
        this.cliSettings.phoneNumber.smsUrl = this.smsUrl;

        return await this.twilioClient.incomingPhoneNumbers(this.cliSettings.phoneNumber.sid)
        .update({
            voiceUrl: this.voiceUrl,
            smsUrl: this.smsUrl
        });
    }

    async validatePropsAndFlags(props, flags) {
        // Flags defined below can be validated and used here. Example:
        // https://github.com/twilio/plugin-debugger/blob/main/src/commands/debugger/logs/list.js#L46-L56

        if (flags['phone-number']) {
            this.pns = await this.twilioClient.incomingPhoneNumbers
                .list({ phoneNumber: flags['phone-number'] });

            if (this.pns.length < 1) {
                throw new TwilioCliError(
                    `The phone number ${flags['phone-number']} is not associated with your Twilio account`
                );
            }

            const pnConfigAlreadySet = [
                (isSmsUrlSet(this.pns[0].smsUrl) ? "SMS webhook URL" : null),
                (isVoiceUrlSet(this.pns[0].voiceUrl) ? "Voice webhook URL" : null),
            ].filter(x => x);

            if (pnConfigAlreadySet.length > 0) {
                throw new TwilioCliError(
                    `Cannot use ${flags['phone-number']} because the following config for that phone number would be overwritten: ` + pnConfigAlreadySet.join(", ")
                );
            }

            this.cliSettings.phoneNumber = reformatTwilioPns(this.pns)["phone-numbers"][0];

        }
    }

    twilioCliIsConfiguredWithApiKey() {
        return this.currentProfile.apiKey.startsWith("SK");
    }

    async reuseOrCreateApiKey() {

        // We need an API KEY and SECRET to create the Access Token
        // Depending on how the user has provided the CLI with creds
        // we may have one already in this.currentProfile, or we may
        // need to create a new one

        if (this.twilioCliIsConfiguredWithApiKey()) {
            // This case is if the user has _not_ used env vars for
            // their creds. Here we can reuse the api key and secret
            // that the CLI created when it was installed

            console.log("✅ I'm using your profile API key.\n");
            return {
                sid: this.currentProfile.apiKey,
                secret: this.currentProfile.apiSecret
            }

        } else {
            // This case is if the user has started the CLI with
            // $TWILIO_ACCOUNT_SID and $TWILIO_AUTH_TOKEN set in
            // their environment, using their account creds but
            // their API_KEY and SECRET are not properly set.
            // the CLI uses the ACCOUNT_SID into currentProfile.apiKey
            // and we need to generate another key

            console.log("💻 I'm creating a new API key...");
            let key = await this.destroyApiKeys().then(async () => {
                return await this.twilioClient.newKeys
                    .create({ friendlyName: this.devPhoneName });
            }).then(item => {
                console.log(`✅ I'm using the API Key ${item.sid}\n`);
                return item;
            });

            this.currentProfile.apiKey = key.sid;
            this.currentProfile.apiSecret = key.secret;
            return {
                sid: this.currentProfile.apiKey,
                secret: this.currentProfile.apiSecret
            }
        }
    }

    async destroyApiKeys() {

        if (this.twilioCliIsConfiguredWithApiKey()) {
            // we never created one
            return;

        } else {

            return await this.twilioClient.keys.list()
                .then(async items => {
                    return items.filter(item => item.friendlyName !== null && item.friendlyName.startsWith('dev-phone'));
                }).then(async items => {
                    if (items.length > 0) {
                        console.log('🚮 Removing existing API Keys');
                    }
                    for (var item of items) {
                        await this.twilioClient.keys(item.sid)
                            .remove();
                    }
                });
        }
    }

    async createTwimlApp() {
        console.log('💻 Creating a new TwiMl App to allow Voip calls from your browser...');
        // create TwiML App and points to https://dev-phone-6880.twil.io/outbound-call
        return await this.destroyTwimlApps().then(async () => {
            return await this.twilioClient.applications
                .create({
                    voiceUrl: 'https://dev-phone-6880.twil.io/outbound-call',
                    friendlyName: this.devPhoneName
                });
        }).then(item => {
            console.log(`✅ I'm using the TwiMl App ${item.sid}\n`);
            return item;
        });
    }

    async destroyTwimlApps() {
        return await this.twilioClient.applications.list()
            .then(async items => {
                return items.filter(item => item.friendlyName !== null && item.friendlyName.startsWith('dev-phone'));
            }).then(async items => {
                if (items.length > 0) {
                    console.log('🚮 Removing existing TwiML apps');
                }
                for (var item of items) {
                    await this.twilioClient.applications(item.sid)
                        .remove();
                }
            });
    }


    async createJwt() {

        const chatGrant = new ChatGrant({
            serviceSid: this.cliSettings.conversation.sid
        });

        const voiceGrant = new VoiceGrant({
            incomingAllow: true,
            outgoingApplicationSid: this.twimlApp.sid
        });

        const syncGrant = new SyncGrant({
            serviceSid: this.cliSettings.sync.sid,
        })

        const token = new AccessToken(
            this.twilioClient.accountSid,
            this.apikey.sid,
            this.apikey.secret,
            {
                identity: this.devPhoneName
            }
        );

        token.addGrant(chatGrant);
        token.addGrant(voiceGrant);
        token.addGrant(syncGrant);
        return token.toJwt();
    }

    async createSync() {
        console.log('💻 Creating a new sync list for call history...');
        return await this.destroySyncs().then(async () => {
            return await this.twilioClient.sync.services
                .create({ friendlyName: this.devPhoneName });
        }).then(item => {
            console.log(`✅ I'm using the sync list ${item.sid}\n`);
            return item;
        }).then(async item => {
            // create 'CallLog' syncMap
            await this.twilioClient.sync.services(item.sid).syncMaps.create({
                uniqueName: "CallLog",
            });
            return item;
        });
    }

    async destroySyncs() {
        return await this.twilioClient.sync.services.list()
            .then(async items => {
                return items.filter(item => item.friendlyName !== null && item.friendlyName.startsWith('dev-phone'));
            }).then(async items => {
                if (items.length > 0) {
                    console.log('🚮 Removing existing Sync Services');
                }
                for (var item of items) {
                    await this.twilioClient.sync.services(item.sid)
                        .remove();
                }
            });
    }


    async createConversation() {
        return await this.destroyConversations().then(async () => {
            console.log('💻 Creating a new conversation...');
            return await this.twilioClient.conversations.conversations
                .create({ friendlyName: this.devPhoneName });
        }).then(item => {
            console.log(`✅ I'm using the conversation ${item.sid}\n`);
            return item;
        });
    }

    async destroyConversations() {
        return await this.twilioClient.conversations.conversations.list()
            .then(async items => {
                return items.filter(item => item.friendlyName !== null && item.friendlyName.startsWith('dev-phone'));
            }).then(async items => {
                if (items.length > 0) {
                    console.log('🚮 Removing existing conversations');
                }
                for (var item of items) {
                    await this.twilioClient.conversations.conversations(item.sid)
                        .remove();
                }
            });
    }

}

DevPhoneServer.description = `Dev Phone local express server`

// Example of how to define flags and properties:
// https://github.com/twilio/plugin-debugger/blob/main/src/commands/debugger/logs/list.js#L99-L126
DevPhoneServer.PropertyFlags = {
    "phone-number": flags.string({
        description: 'Phone number from your account to associate this dev-phone with'
    })
};

DevPhoneServer.flags = Object.assign(
    DevPhoneServer.PropertyFlags,
    TwilioClientCommand.flags
);

module.exports = DevPhoneServer;
