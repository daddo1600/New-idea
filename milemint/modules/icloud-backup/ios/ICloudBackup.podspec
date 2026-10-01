Pod::Spec.new do |s|
  s.name           = 'ICloudBackup'
  s.version        = '1.0.0'
  s.summary        = 'Encrypted backups in the user\'s own iCloud, with the key in iCloud Keychain.'
  s.description    = 'Encrypted backups in the user\'s own iCloud, with the key in iCloud Keychain.'
  s.author         = 'MileMint'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.frameworks     = 'CryptoKit', 'Security'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
