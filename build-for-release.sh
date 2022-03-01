#!/usr/bin/env sh

echo "Building minified assets from /plugin-dev-phone-client"
cd plugin-dev-phone-client
npm run build
cd ..

echo "Copying built assets to /plugin-dev-phone/public"
rm -rf plugin-dev-phone/public
cp -R  plugin-dev-phone-client/dist plugin-dev-phone/public

echo "All done. Built assets will be served by the express server"
