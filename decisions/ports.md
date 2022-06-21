# Limited Port Options

## Context
What is the issue we are seeing or design decision we are facing?
There are lots of ways to handle ports. We want to allow users to declare a port for the Dev Phone (which should also enable some basic multi-tenancy on a single machine) but it brings up some other issues, like whether to handle ports as environment variables, or whether to use wildcard ports to avoid clashing with any apps running in developer's current environment.

## Decision
The Dev Phone has the following priorities:

1. Use a user-defined port passed in as a flag.
2. Use a user-defined port passed in via the `TWILIO_DEV_PHONE_PORT` environment variable
3. Use the default port `1337`

## Also considered

- Using `process.env.PORT` seems like it could encourage developers to try and deploy the Dev Phone (which I think is the primary use case here.) It also is likely to be configured as a global variable. We will avoid using it
- Using `0` as the port allows us to choose a wildcard port. This is helpful, but it could cause developers to perceive the Dev Phone as 'chaotic' or 'greedy'. It also makes certain use cases more unpredictable/fiddly, like trying to expose the Dev Phone on local networks (letting a boss peek at the Dev Phone using ngrok or sharing on the local network).

## Consequences
Positive. 

This gives users various configuration options while avoiding collisions with global environment variables and/or encouraging people to deploy the Dev Phone somewhere permanently. There's also a non-standard (but still thoughtful with the 1337 joke) default that is unlikely to conflict with developers' existing applications. The predictable use of ports helps make the Dev Phone feel more like a stable, personalized piece of software.
