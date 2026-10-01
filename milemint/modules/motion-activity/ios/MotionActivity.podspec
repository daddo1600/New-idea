Pod::Spec.new do |s|
  s.name           = 'MotionActivity'
  s.version        = '1.0.0'
  s.summary        = 'Reads iOS motion activity (driving, walking, cycling) to check detected drives.'
  s.description    = 'Reads iOS motion activity (driving, walking, cycling) to check detected drives.'
  s.author         = 'MileMint'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.frameworks     = 'CoreMotion'
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
