# plugin-dev-phone

A Twilio CLI Plugin for the Twilio Dev Phone.

![A mock-up of the Dev Phone UI](https://user-images.githubusercontent.com/8594375/162187067-33f8e50e-64f9-4bd0-8cdb-ac10b2ff9b63.png)

## Using the Dev Phone

To use the Dev Phone, you'll need to first have [an up-to-date installation of the Twilio CLI](https://www.twilio.com/docs/content-snippets/twilio-cli-snippets/twilio-cli-installation), as well as access to a spare Twilio phone number. That means that [you'll need an upgraded Twilio account](https://support.twilio.com/hc/en-us/articles/223183208-Upgrading-to-a-paid-Twilio-Account?_ga=2.24955578.160882329.1650457443-360531395.1625234680), not a trial account.

Once you've installed the Twilio CLI, you're ready to add the Dev Phone plugin with the following command:

`twilio plugins:install @twilio-labs/plugin-dev-phone`

Once it's installed, you can run the Dev Phone with the following command:

`twilio dev-phone`

Check out the [Dev Phone documentation](https://www.twilio.com/docs/labs/dev-phone) to learn more about installing and using the Dev Phone.

## Commands
<!-- commands -->
* [`twilio dev-phone`](#twilio-dev-phone)

## `twilio dev-phone`

Dev Phone local express server

```
USAGE
  $ twilio dev-phone [-l debug|info|warn|error|none] [-o columns|json|tsv|none] [--silent] [-p <value>] [-f
    --phone-number <value>] [--headless] [--port <value>]

FLAGS
  -f, --force                      Optional. Forces an overwrite of the phone number configuration.
  -l=(debug|info|warn|error|none)  [default: info] Level of logging messages.
  -o=(columns|json|tsv|none)       [default: columns] Format of command output.
  -p, --profile=<value>            Shorthand identifier for your profile.
  --headless                       Optional. Prevents the UI from automatically opening in the browser.
  --phone-number=<value>           Optional. Associates the Dev Phone with a phone number. Takes a number from the
                                   active profile on the Twilio CLI as the parameter.
  --port=<value>                   Optional. Configures the port of the Dev Phone UI. Takes a valid port as a parameter.
  --silent                         Suppress  output and logs. This is a shorthand for "-l none -o none".

DESCRIPTION
  Dev Phone local express server
```

_See code: [dist/commands/dev-phone.ts](https://github.com/twilio-labs/dev-phone/blob/1.0.0-beta.3/dist/commands/dev-phone.ts)_
<!-- commandsstop -->
 
## Working on this plugin

Notes for folks working on this plugin are in [DEVELOPMENT.md](DEVELOPMENT.md).
