
## Prerequisites

You will need:
 - Node development environment (node, npm, npx)
 - Twilio CLI

## How to run this plugin for development

  1. Get the code:
     * Clone this repo & `cd` into the directory
  1. Install the plugin
     * `cd plugin-dev-phone`
     * `npm install`
     * `cd ..`
  1.  Link the plugin with your Twilio CLI installation
     * `twilio plugins:link $(pwd)/plugin-dev-phone`
  1. Start the plugin
     * `twilio dev-phone` or use a specific number by using the --phone-number flag. e.g. `twilio dev-phone --phone-number +11234567890`
     * Leave this running and continue in a new terminal.
  1. Start the front end
     * (TODO: this is not yet bundled and started automatically by the plugin)
     * `cd plugin-dev-phone-client`
     * `npm install`
     * `npm start`

The last command should open your browser which will show a basic UI that tells you how many Twilio numbers you have. There's also a little form where you can choose one of your Twilio numbers, enter another number (your cell for example) and send an SMS from the one to the other.

### Easter Egg
 let's party like it's 1991 🎉. On this UI enter a [Konami code](https://en.wikipedia.org/wiki/Konami_Code) of

    ↑ ↑ ↓ ↓ ← → ← → 1 9 9 1

to see a little gift.

## How to modify the plugin

From now on you can edit the plugin server code (in `plugin-dev-phone`, running on port 3001 usually) and front end (in `plugin-dev-phone-client`, running on port 3000 usually)

### Local back end

Work in `plugin-dev-phone/`. Start with `src/commands/dev-phone.js`.

This does _not_ hot-reload, so whenever you make edits you will need to stop and restart `twilio dev-phone`.

You can make requests directly to this server without running the front end, eg http://localhost:3001/ping

Run tests with `npm test`. There are no real tests at the moment but the place to add them is `test/commands/dev-phone.test.js`.

### Local front end

Work in `plugin-dev-phone-client/`. Start with `src/App.js`.

This does hot-reload, so changes will be reflected in your browser as soon as you save.

Run tests with `npm test`. There are no tests at the moment but the place to add them is `

### Build and Release
You can build the front-end code and move it into place to be served by the back-end with `./build-for-release.sh`

If you do this you will _not_ need to run the local front end as described above, as it will be served by the express app. You will lose hot-reloading, though.
