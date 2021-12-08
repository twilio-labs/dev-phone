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
            ({ phoneNumber, friendlyName, smsUrl, voiceUrl }) =>
                ({ phoneNumber, friendlyName, smsUrl, voiceUrl }))
    }
}

class DevPhoneServer extends TwilioClientCommand {
    constructor(argv, config, secureStorage) {
        super(argv, config, secureStorage);
        this.cliSettings = {};
        this.pns = [];
        this.apikey = {};
        this.twimlApp = {};
    }

    async run() {
        await super.run();

        const props = this.parseProperties() || {};
        await this.validatePropsAndFlags(props, this.flags);

        // create conversation for SMS/web interface
        this.cliSettings.conversation = await this.createConversation();

        // create API KEY and API SECRET to be generate JWT AccessToken for ChatGrant and VoiceGrant
        this.apikey = await this.createApiKey();

        // create TwiML App
        this.twimlApp = await this.createTwimlApp();

        // create JWT Access Token
        this.cliSettings.accessToken = await this.createUserAccessToken();

        process.on('SIGINT', async function () {
            console.log("Caught interrupt signal");
            
            try{
                await destroyConversations()
            } catch (e) {}
            try{
                await destroyTwimlApps()
            } catch (e) {}
            try{
                await destroyApiKeys()
            } catch (e) {}
            try{
                await destroySyncs()
            } catch (e) {}
            
            
            process.exit();
        });

        const app = express();
        app.use(express.json()); // request body parser

        app.get("/ping", (req, res) => {
            res.json({ pong: true });

            console.log('TWILIO', this.twilioClient);
        })

        app.get("/plugin-settings", (req, res) => {
            res.json(this.cliSettings);
        })

        app.get("/access-token", (req, res) => {
            res.json({ 
                accessToken: this.cliSettings.accessToken || null
            });
        })

        app.get("/phone-numbers", (req, res) => {
            if(this.pns.length === 0) {
                return this.twilioClient.incomingPhoneNumbers.list()
                    .then(pns => {
                        this.pns = pns;
                        res.json(reformatTwilioPns(pns));
                    }).catch( err => {
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
            ].filter(x=>x);

            if (pnConfigAlreadySet.length > 0) {
                throw new TwilioCliError(
                    `Cannot use ${flags['phone-number']} because the following config for that phone number would be overwritten: ` + pnConfigAlreadySet.join(", ")
                );
            }

            this.cliSettings.phoneNumber = reformatTwilioPns(this.pns)["phone-numbers"][0];
        }
    }

    async createApiKey () {
        return await this.destroyApiKeys().then( async () => {
            return await this.twilioClient.newKeys
                .create({friendlyName: 'dev-phone'});
        }).then ( item => {
            return item;
        });
    }

    async destroyApiKeys () {
        return await this.twilioClient.keys.list()
        .then( async items => {
            return items.filter( item => item.friendlyName === 'dev-phone');
        }).then( async items => {
            for (var item of items) {
                await this.twilioClient.keys(item.sid)
                    .remove();
            }
        });
    }

    async createTwimlApp () {
        // create TwiML App and points to https://dev-phone-6880.twil.io/outbound-call
        return await this.destroyTwimlApps().then( async () => {
            return await this.twilioClient.applications
                .create({
                    voiceUrl: 'https://dev-phone-6880.twil.io/outbound-call',
                    friendlyName: 'dev-phone'
                });
        }).then ( item => {
            return item;
        });        
    }

    async destroyTwimlApps () {
        return await this.twilioClient.applications.list()
        .then( async items => {
            return items.filter( item => item.friendlyName === 'dev-phone');
        }).then( async items => {
            for (var item of items) {
                await this.twilioClient.applications(item.sid)
                    .remove();
            }
        });
    }

    async createUserAccessToken () {
        const chatGrant = new ChatGrant({
            serviceSid: this.cliSettings.conversation.sid
        });

        const voiceGrant = new VoiceGrant({
            incomingAllow: true,
            outgoingApplicationSid: this.twimlApp.sid
        });

        const syncGrant = new SyncGrant({
            serviceSid: process.env.TWILIO_SYNC_SERVICE_SID,
        })
  
        const token = new AccessToken(
            this.twilioClient.accountSid,
            this.apikey.sid,
            this.apikey.secret,
            {
                identity: 'dev-phone'
            }
        );

        token.addGrant(chatGrant);
        token.addGrant(voiceGrant);
        return token.toJwt();
    }

    async createSync () {
        return await this.destroySyncs().then( async () => {
            return await this.twilioClient.sync.services
                .create({friendlyName: 'dev-phone'});
        }).then ( item => {
            return item;
        });
    }

    async destroySyncs () {
        return await this.twilioClient.sync.services.list()
        .then( async items => {
            return items.filter( item => item.friendlyName === 'dev-phone');
        }).then( async items => {
            for (var item of items) {
                await this.twilioClient.sync.services(item.sid)
                    .remove();
            }
        });
    }
    

    async createConversation () {
        return await this.destroyConversations().then( async () => {
            return await this.twilioClient.conversations.conversations
                .create({friendlyName: 'dev-phone'});
        }).then ( item => {
            return item;
        });
    }

    async destroyConversations() {
        return await this.twilioClient.conversations.conversations.list()
        .then( async items => {
            return items.filter( item => item.friendlyName === 'dev-phone');
        }).then( async items => {
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
