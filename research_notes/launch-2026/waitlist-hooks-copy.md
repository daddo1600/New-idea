# Waitlist hooks: copy for the five approved additions

*Drafted 3 Oct 2026 by the marketing agent, for the coding agent to drop into `website/index.html`. Drafts only: nothing has been edited, committed or posted.*

**Placeholders.** The research agent is still checking the rates and the offer-code rules, so this file has no figures in it. These placeholders get filled in later:
- `{rate}`, `{amount}`, `{distance}` and `{unit}` (miles or km);
- `{country tax office}` (HMRC, the IRS, the CRA, the ATO) and `{tax year}`;
- `{weeks}` (the weeks worked a year that the calculator assumes) and `{date}`.

**One wording rule for all five.** The figures are what the work miles are **worth at the tax office's rate**. They are not "money back" and not "tax saved". The tax actually saved is smaller, because it depends on the driver's tax band. So we say "worth" everywhere, and never "you'll get £X back".

---

## 1. "What are your work miles worth?" calculator

**Where it goes:** as the **top half of the sign-up section** (`.signup`). Put it above `h2#early-access` and let that heading follow straight after the result. We don't recommend a separate section before the form: on a phone, a gap between the result and the email box loses the moment. As the top half, the result sits right above "Your email".

**Final copy**

| Element | Copy |
|---|---|
| Heading | **What are your work miles worth?** |
| Country line | Rates for **{country}** · <u>Change</u> |
| Slider label | Work miles a week *(Canada and Australia: "Work km a week")* |
| Value shown by the slider | **{distance}** {unit} a week |
| Result line | That's about **{amount} a year** at {country tax office}'s rate. |
| Rate note (small) | {country tax office} rate for {tax year}: {rate} a {unit}. Based on {weeks} working weeks. A guide, not tax advice. <a>Source</a> |
| Link into the form | **Log every one of them. Get early access ↓** (moves focus to the email field) |

**Accessible name and behaviour**
- Slider: `aria-label="Work {unit} you drive in a typical week"`, with `aria-valuetext="{distance} {unit} a week"`.
- Country control: a `<select>` labelled "Country for the tax rate".
- Result: put it in a `role="status"` / `aria-live="polite"` region, updated only when the slider stops moving (otherwise it reads out every step). Read it as "About {amount} a year at {country tax office}'s rate".
- Group: `<section aria-labelledby="calc-title">`.

**Notes for the builder**
- The UK rate drops after the first 10,000 miles, and Australia's cents-per-km method has a 5,000 km cap. The sum has to follow both, so the research agent should hand over each country's rules as well as its `{rate}`.
- Picking a country here should also pre-select the matching Country chip in the form below. It's one fewer tap.
- Set the country from the browser's language or region and the currency from the country. The visitor can change both.

**Alternative heading:** *What could you be missing?* This only works with the result line above. It hints at an unclaimed amount without stating a figure.

**Why it lifts sign-ups:** the visitor sees their own number in pounds or dollars just before the email box, and that is the strongest reason to join.

---

## 2. Waitlist reward: 3 months of Pro free at launch

**Where it goes:** the offer line sits directly above the email field, under the "Get early access" heading, and replaces the current `.signup-sub`. The small print goes under the consent checkbox in the `.fine` style.

**Final copy**

- **Offer line:** Join the list and get **3 months of Pro free** at launch.
- **Small print:** *Pro is a subscription. At launch we'll email you an App Store offer code for 3 months of Pro free, for people who join by {date}. One code per Apple Account, for new Pro subscribers only. It can't be added to another offer, such as a free trial. After the 3 months, Pro renews at the price shown in the App Store unless you cancel in your Apple Account settings at least 24 hours before. Free logging stays free either way.*
- **Confirmation message** (replaces the current `.wl-done`): **You're on the list.** We'll email you once, at launch, with your code for 3 months of Pro free.
- **The current `.signup-sub` line ("One email at launch…")** is replaced by the offer line. "One email" now goes in the micro-copy (item 4).
- **Closing CTA paragraph:** Leave your email and we'll send your 3 months of Pro free the day MileSprout is in the App Store. No spam, and we never share it.
- **Founding testers page** (`testers.html`). The line **should differ**, because testers already get 12 months. Add under the tester reward list: *On the early-access list too? As a tester you get 12 months of Pro instead of 3. One code each, not both.*

