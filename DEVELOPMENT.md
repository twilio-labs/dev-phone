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
   3. Make changes to the source code. When you're ready to test them, use `CTRL + C` to tear down the Dev Phone if it's still running, then rebuild the plugin with `npm run build --workspace=packages/plugin-dev-phone`

## Dev Phone UI
   1. Start the front end
     * `npm start --workspace=packages/dev-phone-ui`
     * Open `http://localhost:3000/` in your browser
   2. The Dev Phone UI runs a dev server that will hot reload when you make changes. The UI relies on tokens and data provided by the plugin, so you MUST be running the CLI plugin for the local UI to work

After running the plugin and/or the UI locally, you should see the Dev Phone UI appear with a phone number selector.

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

### Documenting Changes
After you've made changes, run:

`npx changeset`

to clearly document what changes you've made. This will be included in the future CHANGELOG.md for the appropriate package update.

## Build
The Dev Phone CLI plugin uses the Dev Phone UI as a dependency. This means that new versions of the UI need to be released with a version bump AND the latest version needs to be installed and released in the Dev Phone plugin in order to be consumed by end users.

If you're including new packages in the repository, please include the relevant licenses for said licenses. This may require legal approval to ensure that the Dev Phone open source license stays valid.

When you're ready for a new deploy, do a fresh build of the `dist` folders with:

`npx turbo run build`

Once there's a new build, you can manage a version bump on a new version branch with:

```
npx changesets version
```

As of 30 Sep 2022, the Dev Phone is still in a prerelease, and so all version bumps are beta version bumps (no major, minor, or patch). This should create some changes in the Changelogs and package.json that need to be committed and pushed to GitHub. Be sure to commit both the version branch and the tag.

## Release
To release, run:

`npx changesets publish`

Note that tests and linting are on the roadmap as a part of the release process.
