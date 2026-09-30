import ExpoModulesCore
import MapKit

/**
 * Apple Maps on the device: address suggestions while typing (the same
 * completer the Maps app uses), turning a suggestion into coordinates, and
 * driving distances. No API key, and nothing leaves the phone except the
 * look-ups Apple Maps itself makes.
 */
public class AddressSearchModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AddressSearch")

    /**
     * Suggestions for what's typed so far: the as-you-type completer (which favours places
     * near the phone), plus, once there are a couple of words, a full Apple Maps search of the
     * whole phrase, so "The Forge, London" finds The Forge in London from anywhere.
     */
    AsyncFunction("suggest") { (query: String, latitude: Double?, longitude: Double?) async -> [[String: String]] in
      return await AddressCompleter.shared.suggest(query, latitude: latitude, longitude: longitude)
    }

    /** Coordinates for a suggestion (or any address), or null when Apple Maps can't place it. */
    AsyncFunction("resolve") { (title: String, subtitle: String) async -> [String: Double]? in
      return await AddressCompleter.shared.resolve(title: title, subtitle: subtitle)
    }

    /** Driving distance in metres along Apple Maps' suggested route, or null without a route. */
    AsyncFunction("drivingDistance") {
      (fromLatitude: Double, fromLongitude: Double, toLatitude: Double, toLongitude: Double) async -> Double? in
      return await AddressCompleter.shared.drivingDistance(
        from: CLLocationCoordinate2D(latitude: fromLatitude, longitude: fromLongitude),
        to: CLLocationCoordinate2D(latitude: toLatitude, longitude: toLongitude)
      )
    }
  }
}

@MainActor
final class AddressCompleter: NSObject, MKLocalSearchCompleterDelegate {
  static let shared = AddressCompleter()

  private let completer = MKLocalSearchCompleter()
  /** The caller waiting for the completer's next answer. */
  private var pending: CheckedContinuation<[[String: String]], Never>?
  /** The last suggestions shown, so picking one resolves exactly that result. */
  private var shown: [String: MKLocalSearchCompletion] = [:]

  override init() {
    super.init()
    completer.delegate = self
    completer.resultTypes = [.address, .pointOfInterest]
  }

  func suggest(_ query: String, latitude: Double?, longitude: Double?) async -> [[String: String]] {
    let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
    let wantsSearch = trimmed.contains(",") || trimmed.split(separator: " ").count >= 2
    let searching: Task<[[String: String]], Never>? = wantsSearch ? Task { await self.search(trimmed) } : nil
    let completed = await complete(query, latitude: latitude, longitude: longitude)
    let searched = await searching?.value ?? []
    // Full-search results first: they match the whole phrase, not just the end of it.
    return searched + completed
  }

  private func complete(_ query: String, latitude: Double?, longitude: Double?) async -> [[String: String]] {
    // A newer keystroke replaces the one still waiting.
    finish([])
    let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmed.count < 2 {
      completer.cancel()
      return []
    }
    if let latitude, let longitude {
      completer.region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: latitude, longitude: longitude),
        latitudinalMeters: 150_000,
        longitudinalMeters: 150_000
      )
    }
    return await withCheckedContinuation { continuation in
      pending = continuation
      if completer.queryFragment == trimmed {
        // Same text as last time: the completer won't call back again.
        deliver()
      } else {
        completer.queryFragment = trimmed
      }
    }
  }

  /** A full Apple Maps search: places with their coordinates, so choosing one needs no second look-up. */
  private func search(_ query: String) async -> [[String: String]] {
    let request = MKLocalSearch.Request()
    request.naturalLanguageQuery = query
    request.resultTypes = [.address, .pointOfInterest]
    guard let response = try? await MKLocalSearch(request: request).start() else { return [] }
    return response.mapItems.prefix(5).map { item -> [String: String] in
      let placemark = item.placemark
      let title = item.name ?? placemark.name ?? query
      let street = [placemark.subThoroughfare, placemark.thoroughfare].compactMap { $0 }.joined(separator: " ")
      let subtitle = [street, placemark.locality ?? "", placemark.postalCode ?? ""]
        .filter { !$0.isEmpty && $0 != title }
        .joined(separator: ", ")
      return [
        "title": title,
        "subtitle": subtitle,
        "latitude": String(placemark.coordinate.latitude),
        "longitude": String(placemark.coordinate.longitude),
      ]
    }
  }

  func resolve(title: String, subtitle: String) async -> [String: Double]? {
    let request: MKLocalSearch.Request
    if let completion = shown[key(title, subtitle)] {
      request = MKLocalSearch.Request(completion: completion)
    } else {
      request = MKLocalSearch.Request()
      request.naturalLanguageQuery = subtitle.isEmpty ? title : "\(title), \(subtitle)"
    }
    guard let response = try? await MKLocalSearch(request: request).start(),
      let item = response.mapItems.first
    else { return nil }
    let coordinate = item.placemark.coordinate
    return ["latitude": coordinate.latitude, "longitude": coordinate.longitude]
  }

  func drivingDistance(from: CLLocationCoordinate2D, to: CLLocationCoordinate2D) async -> Double? {
    let request = MKDirections.Request()
    request.source = MKMapItem(placemark: MKPlacemark(coordinate: from))
    request.destination = MKMapItem(placemark: MKPlacemark(coordinate: to))
    request.transportType = .automobile
    guard let response = try? await MKDirections(request: request).calculate(),
      let route = response.routes.first
    else { return nil }
    return route.distance
  }

  nonisolated func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
    MainActor.assumeIsolated { self.deliver() }
  }

  nonisolated func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
    MainActor.assumeIsolated { self.finish([]) }
  }

  private func deliver() {
    guard pending != nil else { return }
    let results = Array(completer.results.prefix(8))
    shown = Dictionary(results.map { (key($0.title, $0.subtitle), $0) }, uniquingKeysWith: { first, _ in first })
    finish(results.map { ["title": $0.title, "subtitle": $0.subtitle] })
  }

  private func finish(_ results: [[String: String]]) {
    let continuation = pending
    pending = nil
    continuation?.resume(returning: results)
  }

  private func key(_ title: String, _ subtitle: String) -> String {
    return "\(title)\n\(subtitle)"
  }
}
