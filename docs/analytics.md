# Calculator engagement measurement

Existing GA4 measurement ID: `G-HRKELF4XYB`.

| Event | Trigger | Parameters |
| --- | --- | --- |
| `calculator_start` | First input/change or calculation attempt on a tool | `calculator` |
| `calculator_complete` | Calculation button handler has rendered a valid result | `calculator` |
| `calculator_validation_error` | Calculation attempt renders a validation message | `calculator` |
| `related_calculator_click` | A main-content link opens a calculator | `calculator`, `destination` |
| `calculator_share` | Calculation link successfully copied | `calculator` |
| `calculator_print` | Summary print action invoked | `calculator` |
| `resource_download` | Public worked-example download selected | `calculator`, `resource` |

`calculator` is the current page slug; destination/resource are local paths.
No input numbers, results, currency amounts, emails, query strings or fragments are included in custom event parameters. The GA4 configuration also strips queries and fragments from page location and referrer. The tag and events run only on the production hostname; preview and local checks send no data.

The Google tag loads after the page load event, using an idle callback with a two-second timeout. Events are queued before it loads. The page remains usable without it.

To verify in GA4 Admin → DebugView, open a production calculator with `?analytics_debug=1`, change an input, attempt an invalid calculation, then calculate valid values. Debug mode applies only to that test URL. Confirm the three event names and inspect their categorical parameters. Do not put private inputs in the URL. Standard reports can take time to process new events.

Register event-scoped custom dimensions for `calculator`, `destination`, and `resource` if they are not already present. Calculation completion measures engagement; it does not by itself represent a sale or lead.

Run `npm test` for event ordering, deduplication, production gating and URL/input privacy checks. These tests do not prove remote receipt; verify that separately in GA4.
