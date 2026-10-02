Pod::Spec.new do |s|
  s.name           = 'ShiftActivity'
  s.version        = '1.0.0'
  s.summary        = 'Starts, updates and ends the shift Live Activity (lock screen and Dynamic Island).'
  s.description    = 'Starts, updates and ends the shift Live Activity (lock screen and Dynamic Island).'
  s.author         = 'MileMint'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.weak_frameworks = 'ActivityKit'
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
