---
"@twilio-labs/plugin-dev-phone": patch
---

Bind the local server to 127.0.0.1 only and reject requests whose Host header isn't a loopback address, closing an unauthenticated LAN and DNS-rebinding attack path that could exfiltrate a 24-hour Twilio access token, send SMS, or hijack phone-number webhooks on the developer's account.
