const { expect, test } = require('@twilio/cli-test');
const { Config, ConfigData } = require('@twilio/cli-core').services.config;

const testConfig = test
  .stdout()
  .twilioFakeProfile(ConfigData)
  .twilioCliEnv(Config);

describe('dev-phone', () => {
  describe('example', () => {

    testConfig.it('maths still works', ctx => {
      expect(1+1).to.equal(2);
    })

  });

});
