Pod::Spec.new do |s|
  s.name           = 'AddressSearch'
  s.version        = '1.0.0'
  s.summary        = 'Address suggestions, look-ups and driving distances from Apple Maps (MapKit).'
  s.description    = 'Address suggestions, look-ups and driving distances from Apple Maps (MapKit).'
  s.author         = 'MileMint'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.frameworks     = 'MapKit'

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
