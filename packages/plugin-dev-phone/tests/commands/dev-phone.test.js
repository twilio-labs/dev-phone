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

// import { reformatTwilioPns } from "../../src/commands/dev-phone";

// describe('reformatTwilioPns', () => {
//   it('should return a string of 4 digits', () => {
//     const result = reformatTwilioPns();
//     expect(result).toMatch(/^dev-phone\d{4}$/);
//   });

//   it('should return a different value each time', () => {
//     const firstCall = reformatTwilioPns();
//     const secondCall = reformatTwilioPns();
//     expect(firstCall).not.toEqual(secondCall);
//   });
// });


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


