import path = require('path');
import fs = require('fs');
import open = require('open');

import { flags } from '@oclif/command';
import { deployServerless, constants } from '../utils/create-serverless-util';
import { isSmsUrlSet, isVoiceUrlSet } from '../phone-number-utils';
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;

// Types
import { ServiceInstance as ServerlessServiceInstance } from 'twilio/lib/rest/serverless/v1/service'
import { ServiceInstance as SyncServiceInstance } from 'twilio/lib/rest/sync/v1/service'
import { ServiceInstance as ConversationServiceInstance } from 'twilio/lib/rest/conversations/v1/service'
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message'
import { KeyInstance } from 'twilio/lib/rest/api/v2010/account/key'
import { ApplicationInstance } from 'twilio/lib/rest/api/v2010/account/application'
import { IncomingPhoneNumberInstance } from 'twilio/lib/rest/api/v2010/account/incomingPhoneNumber'
import RestException = require('twilio/lib/base/RestException')

const AccessToken = require('twilio').jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const VoiceGrant = AccessToken.VoiceGrant;
const SyncGrant = AccessToken.SyncGrant;

import express = require('express');

const PORT = process.env.PORT || 3001;
const CALL_LOG_MAP_NAME = 'CallLog'

const reformatTwilioPns = (twilioResponse: IncomingPhoneNumberInstance[]) => {
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
    constructor(argv: any, config: any, secureStorage: any) {
        super(argv, config, secureStorage);
        this.cliSettings = {};
        this.pns = [];
        this.jwt = null;
        this.apikey = {};
        this.twimlApp = {};
        this.devPhoneName = generateRandomPhoneName();
        this.voiceUrl = null;
        this.smsUrl = null;
        this.voiceOutboundUrl = null;
    }

    async run() {
        await super.run();

        const props = this.parseProperties() || {};
        await this.validatePropsAndFlags(props, this.flags);

        console.log(`Hello 👋 I'm your dev-phone and my name is ${this.devPhoneName}\n`);

        // create API KEY and API SECRET to be generate JWT AccessToken for ChatGrant, VoiceGrant and SyncGrant
        this.apikey = await this.reuseOrCreateApiKey();

        // create conversation for SMS/web interface
        this.conversation = await this.createConversation();

        // create Sync for Call History interface
        this.sync = await this.createSync();

        // create Function to handle inbound-voice, inbound-sms and outbound-voice (voip)
        this.serverless = await this.createFunction();

        // create TwiML App
        this.twimlApp = await this.createTwimlApp();

        // create JWT Access Token with ChatGrant, VoiceGrant and SyncGrant
        this.jwt = await this.createJwt();

        // add webhook config to the phone number, if there is one passed by CLI flag
        await this.updatePhoneWebhooks();

        const onShutdown = async () => {
            await this.destroyConversations();
            await this.destroyTwimlApps();
            await this.destroyApiKeys();
            await this.destroySyncs();
            await this.destroyFunction();
            await this.removePhoneWebhooks();
        }

        process.on('SIGINT', async function () {
            console.log("\n👋 Shutting down");
            await onShutdown();

            process.exit();
        });

        const app = express();

        // serve assets from the "public" directory
        // __dirname is the path to _this_ file, so ../../public to find index.html
        app.use(express.static(path.join(__dirname, '..', '..', 'public')));

        app.use(express.json()); // response body writer

        app.get("/ping", (req, res) => {
            res.json({ pong: true });

            console.log('TWILIO', this.twilioClient);
        })

        app.get("/plugin-settings", (req, res) => {
            res.json({
                ...this.cliSettings,
                devPhoneName: this.devPhoneName,
                conversation: this.conversation
            });
        })

        app.get("/phone-numbers", (req: express.Request, res: express.Response) => {
            if (this.pns.length === 0) {
                return this.twilioClient.incomingPhoneNumbers.list()
                    .then((pns: IncomingPhoneNumberInstance[]) => {
                        this.pns = pns;
                        res.json(reformatTwilioPns(pns));
                    }).catch((err: RestException) => {
                        console.error('Phone number API threw an error', err);
                        res.status(err.status ? err.status : 400).send({ error: err });
                    });
            } else {
                return res.json(reformatTwilioPns(this.pns));
            }
        })

        app.post("/send-sms", (req:express.Request, res:express.Response) => {
            const {body, from, to} = req.body
            this.twilioClient.messages
                .create({
                    body,
                    from,
                    to
                })
                .then((message: MessageInstance) => res.json({ result: message }))
                .catch((err: RestException) => {
                    console.error('SMS API threw an error', err);
                    res.status(err.status ? err.status : 400).send({ error: err });
                });
        })

        app.all("/choose-phone-number", async (req:express.Request, res:express.Response) => {
            const rawNumbers = await this.twilioClient.incomingPhoneNumbers
                .list({ phoneNumber: req.body.phoneNumber, limit: 20 })
            const selectedNumber = reformatTwilioPns(rawNumbers)["phone-numbers"];

            // Should only have a single number
            if (selectedNumber.length === 1) {
                await this.removePhoneWebhooks();
                this.cliSettings.phoneNumber = selectedNumber[0];
                await this.updatePhoneWebhooks();
                res.json({
                    phoneNumber: this.cliSettings.phoneNumber,
                    message: 'Phone number updated!'
                });
            } else {
                console.error('Phone number not found!');
                res.status(400).send({
                    message: 'Phone number not found!'
                });
            }
        })

        app.get("/client-token", async (req:express.Request, res:express.Response) => {

            if (!this.jwt) {
                this.jwt = await this.createJwt();
            }

            res.json({ token: this.jwt });
        })

        const isHeadless = () => !!this.flags.headless;

        app.listen(PORT, () => {
            console.log(`🚀 Your local webserver is listening on port ${PORT}`);

            if (fs.existsSync(path.join(__dirname, '..', '..', 'public', 'index.html'))) {

                const uiUrl = `http://localhost:${PORT}/`

                if (isHeadless()) {
                    console.log(`🌐 UI is available at ${uiUrl}`)
                } else {
                    console.log(`🌐 Opening ${uiUrl} your browser`);
                    open(uiUrl);
                }

            } else {
                console.log('Hello friend! Front end files are missing, ie you are developing this pluign.');
                console.log('Run: `cd plugin-dev-phone-client` then `npm start` to run dev front-end')
                console.log('To build the front-end so that the local backend will serve it: ./build-for-release.sh')
            }

            console.log('▶️  Use ctrl-c to stop your dev-phone\n');
        });
    }

    async createFunction() {
        console.log('💻 Deploying a Functions Service to handle incoming calls and SMS...');
        const deployedFunctions = await deployServerless({
            username: this.twilioClient.username,
            password: this.twilioClient.password,
            env: {
                SYNC_SERVICE_SID: this.sync.sid,
                CONVERSATION_SID: this.conversation.sid,
                CONVERSATION_SERVICE_SID: this.conversation.serviceSid,
                DEV_PHONE_NAME: this.devPhoneName,
                CALL_LOG_MAP_NAME
            }
        });

        console.log(`✅ I'm using the Serverless Service ${deployedFunctions.serviceSid}\n`);

        this.voiceUrl = `https://${deployedFunctions.domain}/${constants.INCOMING_CALL_HANDLER}`
        this.voiceOutboundUrl = `https://${deployedFunctions.domain}/${constants.OUTBOUND_CALL_HANDLER}`
        this.smsUrl = `https://${deployedFunctions.domain}/${constants.INCOMING_MESSAGE_HANDLER}`
        this.statusCallback = `https://${deployedFunctions.domain}/${constants.SYNC_CALL_HISTORY}`

        return deployedFunctions;
    }

    async destroyFunction() {
        return await this.twilioClient.serverless.services.list()
            .then(async (services: ServerlessServiceInstance[]) => {
                return services.filter(service => service.friendlyName !== null && service.friendlyName === this.devPhoneName);
            }).then(async (services: ServerlessServiceInstance[]) => {
                if (services.length > 0) {
                    console.log('🚮 Removing serverless functions');
                }
                services.forEach(async (service: ServerlessServiceInstance) => {
                    await this.twilioClient.serverless.services(service.sid)
                        .remove();
                })
            }).catch((err: RestException) => console.log(err));
    }

    async updatePhoneWebhooks() {
        if (!this.cliSettings.phoneNumber) return;

        console.log(`💻 Updating Voice and SMS webhooks for ${this.cliSettings.phoneNumber.phoneNumber}...`);

        this.cliSettings.phoneNumber.voiceUrl = this.voiceUrl;
        this.cliSettings.phoneNumber.smsUrl = this.smsUrl;
        this.cliSettings.phoneNumber.statusCallback = this.statusCallback;

        const updated = await this.twilioClient.incomingPhoneNumbers(this.cliSettings.phoneNumber.sid)
            .update({
                voiceUrl: this.voiceUrl,
                smsUrl: this.smsUrl,
                statusCallback: this.statusCallback,
            }).catch((err: unknown) => console.log(err));
        console.log('✅ Webhooks updated\n');
        return updated;
    }

    async removePhoneWebhooks() {
        if (!this.cliSettings.phoneNumber) return;

        console.log(`🚮 Removing incoming Voice and SMS webhooks for ${this.cliSettings.phoneNumber.phoneNumber}`);
        const updated = await this.twilioClient.incomingPhoneNumbers(this.cliSettings.phoneNumber.sid)
            .update({
                voiceUrl: "",
                smsUrl: "",
                statusCallback: "",
            }).catch((err: RestException) => console.log(err));
        return updated;
    }

    async validatePropsAndFlags(props: any, flags: any) {
        // Flags defined below can be validated and used here. Example:
        // https://github.com/twilio/plugin-debugger/blob/main/src/commands/debugger/logs/list.js#L46-L56

        this.cliSettings.forceMode = flags['force'];
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

            if (pnConfigAlreadySet.length > 0 && !this.cliSettings.forceMode) {
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
                .then(async (keys: KeyInstance[]) => {
                    return keys.filter(key => key.friendlyName !== null && key.friendlyName.startsWith('dev-phone'));
                }).then((keys: KeyInstance[]) => {
                    if (keys.length === 0) {
                        console.log('🚮 No existing API Keys for the dev phone found');
                    }
                    console.log('🚮 Removing existing dev phone API Keys');
                    keys.forEach(async (key: KeyInstance) => {
                        await this.twilioClient.keys(key.sid).remove();
                    })
                });
        }
    }

    async createTwimlApp() {
        console.log('💻 Creating a new TwiMl App to allow Voip calls from your browser...');
        return await this.destroyTwimlApps().then(async () => {
            return await this.twilioClient.applications
                .create({
                    voiceUrl: this.voiceOutboundUrl,
                    friendlyName: this.devPhoneName
                });
        }).then(item => {
            console.log(`✅ I'm using the TwiMl App ${item.sid}\n`);
            return item;
        });
    }

    async destroyTwimlApps() {
        return await this.twilioClient.applications.list()
            .then(async (twilioApps: ApplicationInstance[]) => {
                return twilioApps.filter(twilioApp => twilioApp.friendlyName !== null && twilioApp.friendlyName.startsWith('dev-phone'));
            }).then((twilioApps: ApplicationInstance[]) => {
                if (twilioApps.length === 0) {
                    console.log('🤷‍♂️ existing dev phone TwiML apps found');
                }
                console.log('🚮 Removing existing TwiML apps');
                twilioApps.forEach(async (twimlApp: ApplicationInstance) => {
                    await this.twilioClient.applications(twimlApp.sid)
                        .remove();
                })
            });
    }

    async createJwt() {

        const chatGrant = new ChatGrant({
            serviceSid: this.conversation.serviceSid
        });

        const voiceGrant = new VoiceGrant({
            incomingAllow: true,
            outgoingApplicationSid: this.twimlApp.sid
        });

        const syncGrant = new SyncGrant({
            serviceSid: this.sync.sid,
        })

        const token = new AccessToken(
            this.twilioClient.accountSid,
            this.apikey.sid,
            this.apikey.secret,
            {
                identity: this.devPhoneName,
                ttl: 24*60*60
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
                uniqueName: CALL_LOG_MAP_NAME,
            });
            return item;
        });
    }

    async destroySyncs() {
        return await this.twilioClient.sync.services.list()
            .then(async (syncServices: SyncServiceInstance[]) => {
                return syncServices.filter(syncService => syncService.friendlyName !== null && syncService.friendlyName.startsWith('dev-phone'));
            }).then((syncServices: SyncServiceInstance[]) => {
                if (syncServices.length === 0) {
                    console.log('🚮 No existing dev phone Sync Services found');
                }
                console.log('🚮 Removing existing Sync Services');
                syncServices.forEach(async (syncService: SyncServiceInstance) => {
                    await this.twilioClient.sync.services(syncService.sid)
                        .remove();
                })
            });
    }

    // Creates a new conversation service, a conversation, and makes the dev phone a participant
    async createConversation() {
        await this.destroyConversations()
        console.log('💻 Creating a new conversation...');
        const service = await this.twilioClient.conversations.services
                .create({ friendlyName: 'dev-phone' });
        const conversationService = this.twilioClient.conversations.services(service.sid)
        const newConversation = await conversationService.conversations.create({ friendlyName: this.devPhoneName })
        await conversationService.conversations(newConversation.sid)
            .participants.create({identity: this.devPhoneName})
        console.log(`✅ I'm using the conversation ${newConversation.sid} from service ${service.sid}\n`);
        return {
            serviceSid: service.sid,
            sid: newConversation.sid
        }
    }

    async destroyConversations() {
        return await this.twilioClient.conversations.services.list()
            .then(async (convoServices: ConversationServiceInstance[]) => {
                return convoServices.filter((convoService: ConversationServiceInstance) => {
                    convoService.friendlyName !== null && convoService.friendlyName.startsWith('dev-phone')
                });
            }).then((convoServices: ConversationServiceInstance[]) => {
                if (convoServices.length === 0) {
                    console.log('🚮 No dev phone conversation instances found');
                }
                console.log('🚮 Removing existing conversations')
                convoServices.forEach(async (convoService: ConversationServiceInstance) => {
                    await this.twilioClient.conversations.services(convoService.sid)
                        .remove();
                })
            });
    }

}

DevPhoneServer.description = `Dev Phone local express server`

// Example of how to define flags and properties:
// https://github.com/twilio/plugin-debugger/blob/main/src/commands/debugger/logs/list.js#L99-L126
DevPhoneServer.PropertyFlags = {
    "phone-number": flags.string({
        description: 'Phone number from your account to associate this dev-phone with'
    }),
    force: flags.boolean({
        char: 'f',
        description: 'Force the phone number configuration to be overwritten',
        dependsOn: ['phone-number']
    }),
    headless: flags.boolean({
        description: 'Headless mode. Prevents automatic opening of UI in the browser',
        default: false,
    })
};

DevPhoneServer.flags = Object.assign(
    DevPhoneServer.PropertyFlags,
    TwilioClientCommand.flags
);

module.exports = DevPhoneServer;
