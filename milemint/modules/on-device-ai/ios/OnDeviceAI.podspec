Pod::Spec.new do |s|
  s.name           = 'OnDeviceAI'
  s.version        = '1.0.0'
  s.summary        = 'Apple Intelligence on-device model (Foundation Models) for the weekly recap and Ask MileSprout.'
  s.description    = 'Apple Intelligence on-device model (Foundation Models) for the weekly recap and Ask MileSprout.'
  s.author         = 'MileMint'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  # FoundationModels is iOS 26+: weak-linked so the app still opens on older iOS,
  # where every call is behind #available and answers "unsupported".
  s.weak_frameworks = 'FoundationModels'
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
