# dev-phone-services

A Twilio CLI plugin for testing SMS and Voice applications.

![A mock-up of the dev phone UI](https://user-images.githubusercontent.com/8594375/162187067-33f8e50e-64f9-4bd0-8cdb-ac10b2ff9b63.png)

This is a monorepo that contains two dev-phone packages:

* The dev-phone plugin, which is responsible for deploying Twilio account resources and integrating with the Twilio CLI.
* The dev-phone-ui, the user interface for the dev phone. The dev-phone plugin renders the ui on a local web server.

## Key Personas!


#### The International Developer
A developer in France is at a Superclass event playing Twilioquest. They need a phone number to accomplish some of the missions, but they forgot to get a French phone number prior to the event and can't send/receive calls or messages. They run the soft phone on their command line instead, and are able to use it to complete the Voice and SMS missions.

#### The Brutalist Bunker
A developer is in a beautiful building constructed with thick, concrete walls. They send a text message to their Twilio app, only to glance back at their phone a moment later: "Message Failed to Send. Please retry." They don't have service in this building! They boot up the soft phone and use it to finish testing their application, thankful that they don't have to run outside every 5 minutes while debugging.

#### The Automaton (Future Work)
A developer is building with Twilio and wants to write some automated testing to ensure that their application is behaving as expected. They run the soft phone "Snapshot Mode" on and track the app behavior. They then configure their CI/CD to use a terminal-based version of the softphone and compare the CI/CD snapshot to the previously created Snapshot. The snapshot is a mismatch, and their PR fails before pushing the faulty integration to prod.

## Values

- **Locally Grown** The soft phone deploys as locally as possible, but makes smart choices to deploy resources. It avoids exposing publicly accessible resources that could be exploited or otherwise forgotten.
- **Self-Contained** the dev phone should:
    -   Tread lightly: avoid overwriting any pre-existing config in the user's Twilio account
    -   Clean up after itself. The dev phone will avoid leaving Assets/Functions which it has deployed, (as far as possible).
-   **Plays nicely with your environment** The dev phone should work on any reasonably configured network - so it avoids using tunneling software and properly deploys resources when necessary, instead.
-   **Plays nicely with others** It should be possible for one or many developers to open multiple soft phones either for the same number or different ones without them interfering with each other.


## Working on this plugin

Notes for folks working on this plugin are in [DEVELOPMENT.md](DEVELOPMENT.md).
