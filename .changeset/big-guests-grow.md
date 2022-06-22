---
"@twilio-labs/plugin-dev-phone": minor
---

You can now declare the dev phone's port using the `--port <PORT>` flag or the TWILIO_DEV_PHONE_PORT environment variable. Additionally, the dev phone's default port has been changed to a less common port to avoid interfering with your local application development. If there is interference with the default ports, the Dev Phone will open on a random port.
