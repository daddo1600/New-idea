Pod::Spec.new do |s|
  s.name           = 'TextScan'
  s.version        = '1.0.0'
  s.summary        = 'Reads the text in a picked image on the device (Apple Vision).'
  s.description    = 'Reads the text in a picked image on the device with Apple Vision, for earnings screenshots. Nothing leaves the phone.'
  s.author         = 'MileMint'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.frameworks     = 'Vision', 'ImageIO'
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
