import ExpoModulesCore
import Foundation
#if canImport(FoundationModels)
import FoundationModels
#endif

/** Options for one answer, as sent from JavaScript (modules/on-device-ai/index.ts). */
struct GenerateOptionsRecord: Record {
  @Field var temperature: Double = 0.3
  @Field var maximumResponseTokens: Int = 300
}

final class OnDeviceAIUnavailableException: Exception {
  override var reason: String {
    "Apple Intelligence's on-device model isn't available on this iPhone"
  }
}

final class OnDeviceAIGenerationException: GenericException<String> {
  override var reason: String {
    "The on-device model couldn't answer: \(param)"
  }
}

/**
 * Apple's on-device language model (Foundation Models, iOS 26 and Apple
 * Intelligence iPhones) for the weekly recap and Ask MileSprout. JavaScript
 * works out every figure and sends it in the instructions; the model only
 * puts them into words. Nothing leaves the iPhone.
 *
 * Built with an SDK without FoundationModels, or run on iOS before 26, every
 * call answers "unsupported" (or throws), and the app writes the recap from
 * a template instead.
 */
public class OnDeviceAIModule: Module {
  public func definition() -> ModuleDefinition {
    Name("OnDeviceAI")

    /** "available", "deviceNotEligible", "appleIntelligenceNotEnabled", "modelNotReady" or "unsupported". */
    Function("availability") { () -> String in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *) {
        return OnDeviceModel.availability()
      }
      #endif
      return "unsupported"
    }

    /** Whether the model can answer in a language ("fr", "pt-BR", "zh-Hans"). */
    Function("supportsLanguage") { (tag: String) -> Bool in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *) {
        return OnDeviceModel.supports(languageTag: tag)
      }
      #endif
      return false
    }

    /** One answer to `prompt`, with `instructions` (a fresh session each time: nothing is remembered). */
    AsyncFunction("generate") { (instructions: String, prompt: String, options: GenerateOptionsRecord) async throws -> String in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *) {
        return try await OnDeviceModel.generate(
          instructions: instructions,
          prompt: prompt,
          temperature: options.temperature,
          maximumResponseTokens: options.maximumResponseTokens
        )
      }
      #endif
      throw OnDeviceAIUnavailableException()
    }
  }
}

#if canImport(FoundationModels)
@available(iOS 26.0, *)
private enum OnDeviceModel {
  static func availability() -> String {
    let availability = SystemLanguageModel.default.availability
    if case .available = availability {
      return "available"
    }
    if case .unavailable(let reason) = availability {
      switch reason {
      case .deviceNotEligible:
        return "deviceNotEligible"
      case .appleIntelligenceNotEnabled:
        return "appleIntelligenceNotEnabled"
      case .modelNotReady:
        return "modelNotReady"
      @unknown default:
        return "unsupported"
      }
    }
    return "unsupported"
  }

  static func supports(languageTag: String) -> Bool {
    let wanted = Locale.Language(identifier: languageTag)
    guard let code = wanted.languageCode else {
      return false
    }
    return SystemLanguageModel.default.supportedLanguages.contains { language in
      guard language.languageCode == code else {
        return false
      }
      // "zh-Hans" isn't "zh-Hant"; a language listed without a script covers both.
      if let script = wanted.script, let theirs = language.script {
        return script == theirs
      }
      return true
    }
  }

  static func generate(
    instructions: String,
    prompt: String,
    temperature: Double,
    maximumResponseTokens: Int
  ) async throws -> String {
    guard case .available = SystemLanguageModel.default.availability else {
      throw OnDeviceAIUnavailableException()
    }
    let session = LanguageModelSession(instructions: instructions)
    let options = GenerationOptions(temperature: temperature, maximumResponseTokens: maximumResponseTokens)
    do {
      let response = try await session.respond(to: prompt, options: options)
      return response.content
    } catch {
      throw OnDeviceAIGenerationException(String(describing: error))
    }
  }
}
#endif
