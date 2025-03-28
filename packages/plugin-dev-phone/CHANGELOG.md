# @twilio-labs/plugin-dev-phone

## 1.0.0-beta.6

### Minor Changes

- d512daf: Include new `clear` flag, enabling the deletion of all dev-phone resources from your Twilio account

### Patch Changes

- b528d50: Update services to use v1 endpoints with the helper library. This will quiet noisy setup and teardown of the dev phone.

## 1.0.0-beta.5

### Patch Changes

- a620022: Update dev phone ui dependency

## 1.0.0-beta.4

### Patch Changes

- 8d07457: Use the Dev Phone Name when deleting resources to allow multiple instances to work against the same subaccount.
- Updated dependencies [1a4872c]
- Updated dependencies [6ead73b]
- Updated dependencies [75bb2ed]
- Updated dependencies [5b8461f]
  - @twilio-labs/dev-phone-ui@1.0.0-beta.2

## 1.0.0-beta.3

### Major Changes

- f2f19db: The dev phone plugin is now compatible with Twilio CLI v5. Backwards compatibility is no longer guaranteed, unfortunately, so we recommend bumping to a recent node version and updating the plugin CLI as soon as possible.

### Patch Changes

- 3838d2f: fix white spaces issue in message bubbles

## 1.0.0-beta.2

### Patch Changes

- de1222b: Include the `answerOnBridge` parameter in `<Dial>` TwiML. This fixes an issue where incoming calls play `<Say>` and `<Play>` verbs prematurely.

## 1.0.0-beta.1

### Minor Changes

- 1f34ca3: You can now declare the dev phone's port using the `--port <PORT>` flag or the TWILIO_DEV_PHONE_PORT environment variable. Additionally, the dev phone's default port has been changed to a less common port to avoid interfering with your local application development. If there is interference with the default ports, the Dev Phone will open on a random port.
- 48140f2: Include changesets to simplify changelog generation

### Patch Changes

- Updated dependencies [db0dcd6]
- Updated dependencies [48140f2]
  - @twilio-labs/dev-phone-ui@1.0.0
