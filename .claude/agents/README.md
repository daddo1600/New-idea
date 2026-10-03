# MileSprout's agents

Specialists that Claude Code hands work to in this project. Ask in plain words, e.g. "have the qa agent review today's changes".

| Agent | For | Never |
|---|---|---|
| coding | App and website features, fixes, tests | Builds or publishes without asking |
| qa | Reviews and tests before a build, iPhone-only traps, simulated user panels | Fixes without being asked |
| translator | The 10 languages, app, Siri, website, store | Says "tracking"; changes placeholders |
| release | Preflight, EAS build, App Store Connect upload, TestFlight | Builds unless asked |
| app-store | TestFlight feedback and crashes, listing text and screenshots | Changes the listing without an explicit ask |
| marketing | Website copy, posts, launch plans, tester recruitment | Posts or messages anyone |
| partner-outreach | Perks partner research and draft emails | Sends anything or guesses contacts |
| research | Tax rules, competitors and platform rules, with sources | States anything without a source |

A typical build: coding (changes) → translator (new text) → qa (review and preflight) → release (build and TestFlight) → app-store (feedback and crashes).
