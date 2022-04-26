# Development with the Dev Phone Services

## Prerequisites

You will need:
 - Node development environment (node, npm, npx)
 - Twilio CLI

## Set up and run locally

   1. Get the code:
     * Clone this repo & `cd` into the directory
   2. Install all of the dependencies using `npm i --workspaces`
   3. Build all of the packages using `npm run build --workspaces`

## CLI Plugin
   1. Link the plugin with your Twilio CLI installation
     * `twilio plugins:link $(pwd)/packages/plugin-dev-phone`
   2. Start the plugin
     * `twilio dev-phone` or use a specific number by using the --phone-number flag. e.g. `twilio dev-phone --phone-number +11234567890`
     * Leave this running and continue in a new terminal.
   3. Make changes to the source code. When you're ready to test them, use `CTRL + C` to tear down the dev phone if it's still running, then rebuild the plugin with `npm run build --workspace=packages/plugin-dev-phone`

## Dev Phone UI
   1. Start the front end
     * `npm start --workspace=packages/dev-phone-ui`
     * Open `http://localhost:3000/` in your browser
   2. The dev phone UI runs a dev server that will hot reload when you make changes. The UI relies on tokens and data provided by the plugin, so you MUST be running the CLI plugin for the local UI to work

After running the plugin and/or the UI locally, you should see the dev phone UI appear with a phone number selector.

## How to modify the plugin

From now on you can edit the plugin server code (in `packages/plugin-dev-phone`, running on port 3001 usually) and front end (in `packages/dev-phone-ui`, running on port 3000 usually)

### Local back end

Work in `packages/plugin-dev-phone/`. Start with `src/commands/dev-phone.js`.

This does _not_ hot-reload, so whenever you make edits you will need to stop, rebuild with `npm run build --workspace=packages/plugin-dev-phone` and restart with `twilio dev-phone`.

You can make requests directly to this server without running the front end, eg http://localhost:3001/ping

Run tests with `npm test`. There are no real tests at the moment but the place to add them is `test/commands/dev-phone.test.js`.

### Local front end

Work in `packages/dev-phone-ui`. Start with `src/App/App.js`.

This does hot-reload, so changes will be reflected in your browser as soon as you save.

Run tests with `npm test`. There are no tests at the moment but the place to add them is `

### Build and Release
You can build the front-end code and move it into place to be served by the back-end with `./build-for-release.sh`

If you do this you will _not_ need to run the local front end as described above, as it will be served by the express app. You will lose hot-reloading, though.
