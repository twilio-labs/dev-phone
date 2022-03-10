# comlink-dev-phone

A Twilio CLI plugin for testing SMS and Voice applications.

![A simple architecture of the Softphone](https://user-images.githubusercontent.com/8594375/144852695-eb45253b-9ef2-4d68-a73f-40364b18c978.jpg)


## Key Personas

**The International Struggle**
A developer in France is at a Superclass event playing Twilioquest. They need a phone number to accomplish some of the missions, but they forgot to get a French phone number prior to the event and can't send/receive calls or messages. They run the soft phone on their command line instead, and are able to use it to complete the Voice and SMS missions.

**The Brutalist Architecture**
A developer is in a beautiful building constructed with thick, concrete walls. They send a text message to their Twilio app, only to glance back at their phone a moment later: "Message Failed to Send. Please retry." They don't have service in this building! They boot up the soft phone and use it to finish testing their application, thankful that they don't have to run outside every 5 minutes while debugging.

**The Automaton (Stretch)**
A developer is building with Twilio and wants to write some automated testing to ensure that their application is behaving as expected. They run the soft phone "Snapshot Mode" on and track the app behavior. They then configure their CI/CD to use a terminal-based version of the softphone and compare the CI/CD snapshot to the previously created Snapshot. The snapshot is a mismatch, and their PR fails before pushing the faulty integration to prod.

## Design Values

* **Self-Contained** The soft phone should clean up after itself
* **Respectful of existing configuration** dev-phone should:
  * Tread lightly: avoid overwriting any pre-existing config in the user's Twilio account
  * Clean up after itself: avoid leaving Assets/Functions which it has deployed (as far as possible).
* **Accessible** Everything should be keyboard navigable
* **Mobile First** Part of the magic of Twilio applications is getting information on your phone - let's make an experience that works well on people's phones
* **Plays nicely with others** It should be possible for one or many developers to open multiple soft phones either for the same number or different ones without them interfering with each other.

## Design Principle

* In simple situations that turn out being complex (e.g., selecting a phone number), identify a critical path that will get us to a demo-able state, but #WriteItDown and keep track of edge cases you've considered, and how the fully-fledged feature might look. Keep these documents in the repo, in the `decisions` directory.


## Working on this plugin

Notes for folks working on this plugin are in [DEVELOPMENT.md](DEVELOPMENT.md).
