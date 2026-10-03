/**
 * Siri & Shortcuts: puts the App Intents in native/siri-shortcuts/ into the
 * app target at prebuild (ios/ is generated, so they're kept outside it).
 *
 * Why the app target and not a local Expo module (a pod): iOS only knows an
 * app's intents and App Shortcuts from the metadata Xcode extracts at build
 * time ("Extract App Intents Metadata"), and that step runs on the app's and
 * its extensions' own Swift. Pods are built as static frameworks, whose
 * intents aren't extracted for the app; AppIntentsPackage (iOS 17+) is for
 * frameworks and packages, intents in static libraries only arrived with
 * Xcode 26, and the app supports iOS 16.4. So the Swift is copied into
 * ios/MileSprout/ and added to the app's Sources, like AppDelegate.swift.
 * (The Live Activity's buttons reach the app target the same way, through
 * @bacons/apple-targets' `_shared` folder; that folder is also compiled into
 * the widget extension, where App Shortcuts don't belong.)
 *
 * Also copied, as the app's resources: Localizable.xcstrings (the intents'
 * titles; the phrases' AppShortcuts.xcstrings waits, see CATALOGS). They're JSON
 * String Catalogs, compiled by Xcode (15+) into each language's .lproj.
 *
 * No new capability, entitlement or target: App Intents need no Siri
 * entitlement (that's for the older SiriKit intents), and the App Group the
 * intents read is the one the app already has.
 */
const fs = require('fs');
const path = require('path');
const { IOSConfig, withDangerousMod, withXcodeProject } = require('expo/config-plugins');

/** Relative to the project root (milemint/). */
const SOURCE_DIR = path.join('native', 'siri-shortcuts');
const SOURCES = ['MileSproutShortcuts.swift'];
/*
 * AppShortcuts.xcstrings (the spoken phrases, translated) isn't included: Xcode only accepts it
 * for apps that need iOS 17, and MileSprout supports iOS 16.4 (iPhone 8 and X, which many drivers
 * still use). EAS build 60 failed on it. Until the phrases move to per-language AppShortcuts.strings,
 * Siri's phrases are in English; the intents' titles (Localizable.xcstrings) stay translated.
 */
const CATALOGS = ['Localizable.xcstrings'];

/** Copies the files next to AppDelegate.swift. */
function withSiriShortcutsFiles(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const source = path.join(config.modRequest.projectRoot, SOURCE_DIR);
      const target = path.join(config.modRequest.platformProjectRoot, config.modRequest.projectName);
      await fs.promises.mkdir(target, { recursive: true });
      for (const file of [...SOURCES, ...CATALOGS]) {
        await fs.promises.copyFile(path.join(source, file), path.join(target, file));
      }
      return config;
    },
  ]);
}

/** Adds them to the app target: the Swift to Sources, the catalogs to Resources. */
function withSiriShortcutsProject(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const group = config.modRequest.projectName;
    for (const file of SOURCES) {
      const filepath = path.join(group, file);
      if (!project.hasFile(filepath)) {
        IOSConfig.XcodeUtils.addBuildSourceFileToGroup({ filepath, groupName: group, project });
      }
    }
    for (const file of CATALOGS) {
      const filepath = path.join(group, file);
      if (!project.hasFile(filepath)) {
        IOSConfig.XcodeUtils.addResourceFileToGroup({ filepath, groupName: group, project, isBuildFile: true });
      }
    }
    // The `xcode` package doesn't know .xcstrings (it writes "unknown", and Xcode would copy the JSON
    // as it is): mark them String Catalogs, as Xcode itself does, so they're compiled. And drop the
    // "undefined" values it leaves on the new references.
    const references = project.pbxFileReferenceSection();
    for (const [key, reference] of Object.entries(references)) {
      if (key.endsWith('_comment') || typeof reference !== 'object') continue;
      const name = String(reference.name ?? reference.path ?? '').replace(/"/g, '');
      const catalog = CATALOGS.some((file) => name === file);
      if (!catalog && !SOURCES.includes(name)) continue;
      if (catalog) reference.lastKnownFileType = 'text.json.xcstrings';
      for (const field of ['explicitFileType', 'fileEncoding']) {
        if (reference[field] === undefined || reference[field] === 'undefined') delete reference[field];
      }
    }
    return config;
  });
}

module.exports = function withSiriShortcuts(config) {
  return withSiriShortcutsProject(withSiriShortcutsFiles(config));
};
