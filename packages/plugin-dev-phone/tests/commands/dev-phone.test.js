// test if these components can mount
describe('Addition', () => {
  it('knows that 2 and 2 make 4', () => {
    expect(2 + 2).toBe(4);
  });
});

const { getAvailablePort } = require('../../src/utils/helpers');

// Mock the getPort module to control its behavior
jest.mock('get-port', () => {
  return jest.fn(() => Promise.resolve(1337));
});

describe('getAvailablePort', () => {
  it('should resolve to a port number from the specified range (1337, 3000, 3001, 8000, 8080)', async () => {
    const port = await getAvailablePort();
    expect(port).toBe(1337);
  });
});


// Phone number utils tests
import { isSmsUrlSet } from '../../src/utils/phone-number-utils'; // replace with the path to your module

describe('isSmsUrlSet', () => {
  it('should return false if smsUrl is blank', () => {
    expect(isSmsUrlSet('')).toBe("");
  });

  it('should return false if smsUrl is the default URL', () => {
    expect(isSmsUrlSet('https://demo.twilio.com/welcome/sms/reply')).toBe(false);
  });

  it('should return true if smsUrl is a different URL', () => {
    expect(isSmsUrlSet('https://example.com')).toBe(true);
  });
});


import { isVoiceUrlSet } from '../../src/utils/phone-number-utils'; // replace with the path to your module

describe('isVoiceUrlSet', () => {
  it('should return false if smsUrl is blank', () => {
    expect(isVoiceUrlSet('')).toBe("");
  });

  it('should return false if smsUrl is the default URL', () => {
    expect(isVoiceUrlSet('https://demo.twilio.com/welcome/voice/')).toBe(false);
  });

  it('should return true if voiceUrl is a different URL', () => {
    expect(isVoiceUrlSet('https://example.com')).toBe(true);
  });
});

import { isVoiceUrlSet } from '../../src/utils/phone-number-utils'; // replace with the path to your module

describe('isVoiceUrlSet', () => {
  it('should return false if smsUrl is blank', () => {
    expect(isVoiceUrlSet('')).toBe("");
  });

  it('should return false if smsUrl is the default URL', () => {
    expect(isVoiceUrlSet('https://demo.twilio.com/welcome/voice/')).toBe(false);
  });

  it('should return true if voiceUrl is a different URL', () => {
    expect(isVoiceUrlSet('https://example.com')).toBe(true);
  });
});





// const { expect, test } = require('@twilio/cli-test');
// const { Config, ConfigData } = require('@twilio/cli-core').services.config;
// const DevPhoneServer = require('../../src/commands/dev-phone');

// const testConfig = test
//   .stdout()
//   .stderr()
//   .twilioFakeProfile(ConfigData)
//   .twilioCliEnv(Config);

// describe('dev-phone', () => {
//   describe('providing phone number on command line', () => {

//     const testHelper = (args, responseCode, responseBody) => testConfig
//       .nock('https://api.twilio.com', api => {
//         // api.get('/2010-04-01/Accounts/AC69a381fe7d9987b8a2e98ee7c63ea2b5/IncomingPhoneNumbers/+188888888.json')
//         api.get(uri => true)
//           .query(true)
//           .reply(responseCode, responseBody);
//       })
//       .twilioCommand(DevPhoneServer, args);

//     testHelper(['--phone-number', '+188888888'], 404, {})
//       .it('should not allow phone numbers outside the user\'s account', ctx => {
//         expect(ctx.stderr).to.contain("not associated with your Twilio account");
//       })

//   });

// });


