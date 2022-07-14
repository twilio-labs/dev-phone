export {}
const { expect, constants, getFakeSid, test } = require('@twilio/cli-test');
const { Config, ConfigData } = require('@twilio/cli-core').services.config;
const DevPhoneServer = require('../../src/commands/dev-phone');

const testConfig = test.stdout()
  .stderr()
  .twilioFakeProfile(ConfigData)
  .twilioCliEnv(Config);

const fakeNumber = '+188888888';
const fakeNumberSid = getFakeSid('PN')
const fakeNumberResource = {
    sid: fakeNumberSid,
    phone_number: fakeNumber,
    friendly_name: 'dev-phone',
}

describe('dev-phone', () => {
  describe('providing phone number on command line', () => {

    const testHelper = (args, responseCode, responseBody) => testConfig
      .nock('https://api.twilio.com', api => {
        // api.get('/2010-04-01/Accounts/AC69a381fe7d9987b8a2e98ee7c63ea2b5/IncomingPhoneNumbers/+188888888.json')
        api.get(`/2010-04-01/Accounts/${constants.FAKE_ACCOUNT_SID}/IncomingPhoneNumbers/${fakeNumber}.json`)
          .query(true)
          .reply(responseCode, responseBody);
        api.get(`/2010-04-01/Accounts/${constants.FAKE_ACCOUNT_SID}/IncomingPhoneNumbers.json`)
          .query({'PhoneNumber': fakeNumber})
          .reply(responseCode, responseBody);
      })
      .twilioCommand(DevPhoneServer, args);

    testHelper(['--phone-number', fakeNumber], 404, { code: 20404, message: "not associated with your Twilio account"})
      .catch(err => expect(err.message).to.contain('not associated with your Twilio account'))
      .it('should not allow phone numbers outside the user\'s account');

  });

});
