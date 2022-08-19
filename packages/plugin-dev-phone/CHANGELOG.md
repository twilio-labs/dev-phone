# @twilio-labs/plugin-dev-phone

## 1.1.0-beta

### Minor Changes

- 1f34ca3: You can now declare the dev phone's port using the `--port <PORT>` flag or the TWILIO_DEV_PHONE_PORT environment variable. Additionally, the dev phone's default port has been changed to a less common port to avoid interfering with your local application development. If there is interference with the default ports, the Dev Phone will open on a random port.
- 48140f2: Include changesets to simplify changelog generation

### Patch Changes

- Updated dependencies [db0dcd6]
- Updated dependencies [48140f2]
  - @twilio-labs/dev-phone-ui@1.0.0
