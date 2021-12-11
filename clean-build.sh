#!/usr/bin/env sh

## This removes all the files created by ./build-for-release.sh

echo "Removing minified assets from /plugin-dev-phone-client"
rm -rf plugin-dev-phone-client/build

echo "Removing built assets from /plugin-dev-phone/public"
rm -rf plugin-dev-phone/public

echo "All done. Built assets have been removed"
