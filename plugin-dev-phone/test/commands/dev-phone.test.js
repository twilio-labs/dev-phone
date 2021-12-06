const { expect, test } = require('@twilio/cli-test');
const { Config, ConfigData } = require('@twilio/cli-core').services.config;
const DevPhoneServer = require('../../src/commands/dev-phone');

const testConfig = test
  .stdout()
  .stderr()
  .twilioFakeProfile(ConfigData)
  .twilioCliEnv(Config);

describe('dev-phone', () => {
  describe('providing phone number on command line', () => {

    const testHelper = (args, responseCode, responseBody) => testConfig
      .nock('https://api.twilio.com', api => {
        // api.get('/2010-04-01/Accounts/AC69a381fe7d9987b8a2e98ee7c63ea2b5/IncomingPhoneNumbers/+188888888.json')
        api.get(uri => true)
          .query(true)
          .reply(responseCode, responseBody);
      })
      .twilioCommand(DevPhoneServer, args);

    testHelper(['--phone-number', '+188888888'], 404, {})
      .it('should not allow phone numbers outside the user\'s account', ctx => {
        expect(ctx.stderr).to.contain("not associated with your Twilio account");
      })

  });

});
