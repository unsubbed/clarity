# Plainly — clean-room log

Incumbent: Hemingway Editor (Boondoggle Studio, LLC). Plainly is described only as "a free alternative to Hemingway Editor".

## Sources used for SPEC.md
| Date | Source | How | What we took |
|---|---|---|---|
| 2026-10-24 | https://hemingwayapp.com/ (public web editor) | REA `capture_browser_scenario`: load page, accessibility tree, screenshot, network host list | Screen layout, mode tabs (Write/Edit/Feedback), panel contents, stats list, toggle buttons, menu items |
| 2026-10-24 | https://hemingwayapp.com/ | REA scenario: reject optional cookies, click Show more stats, Adjust target readability, Feedback, Write, Edit, Menu | What each control does (behavior only) |
| 2026-10-24 | https://hemingwayapp.com/help/docs/readability | Public help page, read via fetch | Grade meaning, hard vs very hard idea, target levels concept, stats list |
| 2026-10-24 | https://hemingwayapp.com/help/docs/highlighted-issues | Public help page | Highlight categories, toggles, click-for-detail behavior |
| 2026-10-24 | https://hemingwayapp.com/help/docs/quick-start-guide | Public help page | Write vs Edit mode behavior |
| — | Automated Readability Index (Senter & Smith, 1967, US Air Force report; public formula) | General knowledge | Readability formula |

## What we did NOT do
- No decompiling, unminifying, source-map recovery, script-source capture or binary tools on any incumbent software. REA `include_script_sources` was never enabled; no DOM dump was taken.
- No desktop app installed, no EULA accepted, no account created, no login.
- Cookie banner: chose "Reject optional uses".
- No incumbent text, sample document, word lists, colors, logo, fonts or icons were copied. Our sample text, word lists, thresholds and palette are written fresh. The incumbent publishes no thresholds; ours are our own choices.

## Raw captures
Raw REA output and screenshots stay in `.rea-private/` (git-ignored, never given to the builder, never published).
