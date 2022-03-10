#!/usr/bin/env sh

## This removes all the files created by ./build-for-release.sh

echo "Removing minified assets from dev phone web client"
rm -rf packages/dev-phone-ui/build

echo "Removing built assets from dev phone plugin"
rm -rf packages/dev-phone/public

echo "All done. Built assets have been removed"