**Alternative offer line:** Early access comes with **3 months of Pro, on us**, at launch.

**Why it lifts sign-ups:** it turns "tell me when it's out" into "get something for joining now". The small print tells the visitor straight away that it's a subscription, so nobody feels tricked at launch.

> Held until research confirms: (a) that Apple allows a free offer-code period of this length for this subscription; (b) the "{date}" cut-off; (c) consumer-law wording on auto-renewal for the UK, US (state auto-renewal laws), Canada and Australia. If (a) fails, nothing about the offer goes live.

---

## 3. The money line near the top

**Where it goes:** a single line **directly under the `h1`**, above the lede, in the hero. On phones the phone image comes first, so this line opens the text that follows it. The heading "Every work mile adds up." gets its answer at once. Don't put it in the pill: the pill is for launch date and countries.

**(a) If research backs an "unclaimed" figure**
- **Final:** Drivers without a log leave about **{amount} a year** unclaimed.<sup>1</sup>
- **Footnote (by the country notes, or under the hero `.note`):** <sup>1</sup> {source}, {date checked}. A typical year of work driving at {country tax office}'s rate.
- **Alternative:** Without a log, a typical year of work driving, about **{amount}**, can go unclaimed.

**(b) Safe version**
- **Final:** A typical year of work driving is worth **{amount}** at {country tax office}'s rate.
- **Alternative:** **{amount}**: what a typical year of work driving is worth at {country tax office}'s rate.

Both versions follow the visitor's country, as the calculator does. Without JavaScript, show the UK version.

**Why it lifts sign-ups:** it puts the money at the top of the page, before anyone scrolls, and the calculator lower down lets them check it against their own driving.

---

## 4. Trust reasons beside the email box

**Where it goes:** directly under the "Get early access" button row (`.wl-row`), above the chips.

**Final copy (three short ticks in one line; they wrap to two lines on a phone):**
> ✓ No account  ✓ No ads  ✓ Your trips stay on your phone

**Micro-copy under the button:**
> One email at launch, with your Pro code. Never shared. Unsubscribe any time.

Then shorten the consent label so it doesn't repeat this: *"Email me when MileSprout launches. [How we use your email]"*.

**Alternative (one line):** No account. No ads. Your trips stay on your phone, and your email is never shared.

**A wording note.** We wrote "stay on your phone", not "never leave your phone". Backups can go to the user's own iCloud (encrypted first), so "never leave" wouldn't be strictly true. The ticks are about the app. The email is the one thing we do keep, which is why the micro-copy deals with it honestly.

**Why it lifts sign-ups:** it answers "what's the catch?" right where people hesitate, at the email box.

---

## 5. The 10-second clip (park → drive appears → swipe to Work → money ticks up)

**Where it goes:** **inside the hero phone** (`#hero-phone`), in place of the still home screen:
- Use `home.webp` as its poster, so nothing changes for page speed or for people who prefer reduced motion. Those people see the poster and a play button.
- On phones the phone comes first, so this is the first thing people see. It shows the whole promise before a word is read.
- It loops muted, with a visible **Pause** button, because it runs longer than 5 seconds (WCAG 2.2.2).

**Caption (shown under the phone, small):**
> Park. The drive is already there. Swipe it to Work, and watch it add up.

**Accessible description** (in a visually hidden paragraph linked with `aria-describedby`; the video gets `aria-label="MileSprout in 10 seconds"`):
> A 10-second clip with no sound. A car parks. A moment later, a new drive of {distance} appears in MileSprout by itself. A thumb swipes it to Work, and the total for this tax year goes up by {amount}.

**Alternative placement:** the first card of the screens deck (#how), with the same caption as its feature text. Use this if the hero clip hurts load time on mobile data.

**Alternative caption:** You park. MileSprout has the drive. One swipe, and it's money on your total.

**Why it lifts sign-ups:** "logs itself" is hard to believe until you see it, and ten seconds of seeing it does more than a paragraph of telling.

---

## Seen in passing (not part of this brief)

The page itself still says "tracker" and "tracking" in places:
- `<title>`, the meta description and the `og:` description;
- the alt text of the Privacy deck slide ("The tracking set-up screen…").

Our voice rule says never "tracking". Possible swaps: "mileage log" and "logging set-up screen". This is for the founder to decide, because the word may have been kept on purpose for search.
