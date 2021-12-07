const { flags } = require('@oclif/command');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;

const { isSmsUrlSet, isVoiceUrlSet } = require('../phone-number-utils');

const express = require('express');

const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

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
        this.jwt = null;
    }

    async run() {
        await super.run();

        const props = this.parseProperties() || {};
        await this.validatePropsAndFlags(props, this.flags);

        process.on('SIGINT', function () {
            console.log("Caught interrupt signal");
            process.exit();
        });

        const app = express();
        app.use(express.json()); // request body parser

        app.get("/ping", (req, res) => {
            res.json({ pong: true });
        })

        app.get("/plugin-settings", (req, res) => {
            res.json(this.cliSettings);
        })

        app.get("/phone-numbers", (req, res) => {
            if(this.pns.length === 0) {
                return this.twilioClient.incomingPhoneNumbers.list()
                    .then(pns => {
                        this.pns = pns;
                        res.json(reformatTwilioPns(pns));
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
                .then(message => res.json({ result: message }));
        })

        app.get("/client-token", async (req, res) => {

            if (! this.jwt){
                await this.createJwt();
            }

            res.json({ token: this.jwt});
        })

        app.listen(PORT, () => {
            console.log(`Hello 👋 Your local webserver is listening on port ${PORT}`);
            console.log(`Use ctrl-c to stop it`);
        });
    }

    async createJwt() {

        // We need an API KEY and SECRET to create the Access Token
        // Depending on how the user has provided the CLI with creds
        // we may have one already in this.currentProfile, or we may
        // need to create a new one

        let apiKey = "";
        let apiSecret = "";

        if (this.currentProfile.apiKey.startsWith("AC")){
            // This case is if the user has started the CLI with
            // $TWILIO_ACCOUNT_SID and $TWILIO_AUTH_TOKEN set in
            // their environment, using their account creds.
            console.log("Creating a new API Key")
            const newKey = await this.twilioClient.newKeys.create({friendlyName: 'dev-phone'});

            console.log("created");
            console.log({newKey});
            apiKey = newKey.apiKey;
            apiSecret = newKey.apiSecret;

        } else {
            // This case is if the user has _not_ used env vars for
            // their creds. Here we can reuse the api key and secret
            // that the CLI created when it was installed
            console.log("Using profile API key");
            apiKey = this.currentProfile.apiKey;
            apiSecret = this.currentProfile.apiSecret;

        }

        // TODO: call applications.delete on this when the plugin exits?
        const application = await this.twilioClient.applications.create({
            voiceMethod: 'POST',
            // TODO: This URL should be to a Function created in the user's account,
            //       not hard-coded (this URL points to a Function in Luis's account).
            //       We may also need to delete this function when the plugin exits.
            voiceUrl: 'https://dev-phone-6880.twil.io/outbound-call',
            friendlyName: 'dev-phone'
        });

        const accessToken = await new AccessToken(this.twilioClient.accountSid, apiKey, apiSecret);
        accessToken.identity = 'dev-phone'

        const grant = new VoiceGrant({
            outgoingApplicationSid: application.sid,
            incomingAllow: true,
        });
        accessToken.addGrant(grant);

        this.jwt = accessToken.toJwt();
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
