// MileMint only schedules local notifications (the weekly reminder), which
// need no push entitlement. expo-notifications' config plugin adds
// aps-environment anyway; remove it so the app isn't signed for push it
// never uses and the App Store provisioning profile needs no push capability.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
