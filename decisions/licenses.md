# Include license information for dev-phone-ui

The license information is only included in the dev-phone-ui package.

## Context
We need to include license information for the dependencies of the two packages we'll be publishing to NPM.

## Decision
`dev-phone-ui` uses the `webpack-license-checker` package to bundle in license information about its dependencies, because it directly bundles its dependencies' code when it builds. Meanwhile, the `dev-phone` maintains `require` statements in its code 

## Also considered
There are ways to include a license folder in the `dist` directory using a package like `license-checker` and piping its output, but it doesn't seem like it's legally necessary.

## Consequences
Simplifies our development and build process for the `dev-phone` package.
