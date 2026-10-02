import ExpoModulesCore
import ImageIO
import Vision

/**
 * Reads the text in an image on the iPhone with Apple's Vision framework
 * (the same text recognition as Live Text), for earnings screenshots. The
 * image and its text never leave the phone.
 */
public class TextScanModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TextScan")

    /**
     * The text in the image at `uri` (a file:// URI, as the image picker
     * gives), as lines from top to bottom. Words side by side on one row
     * ("Total earnings" and "£412.35") come back as one line, left to right.
     */
    AsyncFunction("recognizeText") { (uri: String) async throws -> [String] in
      let url = try fileURL(uri)
      return try await withCheckedThrowingContinuation { continuation in
        DispatchQueue.global(qos: .userInitiated).async {
          do {
            continuation.resume(returning: try TextScanner.lines(in: url))
          } catch {
            continuation.resume(throwing: error)
          }
        }
      }
    }
  }
}

/** An error JavaScript sees with this `code` (see modules/text-scan/index.ts). */
private func failure(_ code: String, _ description: String) -> Exception {
  return Exception(name: code, description: description, code: code)
}

private func fileURL(_ uri: String) throws -> URL {
  if let url = URL(string: uri), url.isFileURL { return url }
  if uri.hasPrefix("/") { return URL(fileURLWithPath: uri) }
  throw failure("ERR_TEXT_SCAN_IMAGE", "Only images on this iPhone can be read.")
}

enum TextScanner {
  /** Longest side the image is read at: plenty for a phone screenshot, and a large photo doesn't use up memory. */
  private static let maxPixels = 4096

  static func lines(in url: URL) throws -> [String] {
    guard
      let source = CGImageSourceCreateWithURL(url as CFURL, nil),
      let image = CGImageSourceCreateThumbnailAtIndex(
        source,
        0,
        [
          kCGImageSourceCreateThumbnailFromImageAlways: true,
          // Turned the right way up, so lines read top to bottom.
          kCGImageSourceCreateThumbnailWithTransform: true,
          kCGImageSourceThumbnailMaxPixelSize: maxPixels,
        ] as CFDictionary
      )
    else {
      throw failure("ERR_TEXT_SCAN_IMAGE", "The image couldn't be opened.")
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    let handler = VNImageRequestHandler(cgImage: image, orientation: .up, options: [:])
    do {
      try handler.perform([request])
    } catch {
      throw failure("ERR_TEXT_SCAN_FAILED", "The text couldn't be read: \(error.localizedDescription)")
    }
    let found: [(text: String, box: CGRect)] = (request.results ?? []).compactMap { observation in
      guard let text = observation.topCandidates(1).first?.string else { return nil }
      return (text, observation.boundingBox)
    }
    return rows(found)
  }

  /**
   * Pieces of text grouped into rows: Vision's boxes are in 0…1 with the
   * origin at the bottom left, so the top of the image is the highest y.
   * A piece joins a row when its middle is within half a line of the row's.
   */
  private static func rows(_ pieces: [(text: String, box: CGRect)]) -> [String] {
    let sorted = pieces.sorted { $0.box.midY > $1.box.midY }
    var rows: [[(text: String, box: CGRect)]] = []
    for piece in sorted {
      if let last = rows.last, let first = last.first {
        let height = min(first.box.height, piece.box.height)
        if abs(first.box.midY - piece.box.midY) < height / 2 {
          rows[rows.count - 1].append(piece)
          continue
        }
      }
      rows.append([piece])
    }
    return rows.map { row in
      row.sorted { $0.box.minX < $1.box.minX }.map { $0.text }.joined(separator: "  ")
    }
  }
}
