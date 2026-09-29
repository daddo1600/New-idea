# Plugins and Tooling for Review

These come from your Claude plugin catalog (Anthropic Directory). **None have been installed.** They are listed here for you to approve.

## Recommended: install for this project

| Plugin | Publisher | What it gives us | Needed when |
|---|---|---|---|
| **swift-lsp** | Community (MSApps) | Real-time Swift diagnostics, go-to-definition, find references and type info through SourceKit-LSP | Build phase. Needs a Mac/Swift toolchain. |
| **Figma** (official) | Figma | Read designs and tokens; the `figma-swiftui` skill turns Figma frames into SwiftUI; design-system generation | Design phase |
| **Design** | Anthropic | Design critique, accessibility review, UX copy, design system, dev handoff | Design phase and paywall/onboarding copy |
| **sentry** | Sentry (partner) | Crash/error debugging through MCP, `sentry-snapshots-cocoa`, release setup | Beta (TestFlight) onward |

## Optional: only if we choose the matching path

| Plugin | Use only if… |
|---|---|
| **supabase** (official) | We add a web dashboard or accountant portal, or cross-platform sync beyond CloudKit (v2) |
| **expo** (official) | We go cross-platform React Native instead of native Swift |
| **appstore-screenshots** | Also Expo/React Native only. It automates App Store screenshots through Maestro and fastlane. |
| **Testing (Kobiton)** | We want a real-device test farm across many iPhone models (paid) |
| **HYPD AI / adplane** | We run paid Meta/Google ads for growth later |

## Not recommended

- **SwiftUI guidance for macOS**: aimed at macOS, not iOS.
- **Swift FocusEngine Pro**: mainly for tvOS/visionOS focus handling; not needed for this app.

## Tools outside the plugin catalog you'll need

| Tool | Why | Cost |
|---|---|---|
| **Mac + Xcode 26** | Required to build, sign and submit iOS apps | Mac hardware |
| **Apple Developer Program** | TestFlight, App Store, CloudKit, entitlements | $99/yr |
| **Apple Small Business Program** | Cuts Apple's commission from 30% to 15% | Free (apply) |
| **RevenueCat** | Subscriptions, remote paywalls, A/B tests, analytics | Free until $2.5K MTR, then 1% |
| **Sentry** | Crash reporting (pairs with the plugin above) | Free tier |
| **fastlane** | Automates builds, screenshots and TestFlight uploads | Free |
| **Claude Code on a Mac** (desktop app or CLI) | Lets Claude run `xcodebuild` and the Simulator directly. This cloud session is Linux, so it can write Swift but can't compile or run iOS. | Included |
| **ASO tool** (Appfigures / AppTweak / Sensor Tower) | Keyword research for "mileage tracker" and related terms | $0–$50/mo starter tiers |

## Suggested order

1. **Now (design):** Figma + Design
2. **Build:** swift-lsp, then Claude Code on your Mac with Xcode
3. **Beta and launch:** sentry, plus RevenueCat and fastlane (set up directly; no plugin in the catalog)
