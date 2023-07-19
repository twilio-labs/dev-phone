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


class ConversationsServer extends TwilioClientCommand {

    // Creates a new conversation service, a conversation, and makes the dev phone a participant
    async createConversation() {
        await this.destroyConversations()
        console.log('💻 Creating a new conversation...');
        try {
            const service = await this.twilioClient.conversations.services
                .create({ friendlyName: 'dev-phone' });
            const conversationService = this.twilioClient.conversations.services(service.sid)
            const newConversation = await conversationService.conversations.create({ friendlyName: this.devPhoneName })
            await conversationService.conversations(newConversation.sid)
                .participants.create({ identity: this.devPhoneName })
            console.log(`✅ I'm using the conversation ${newConversation.sid} from service ${service.sid}\n`);
            return {
                serviceSid: service.sid,
                sid: newConversation.sid
            }
        } catch (err) {
            console.error(err)
        }
    }

    async destroyConversations() {
        try {
            const convoServices = await this.twilioClient.conversations.services.list()
            const devPhoneConvoServices = convoServices.filter((convoService: SyncServiceInstance) => {
                return convoService.friendlyName !== null && convoService.friendlyName.startsWith('dev-phone')
            })

            if (devPhoneConvoServices.length > 0) {
                console.log('🚮 Removing existing dev phone Conversation Services');
                devPhoneConvoServices.forEach(async (convoService: ConversationServiceInstance) => {
                    await this.twilioClient.conversations.services(convoService.sid)
                        .remove();
                })
            }
        } catch (err) {
            console.error(err)
        }
    }
}


module.exports = ConversationsServer;