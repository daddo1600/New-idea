Pod::Spec.new do |s|
  s.name           = 'SiriShortcuts'
  s.version        = '1.0.0'
  s.summary        = 'Keeps the summary Siri and Shortcuts read (work miles today and this week) in the App Group.'
  s.description    = 'Keeps the summary Siri and Shortcuts read (work miles today and this week) in the App Group.'
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
