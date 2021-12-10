# A Decision Record Template

## Context
The plugin generates an AccessToken on startup with is configured with Grants for multiple services:
 * chat
 * voice
 * sync

AccessTokens have a TTL (time-to-live) which by default is one hour. After that time the token will be _expired_ and not work for any of those services. The plugin needs to be restarted to generate a new token, which will also tear down and redeploy a lot of things in the user's account.

## Decision
For Tweek we set the TTL for the AccessToken to the maximum allowed, which is 24 hours.

## Also considered
{chat, voice, sync} clients have a `tokenAboutToExpire` callback fired 3 minutes before a token expires. However, these clients exist in the UI code and each client renews tokens separately so updating the single token on the local backend from these isn't straightforward.

We could also keep track of time ourselves on the local backend and regenerate a token after 23h57m or so. Pushing this token to the front-end would then be necessary.

## Consequences
Plugin features that use the AccessToken will stop working after the plugin has been running for 24 hours:
 - message history
 - voice call history
 - voip calls inbound and outbound