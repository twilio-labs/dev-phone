# dev-phone

A developer tool for testing SMS and Voice applications.

![A mock up of the dev phone UI](https://user-images.githubusercontent.com/8594375/167843260-ea78e367-8533-48e8-a90e-b287eb0ad588.gif)


This is a monorepo that contains two Dev Phone packages:

* the Dev Phone plugin, which uses the Twilio CLI to deploy Twilio account resources and launch a local development server to host the Dev Phone UI
* The Dev Phone UI, the user interface for the Dev Phone. It is a react app that is tightly coupled with the CLI plugin

## Use the Dev Phone

To use the Dev Phone, you'll need to first have [an up-to-date installation of the Twilio CLI](https://www.twilio.com/docs/content-snippets/twilio-cli-snippets/twilio-cli-installation), as well as access to a spare Twilio phone number. That means that [you'll need an upgraded Twilio account](https://support.twilio.com/hc/en-us/articles/223183208-Upgrading-to-a-paid-Twilio-Account?_ga=2.24955578.160882329.1650457443-360531395.1625234680), not a trial account.

Once you've installed the Twilio CLI, you're ready to add the Dev Phone plugin with the following command:

`twilio plugins:install @twilio-labs/plugin-dev-phone`

Once it's installed, you can run the Dev Phone with the following command:

`twilio dev-phone`

Check out the [Dev Phone documentation](https://www.twilio.com/docs/labs/dev-phone) to learn more about installing and using the Dev Phone.

## Contribute to this plugin

Notes for folks working on this plugin are in [DEVELOPMENT.md](DEVELOPMENT.md).
