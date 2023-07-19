import path from 'path';
import fs from 'fs';
import open from 'open';
import express from 'express';

import { Flags } from '@oclif/core';
import { deployServerless, constants } from '../utils/create-serverless-util';
import { getAvailablePort, isValidPort } from '../utils/helpers'
import { isSmsUrlSet, isVoiceUrlSet } from '../utils/phone-number-utils';
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const WebClientPath = path.resolve(require.resolve('@twilio-labs/dev-phone-ui'), '..')
const { version } = require('../../package.json');

// Types
import { ServiceInstance as ServerlessServiceInstance } from 'twilio/lib/rest/serverless/v1/service'
import { ServiceInstance as SyncServiceInstance } from 'twilio/lib/rest/sync/v1/service'
import { ServiceInstance as ConversationServiceInstance } from 'twilio/lib/rest/conversations/v1/service'
import { KeyInstance } from 'twilio/lib/rest/api/v2010/account/key'
import { ApplicationInstance } from 'twilio/lib/rest/api/v2010/account/application'
import { IncomingPhoneNumberInstance } from 'twilio/lib/rest/api/v2010/account/incomingPhoneNumber'

const AccessToken = require('twilio').jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const VoiceGrant = AccessToken.VoiceGrant;
const SyncGrant = AccessToken.SyncGrant;
const CALL_LOG_MAP_NAME = 'CallLog'


class TwimlAppsLifecycle extends TwilioClientCommand {
    async createTwimlApp() {
        console.log('💻 Creating a new TwiMl App to allow voice calls from your browser...'); 
        await this.destroyTwimlApps()
        try {
            const app = await this.twilioClient.applications
                .create({
                    voiceUrl: this.voiceOutboundUrl,
                    friendlyName: this.devPhoneName
                });
            console.log(`✅ I'm using the TwiMl App ${app.sid}\n`);
            return app;
        } catch (err) {
            console.error(err)
        }
    }

    async destroyTwimlApps() {
        try {
            const applications = await this.twilioClient.applications.list()
            const devPhoneApps = applications.filter((twimlApp: ApplicationInstance) => {
                return twimlApp.friendlyName !== null && twimlApp.friendlyName.startsWith('dev-phone')
            })

            if(devPhoneApps.length > 0) {
                console.log('🚮 Removing existing dev phone TwiML apps');
                devPhoneApps.forEach(async (twimlApp: ApplicationInstance) => {
                    await this.twilioClient.applications(twimlApp.sid)
                        .remove();
                })
            }
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = TwimlAppsLifecycle;