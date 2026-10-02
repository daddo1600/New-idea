import ActivityKit
import AppIntents
import SwiftUI
import WidgetKit

/*
 * The shift on the lock screen and in the Dynamic Island, while a shift is
 * on: "Shift on · 2:14:05 · 38.2 mi · £20.90". Every word and figure comes
 * from the app ready to show (translated, in the user's currency and unit:
 * src/live-activity/model.ts); this file only lays them out. The elapsed
 * time is a system timer, so it keeps counting without updates from the app.
 *
 * iOS 16.2+ shows the card; iOS 17+ adds the End shift and Not working
 * buttons (App Intents, see _shared/ShiftActivityIntents.swift).
 */

@main
struct ShiftActivityBundle: WidgetBundle {
  var body: some Widget {
    ShiftLiveActivity()
  }
}

extension Color {
  /** MileSprout's deep green (#064E3B), the card's background. */
  static let sproutDeep = Color(red: 6 / 255, green: 78 / 255, blue: 59 / 255)
  /** The brand green (#0B7A55), the top of the gradient. */
  static let sproutGreen = Color(red: 11 / 255, green: 122 / 255, blue: 85 / 255)
  /** Gold (#FACC15): the money, and the car on the mark. */
  static let sproutGold = Color(red: 250 / 255, green: 204 / 255, blue: 21 / 255)
  /** Mint (#A7F3D0): labels on the green. */
  static let sproutMint = Color(red: 167 / 255, green: 243 / 255, blue: 208 / 255)
}

/** Tapping the card (not a button) opens the app on Home. */
private let appURL = URL(string: "milemint://")

/** A shift can't run past 16 hours: the timer's range ends there. */
private let maxShiftSeconds: TimeInterval = 16 * 60 * 60

@available(iOS 16.2, *)
struct ShiftLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: ShiftActivityAttributes.self) { context in
      ShiftLockScreenView(state: context.state)
        .activityBackgroundTint(Color.sproutDeep)
        .activitySystemActionForegroundColor(Color.white)
        .widgetURL(appURL)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          HStack(spacing: 6) {
            SproutMark(size: 22)
            Text(context.state.title)
              .font(.subheadline.weight(.bold))
              .foregroundColor(.sproutMint)
              .lineLimit(1)
          }
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text(context.state.money)
            .font(.title3.weight(.heavy))
            .foregroundColor(.sproutGold)
            .lineLimit(1)
            .minimumScaleFactor(0.6)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
              ElapsedText(state: context.state)
              Text("·").foregroundColor(.white.opacity(0.5))
              Text(context.state.distance).lineLimit(1)
            }
            .font(.headline)
            .foregroundColor(.white)
            StatusLine(state: context.state)
            ShiftButtons(state: context.state)
          }
          .frame(maxWidth: .infinity, alignment: .leading)
        }
      } compactLeading: {
        Text(context.state.distance)
          .font(.caption.weight(.semibold))
          .foregroundColor(.sproutMint)
          .lineLimit(1)
      } compactTrailing: {
        Text(context.state.money)
          .font(.caption.weight(.bold))
          .foregroundColor(.sproutGold)
          .lineLimit(1)
      } minimal: {
        SproutMark(size: 18)
      }
      .widgetURL(appURL)
      .keylineTint(Color.sproutGold)
    }
  }
}

/** The card on the lock screen (and on iPhones without a Dynamic Island, as a banner). */
@available(iOS 16.2, *)
struct ShiftLockScreenView: View {
  let state: ShiftActivityAttributes.ContentState

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack(alignment: .center, spacing: 10) {
        SproutMark(size: 30)
        VStack(alignment: .leading, spacing: 2) {
          Text(state.title)
            .font(.subheadline.weight(.bold))
            .foregroundColor(.sproutMint)
            .lineLimit(1)
          HStack(spacing: 6) {
            ElapsedText(state: state)
            Text("·").foregroundColor(.white.opacity(0.5))
            Text(state.distance).lineLimit(1)
          }
          .font(.title3.weight(.bold))
          .foregroundColor(.white)
        }
        Spacer(minLength: 8)
        Text(state.money)
          .font(.system(size: 28, weight: .heavy, design: .rounded))
          .foregroundColor(.sproutGold)
          .lineLimit(1)
          .minimumScaleFactor(0.6)
      }
      StatusLine(state: state)
      ShiftButtons(state: state)
    }
    .padding(16)
    .background(
      LinearGradient(
        colors: [Color.sproutGreen, Color.sproutDeep],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )
    )
  }
}

/** Time on shift: a live timer while it runs, the final "6h 12m" once it has ended. */
@available(iOS 16.2, *)
struct ElapsedText: View {
  let state: ShiftActivityAttributes.ContentState

  var body: some View {
    if state.ended {
      Text(state.elapsed).lineLimit(1)
    } else {
      let start = Date(timeIntervalSince1970: state.startedAt)
      Text(timerInterval: start...start.addingTimeInterval(maxShiftSeconds), countsDown: false)
        .monospacedDigit()
        .lineLimit(1)
        // A timer reserves room for its longest value; keep it from pushing the distance away.
        .frame(maxWidth: 86, alignment: .leading)
    }
  }
}

/** "Waiting for your next drive", "Driving · 3.1 mi", "Paused", or the summary once ended. */
@available(iOS 16.2, *)
struct StatusLine: View {
  let state: ShiftActivityAttributes.ContentState

  var body: some View {
    HStack(spacing: 6) {
      Circle()
        .fill(state.driving ? Color.sproutGold : Color.sproutMint.opacity(0.7))
        .frame(width: 7, height: 7)
      Text(state.status)
        .font(.footnote.weight(.medium))
        .foregroundColor(.white.opacity(0.85))
        .lineLimit(1)
    }
  }
}

/** End shift, and Not working while a drive is being recorded. iOS 17+; nothing on older iOS. */
@available(iOS 16.2, *)
struct ShiftButtons: View {
  let state: ShiftActivityAttributes.ContentState

  var body: some View {
    if #available(iOS 17.0, *) {
      if !state.ended {
        HStack(spacing: 8) {
          Button(intent: EndShiftIntent()) {
            Pill(text: state.endLabel, fill: Color.sproutGold, ink: Color.sproutDeep)
          }
          .buttonStyle(.plain)
          if state.driving {
            Button(intent: NotWorkingIntent()) {
              Pill(text: state.notWorkingLabel, fill: Color.white.opacity(0.16), ink: Color.white)
            }
            .buttonStyle(.plain)
          }
        }
      }
    }
  }
}

struct Pill: View {
  let text: String
  let fill: Color
  let ink: Color

  var body: some View {
    Text(text)
      .font(.subheadline.weight(.bold))
      .foregroundColor(ink)
      .lineLimit(1)
      .padding(.horizontal, 14)
      .padding(.vertical, 8)
      .frame(maxWidth: .infinity)
      .background(Capsule().fill(fill))
  }
}

/** The sprout mark (Assets: "sprout", from sprout.png). */
struct SproutMark: View {
  let size: CGFloat

  var body: some View {
    Image("sprout")
      .resizable()
      .scaledToFit()
      .frame(width: size, height: size)
      .accessibilityHidden(true)
  }
}
