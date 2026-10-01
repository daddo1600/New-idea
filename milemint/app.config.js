/**
 * app.json plus the iCloud entitlements, added only when `extra.icloudBackup`
 * is true. The iCloud container (iCloud.com.milemint.app) has to be set up in
 * the Apple Developer portal before a build can be signed with them; until
 * then the flag stays false, the app builds without iCloud and the backup
 * feature is hidden (see modules/icloud-backup/index.ts).
 */
const CONTAINER = 'iCloud.com.milemint.app';

module.exports = ({ config }) => {
  if (!config.extra?.icloudBackup) return config;
  return {
    ...config,
    ios: {
      ...config.ios,
      entitlements: {
        ...config.ios?.entitlements,
        'com.apple.developer.icloud-container-identifiers': [CONTAINER],
        'com.apple.developer.icloud-services': ['CloudDocuments'],
        'com.apple.developer.ubiquity-container-identifiers': [CONTAINER],
      },
    },
  };
};
