# comlink-dev-phone
A tool for testing SMS and Voice applications


## Design Values

* **Self-Contained** The soft phone should clean up after itself
* **Respectful of existing configuration** We shouldn't do things like 
* **Accessible** Everything should be keyboard navigable
* **Mobile First** Part of the magic of Twilio applications is getting information on your phone - let's make an experience that works well on people's phones

## Design Principle

* In simple situations that turn out being complex (e.g., selecting a phone number), identify a critical path that will get us to a demo-able state, but #WriteItDown and keep track of edge cases you've considered, and how the fully-fledged feature might look
