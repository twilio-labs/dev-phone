# A Decision Record Template

## Context
The dev-phone includes both Voice and SMS functionality. We know that in general it's not a safe assumption that any particular phone number has both sets of capabilities.

## Decision
We are going to work on the (known-wrong) assumption that all PNs have SMS and Voice capability, and we are only going to test and demo with those. This assumption actually _is_ safe for all US numbers, and all UK mobile numbers which are the easiest and cheapest to purchase.

We therefore will not implement any of the `--sms-only` or `--voice-only` options from the original Spec.

## Also considered
We could fully support these phone numbers, and disable the parts of the UI which don't match the dev-phone number's capabilities. We discounted this because it's a higher priority to get both working for numbers that support both.

## Consequences
Associating a number to your dev-phone that does not have both capabilities might not work.
