Pod::Spec.new do |s|
  s.name           = 'InstallSource'
  s.version        = '1.0.0'
  s.summary        = 'Tells a TestFlight install from an App Store one.'
  s.description    = 'Reads the App Store receipt name and whether the app carries a provisioning profile, to tell a TestFlight install from an App Store, development or Simulator one. Nothing leaves the phone.'
  s.author         = 'MileMint'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
