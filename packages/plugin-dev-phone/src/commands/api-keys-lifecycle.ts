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

class ApiKeysLifecycle extends TwilioClientCommand {

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
            // their creds. Here we can reuse the api keys and secret
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

            console.log("💻 I'm creating a new API Key...");
            await this.destroyApiKeys()
            try {
                const key = await this.twilioClient.newKeys.create({ friendlyName: this.devPhoneName });
                console.log(`✅ I'm using the API Key ${key.sid}\n`);

                this.currentProfile.apiKey = key.sid;
                this.currentProfile.apiSecret = key.secret;
                return {
                    sid: this.currentProfile.apiKey,
                    secret: this.currentProfile.apiSecret
                }
            } catch (err) {
                console.error(err)
            }
        }
    }

    async destroyApiKeys() {

        if (this.twilioCliIsConfiguredWithApiKey()) {
            // we never created one
            return
        } else {
            try {
                const keys = await this.twilioClient.keys.list()
                const devPhoneKeys = keys.filter((key: KeyInstance) => {
                    return key.friendlyName !== null && key.friendlyName.startsWith('dev-phone')
                })

                if (devPhoneKeys.length > 0) {
                    console.log('🚮 Removing existing dev phone API Keys');
                    devPhoneKeys.forEach(async (key: KeyInstance) => {
                        await this.twilioClient.keys(key.sid).remove();
                    })
                }
            } catch (err) {
                console.error(err)
            }
        }
    }
}

module.exports = ApiKeysLifecycle;
