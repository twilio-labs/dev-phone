# plugin-dev-phone

A Twilio CLI Plugin for the Twilio Dev Phone.

![A mock-up of the dev phone UI](https://user-images.githubusercontent.com/8594375/162187067-33f8e50e-64f9-4bd0-8cdb-ac10b2ff9b63.png)

## Using the Dev Phone

To use the dev phone, you'll need to first have [an up-to-date installation of the Twilio CLI](https://www.twilio.com/docs/content-snippets/twilio-cli-snippets/twilio-cli-installation), as well as access to a spare Twilio phone number. That means that [you'll need an upgraded Twilio account](https://support.twilio.com/hc/en-us/articles/223183208-Upgrading-to-a-paid-Twilio-Account?_ga=2.24955578.160882329.1650457443-360531395.1625234680), not a trial account.

Once you've installed the Twilio CLI, you're ready to add the Dev Phone plugin with the following command:

`twilio plugins:install @twilio-labs/dev-phone`

Once it's installed, you can run the dev phone with the following command:

`twilio dev-phone`

Check out the [dev phone documentation](https://www.twilio.com/docs/labs/dev-phone) to learn more about installing and using the dev phone.

## Working on this plugin

Notes for folks working on this plugin are in [DEVELOPMENT.md](DEVELOPMENT.md).
