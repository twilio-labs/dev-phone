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


class SyncsLifecycle extends TwilioClientCommand {
    async createSync() {
        console.log('💻 Creating a new sync list for call history...');
        await this.destroySyncs()
        
        try {
            const syncService = await this.twilioClient.sync.services
                .create({ friendlyName: this.devPhoneName });
            console.log(`✅ I'm using the sync service ${syncService.sid}\n`);
            // create 'CallLog' syncMap
            await this.twilioClient.sync.services(syncService.sid).syncMaps.create({
                uniqueName: CALL_LOG_MAP_NAME,
            });
            return syncService
        } catch (err) {
            console.error(err)
        }
    }

    async destroySyncs() {
        try {
            const syncServices = await this.twilioClient.sync.services.list()
            const devPhoneSyncServices = syncServices.filter((syncService: SyncServiceInstance) => {
                return syncService.friendlyName !== null && syncService.friendlyName.startsWith('dev-phone')
            })
            
            if(devPhoneSyncServices.length > 0) {
                console.log('🚮 Removing existing dev phone Sync Services');
                devPhoneSyncServices.forEach(async (syncService: SyncServiceInstance) => {
                    await this.twilioClient.sync.services(syncService.sid)
                            .remove();
                })
            }
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = SyncsLifecycle;