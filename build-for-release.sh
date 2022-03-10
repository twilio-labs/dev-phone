#!/usr/bin/env sh

echo "Building minified assets from dev phone ui"
rm -rf packages/dev-phone-ui/dist
cd packages/dev-phone-ui
npm run build
cd ..

echo "Copying built assets to dev phone plugin"
rm -rf packages/dev-phone/dist/public
cp -R  packages/dev-phone-ui/dist packages/dev-phone/dist/public

echo "All done. Built assets will be served by the express server"
