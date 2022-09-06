---
"@twilio-labs/plugin-dev-phone": patch
---

Include the `answerOnBridge` parameter in `<Dial>` TwiML. This fixes an issue where incoming calls play `<Say>` and `<Play>` verbs prematurely.
