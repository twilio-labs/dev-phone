# Loopback-only server, with a Host-header check

## Context
The Dev Phone runs a local Express server that is authenticated as the developer's real Twilio account (the CLI's active profile credentials). Its routes can send SMS, mint 24h Voice/Chat/Sync access tokens, rewrite phone-number webhooks, and enumerate account resources.

Prior to this decision, `app.listen(port, callback)` was called with no host argument, so Node bound the server to every interface (`0.0.0.0`). The routes had no `Origin`, `Host`, auth, or CSRF check. That meant:

1. Anyone on the same LAN as the developer (office / conference / hotel Wi-Fi, or a compromised device on the network) could reach the server directly at `http://<dev-machine-ip>:<port>/...` and take action on the developer's account.
2. Any web page the developer visited could reach the server via DNS rebinding: the page's origin resolves to `127.0.0.1`, the browser treats the response as same-origin, and the server has no way to notice that the request wasn't actually meant for it.

This is the same class of bug as CVE-2025-66414 in the MCP TypeScript SDK, which was fixed by adding a Host-header validation middleware for local servers.

## Decision
The Dev Phone server binds to `127.0.0.1` only, and rejects any HTTP request whose `Host` header is not a loopback hostname (`localhost`, `127.0.0.1`, or `[::1]`).

Specifically:

- `app.listen(this.port, '127.0.0.1', ...)` — Node will not accept connections on any non-loopback interface.
- A middleware installed ahead of everything else calls `isLoopbackHost(req.headers.host)` and returns `403` if it doesn't match. This runs before static assets, so even the UI shell isn't served to a mismatched Host.

The loopback bind alone closes the LAN path. The Host check alone would close the DNS-rebinding path. We do both so that neither has to carry the fix on its own.

We are deliberately *not* making the bind address configurable via a flag or environment variable. See below.

## Also considered

- **A `--host` flag or `TWILIO_DEV_PHONE_HOST` env var**, mirroring how port is configurable (see [ports.md](./ports.md)). Rejected: the whole reason non-loopback binding was a vulnerability is that this server acts on the developer's real account with no per-request auth. Making it opt-outable puts a foot-gun in every user's hand and would likely re-appear in tutorials and blog posts. Developers who genuinely need to expose the running Dev Phone to another machine can use ngrok, an SSH port forward, or localtunnel — all of which connect *to* `127.0.0.1` from the dev machine and don't require the server itself to be reachable from the network.
- **The LAN-sharing use case hinted at in [ports.md](./ports.md)** ("letting a boss peek at the Dev Phone using ngrok or sharing on the local network"). The ngrok half still works fine — ngrok tunnels to localhost. The "sharing on the local network" half is the exact thing this decision retires, on purpose.
- **Adding a CSRF token or per-session secret to state-changing routes instead of a Host check.** A useful defense-in-depth, but on its own it wouldn't stop an attacker on the LAN from reading `/client-token` (which is a `GET` and needs no CSRF token to fetch) or `/phone-numbers`. The Host check is a smaller and more complete fix for the delivery paths we care about. CSRF tokens could be layered on later if the UI grows a session model.
- **Only doing the loopback bind, skipping the Host check.** Rejected: DNS rebinding defeats a loopback bind by design. Both halves are needed.
- **Also validating the port inside the Host header against the port we bound to.** Rejected as redundant: because we listen only on `127.0.0.1:<port>`, a request can't physically reach us on any other port. Whatever port the client puts in its Host header is not carrying security weight — only the hostname is. The check is hostname-only, which also makes the helper's signature (`isLoopbackHost(host)`) obvious at the callsite.

## Consequences
Positive.

- Requests from other machines on the network are refused at the TCP layer.
- Requests reaching `127.0.0.1` with an attacker-controlled `Host` (the DNS-rebinding path) are refused at the middleware layer with a `403`.
- The developer's browser continues to work unchanged — it opens `http://localhost:<port>/` and its `Host` header matches.

Negative / neutral.

- Users who were relying on hitting the Dev Phone from another device on their LAN will find it no longer answers. This is intentional; the recommended path is a tunnel from the local machine.
- If a future feature genuinely needs to accept non-loopback requests, it will need its own design record explaining what auth/CSRF layer replaces the loopback guarantee.
