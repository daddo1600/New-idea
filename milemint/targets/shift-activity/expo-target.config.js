/**
 * The shift Live Activity (lock screen and Dynamic Island): a WidgetKit
 * extension generated into the Xcode project by @bacons/apple-targets at
 * prebuild. Its Swift lives in this folder; files in `_shared/` (the
 * buttons' App Intents) are compiled into the app as well.
 *
 * Signing: the plugin also adds this target to
 * `extra.eas.build.experimental.ios.appExtensions`, so EAS Build registers
 * com.milemint.app.LiveActivity and makes its provisioning profile (see
 * docs/live-activity.md).
 *
 * @type {import('@bacons/apple-targets/app.plugin').ConfigFunction}
 */
module.exports = (config) => ({
  type: 'widget',
  name: 'LiveActivity',
  displayName: 'MileSprout',
  bundleIdentifier: '.LiveActivity',
  // As the app (Live Activities need 16.2); the buttons check for iOS 17 themselves.
  deploymentTarget: '16.4',
  images: {
    sprout: '../../assets/images/live-activity-sprout.png',
  },
  entitlements: {
    // Where the buttons queue what was tapped for the app (the same group as the app's).
    'com.apple.security.application-groups': config.ios.entitlements['com.apple.security.application-groups'],
  },
});
