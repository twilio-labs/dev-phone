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

class PhoneWebHooksLifecycle extends TwilioClientCommand {
    async updatePhoneWebhooks() {
        if (!this.cliSettings.phoneNumber) return;

        console.log(`💻 Updating Voice and SMS webhooks for ${this.cliSettings.phoneNumber.phoneNumber}...`);

        this.cliSettings.phoneNumber.voiceUrl = this.voiceUrl;
        this.cliSettings.phoneNumber.smsUrl = this.smsUrl;
        this.cliSettings.phoneNumber.statusCallback = this.statusCallback;

        try {
            const updated = await this.twilioClient.incomingPhoneNumbers(this.cliSettings.phoneNumber.sid)
                .update({
                    voiceUrl: this.voiceUrl,
                    smsUrl: this.smsUrl,
                    statusCallback: this.statusCallback,
                })
            console.log('✅ Webhooks updated\n');
            return updated;
        } catch(err) {
            console.error(err)
        }
    }

    async removePhoneWebhooks() {
        if (!this.cliSettings.phoneNumber) return;

        console.log(`🚮 Removing incoming Voice and SMS webhooks for ${this.cliSettings.phoneNumber.phoneNumber}`);
        try {
            const updated = await this.twilioClient
                .incomingPhoneNumbers(this.cliSettings.phoneNumber.sid)
                .update({
                    voiceUrl: "",
                    smsUrl: "",
                    statusCallback: "",
                })
            return updated
        }catch(err) {
            console.error(err)
        }
    }
}

module.exports = PhoneWebHooksLifecycle;