# Founding testers: story, offer and posts

Goal: about 50–100 working drivers testing MileSprout on real shifts before the App Store launch, recruited from courier, delivery, ride-hail and self-employed groups.

Sign-up page: **https://milesprout.app/testers?g=GROUPNAME** (change `GROUPNAME` for each group, e.g. `fb-leeds-couriers`, `wa-deliveroo-riders`, `reddit-ukpf`). The `g` tag is saved with each sign-up, so you can see which group works best.

---

## The story (founder voice, keep it real)

> I built MileSprout because tracking mileage for tax is a pain, and most of us give up halfway through the year. Then January comes and we're guessing, or we pay for an app that wants an account, sells our data, or charges for the basics.
>
> MileSprout logs your drives by itself. You tap Work or Personal, and it works out what your work miles are worth at the tax office's rate. No account, no adverts, and your trips stay on your phone.
>
> It's nearly ready, and I want it tested by the people it's for: drivers doing real shifts. Not friends being nice. I need you to try to break it.

## The offer: Founding testers

**You get:**
- Early access now, on your iPhone (through Apple's TestFlight app).
- **12 months of MileSprout Pro free** when it launches: reports, exports, quarterly figures and the rest.
- The **Founding driver** badge in the app.
- A direct line to me. Tell me what's annoying and I'll fix it.

**I ask:**
- Use it on your normal shifts for **2 weeks**.
- When something's wrong, **screenshot it** and send it (TestFlight has a button for this).
- One short check-in at the end: 5 questions, 2 minutes.

**Who it's for:** iPhone users who drive for work in the UK. Food or parcel delivery, private hire, care visits, trades: anyone who uses their own car, van, moped or bike for work. **Places are limited** (first 100).

> Note for the founder: "12 months of Pro free" means creating Apple **offer codes** for the Pro subscription in App Store Connect before launch, then emailing each tester a code. Don't promise "free for life" unless you're sure you can deliver it.

---

## Posts

### Ask the group admin first (DM)

> Hi [name], I'm Travis, a UK founder building a free mileage tracker for couriers and drivers. Before launch I'm looking for about 20 drivers from groups like yours to test it on real shifts and tell me what's wrong. Testers get a year of the paid version free. Would you be OK with me posting once in the group? Happy to follow any rules you have. Thanks!

### Facebook / WhatsApp group post (short)

> **Looking for 20 drivers to test a free mileage app 🚗🛵**
>
> I'm building MileSprout: it logs your work drives by itself, you tap Work or Personal, and it shows what they're worth at tax time. No account, no ads, your trips stay on your phone.
>
> Before it goes in the App Store I want real drivers to try it on real shifts for 2 weeks and tell me what breaks.
>
> Testers get **12 months of Pro free** at launch + a Founding driver badge.
>
> iPhone only for now. Sign up here 👉 milesprout.app/testers?g=GROUPNAME
>
> (Full disclosure: I'm the founder. Happy to answer questions in the comments.)

### WhatsApp (one-to-one, people you know)

> Hey! I've built an app for drivers that tracks your work miles automatically for tax. Would you test it on your shifts for 2 weeks? You'd get a year of the paid version free when it launches. Takes 1 minute to sign up: milesprout.app/testers?g=wa-friends

### Reddit (only where self-promotion is allowed, e.g. a weekly promo thread)

> **[Beta testers wanted] Free automatic mileage tracker for UK couriers and self-employed drivers (iPhone)**
>
> I'm the founder. MileSprout logs drives on its own, you sort each one Work or Personal, and it works out the mileage claim at HMRC rates. Everything stays on your phone: no account, no data sold.
>
> I'm looking for drivers to test it on real shifts for two weeks before launch. Testers get 12 months of Pro free. Sign-up: milesprout.app/testers?g=reddit-SUBNAME
>
> Happy to answer questions, and I'd welcome criticism.

---

## After someone signs up

1. Export the list (Cloudflare → D1 → `SELECT * FROM waitlist WHERE source LIKE 'testers%' ORDER BY created_at;`).
2. Add their email as a TestFlight tester (or send the public TestFlight link). Raise the public link's tester limit in App Store Connect first (it was set to 10).
3. Send the welcome message:

> Thanks for testing MileSprout! 🌱
> 1. Install **TestFlight** from the App Store.
> 2. Tap this link on your iPhone: [TestFlight link]
> 3. Open MileSprout and allow location **"Always"**, so drives log when the app is closed.
> 4. Drive as normal. If anything looks wrong, take a screenshot: TestFlight will offer to send it to me.
> In 2 weeks I'll send 5 quick questions. Thank you, it really helps.

## Rules to keep it above board
- Always say you're the founder.
- Follow each group's rules; ask the admin first.
- Only email people who ticked the box, and only about testing and the launch.
- Don't promise anything you can't deliver (the 12 months of Pro needs offer codes set up).
