# Hindi (hi): cultural and UX-copy review (check 3 of 3)

**Scope.** I read all 662 entries in `src/i18n/locales/hi.ts` against the English, the brief, the translator notes, the glossary and the accuracy review. Where a line's meaning depended on where it's shown, I checked the code: `domain/reminders.ts`, `domain/seasons.ts`, `milestones/copy.ts`, `app/welcome.tsx`, `app/milestones.tsx`, `components/header-menu.tsx`, `app/index.tsx`, `app/region.tsx` and `app/_layout.tsx`. I checked each line for offence, tone, money and tax honesty, units, UI fit and naturalness for a Hindi-speaking courier in London or Toronto.

**Result.** I changed 51 lines. Keys, placeholders, `<b>` tags and plural objects are unchanged, and `npx jest src/i18n` passes (31/31). I also updated `glossary/hi.md` (deduction is now टैक्स कटौती; I added the new terms and the gender-neutral rule).

## Main themes

1. **Units.** Eight lines that are shown in every country still said मील. These were the welcome tagline and headline, the season greetings shown in Canada and Australia, the money and achievement share texts, and the Missed miles menu title. They now say ट्रिप or दूरी. Lines that come in a miles/km pair keep their own unit.
2. **Money honesty.** पैसे वापस, वापस आपकी जेब में and मुफ़्त पैसे read as a cash refund or a scam hook. They're replaced with कीमत, मिली रकम and पड़ाव (milestone).
3. **Gender.** About 25 lines used masculine verb forms for the user (करते हैं, सकते हैं, चला रहे हैं, गए). They're reworded with passive, impersonal or noun constructions.
4. **Migration sensitivity.** For a diaspora reader, आपका देश and आपके देश की करेंसी mean India and rupees. The country screen now says देश चुनें and चुने गए देश. No line asks where the user is “from”.
5. **Tone.** शरारती (it can sound flirtatious) became मज़ेदार. The sale-like आखिरी मौका became आखिरी रिमाइंडर, and the bossy-sounding winter line became a warm wish.

## Changes

| English | Before | After | Why |
|---|---|---|---|
| {{achievement}} on MileMint {{emoji}} The mileage app that counts every mile. | MileMint पर {{achievement}} {{emoji}} वो माइलेज ऐप जो हर मील गिनता है। | MileMint पर {{achievement}} {{emoji}} वो माइलेज ऐप जिसमें एक भी ट्रिप नहीं छूटती। | Units: share text is sent from every country, so no मील. |
| I’ve found {{amount}} in business mileage with MileMint 🚗💸 Every mile counted, automatically. | MileMint से मुझे {{amount}} का बिज़नेस माइलेज मिला 🚗💸 हर मील की गिनती, अपने-आप। | MileMint से मुझे {{amount}} का बिज़नेस माइलेज मिला 🚗💸 हर ट्रिप की गिनती, अपने-आप। | Units: money-milestone share, used in km countries too. |
| Every business mile, counted. | हर बिज़नेस मील की गिनती। | हर बिज़नेस ट्रिप की गिनती। | Units: welcome headline shown before/regardless of country. |
| Never miss a mile. | एक भी मील न छूटे। | एक भी ट्रिप न छूटे। | Units: welcome tagline shown in every country. |
| Missed miles check | छूटे मीलों की जाँच | छूटी दूरी की जाँच | Units: menu/screen title shown in every country. |
| Autumn miles add up 🍂 | पतझड़ में भी मील जुड़ते जाते हैं 🍂 | पतझड़ में भी ट्रिप जुड़ती जाती हैं 🍂 | Units: Autumn greeting is shown in Australia (km). |
| Fall miles add up 🍂 | पतझड़ में भी मील जुड़ते जाते हैं 🍂 | पतझड़ में भी ट्रिप जुड़ती जाती हैं 🍂 | Units: Fall greeting is shown in Canada (km). |
| Sunny days, business miles ☀️ | धूप भरे दिन, बिज़नेस मील ☀️ | धूप भरे दिन, बिज़नेस ट्रिप ☀️ | Units: summer greeting is shown in Canada (km). |
| {{amount}} back in your pocket | {{amount}} वापस आपकी जेब में | {{amount}} का पड़ाव पार! | Money honesty: 'वापस आपकी जेब में' reads as cash/refund in hand. Now a neutral milestone cheer (पड़ाव = milestone). |
| Money back | पैसे वापस | मिली रकम | Money honesty: 'पैसे वापस' reads like a refund. Now 'amount found', matching 'अब तक आपके लिए मिला' on the same screen. |
| Your money back and badges | आपके पैसे वापस और बैज | मिली रकम और बैज | Money honesty: same as 'Money back'. |
| Free money alert 💸 | मुफ़्त पैसे का अलर्ट 💸 | आपके पैसों की बात 💸 | Money honesty: 'मुफ़्त पैसे' is the classic scam/'पैसा कमाओ' hook and also implies undeserved money. Body already says it is the user's own money. |
| Well, technically it’s your money. Sort this week’s drives to claim it back. | वैसे देखा जाए तो पैसा आपका ही है। इस हफ़्ते की ट्रिप सॉर्ट करें और उसे वापस क्लेम करें। | वैसे देखा जाए तो पैसा आपका ही है। इस हफ़्ते की ट्रिप सॉर्ट करें और उसे क्लेम करें। | Money honesty: dropped 'वापस' so claiming does not sound like a guaranteed refund. |
| Swipe this week’s trips business or personal and see what you’ve earned back. | इस हफ़्ते की ट्रिप बिज़नेस या पर्सनल में स्वाइप करें और देखें कितना वापस बना। | इस हफ़्ते की ट्रिप बिज़नेस या पर्सनल में स्वाइप करें और देखें उनकी कितनी कीमत बनी। | Money honesty: 'कितना वापस बना' implied money returned; now uses the glossary's कीमत (value). |
| Sort your drives and add any you missed before {{date}}. Every business kilometre is money back. | {{date}} से पहले अपनी ट्रिप सॉर्ट करें और जो छूट गई हों उन्हें जोड़ें। हर बिज़नेस किलोमीटर का मतलब है पैसे वापस। | {{date}} से पहले अपनी ट्रिप सॉर्ट करें और जो छूट गई हों उन्हें जोड़ें। हर बिज़नेस किलोमीटर की अपनी कीमत है। | Money honesty: 'मतलब है पैसे वापस' promised a refund per km. |
| Sort your drives and add any you missed before {{date}}. Every business mile is money back. | {{date}} से पहले अपनी ट्रिप सॉर्ट करें और जो छूट गई हों उन्हें जोड़ें। हर बिज़नेस मील का मतलब है पैसे वापस। | {{date}} से पहले अपनी ट्रिप सॉर्ट करें और जो छूट गई हों उन्हें जोड़ें। हर बिज़नेस मील की अपनी कीमत है। | Money honesty: same as km line. |
| Low effort, high reward | मेहनत कम, फ़ायदा ज़्यादा | थोड़ी-सी मेहनत, बड़ा आराम | Money/tone: 'मेहनत कम, फ़ायदा ज़्यादा' sounds like a get-rich ad slogan. New line pairs with the body (a few swipes beat a shoebox of receipts). |
| Last call: make sure every business drive is in MileMint before {{date}}. | आखिरी मौका: {{date}} से पहले पक्का करें कि हर बिज़नेस ट्रिप MileMint में है। | आखिरी रिमाइंडर: {{date}} से पहले पक्का करें कि हर बिज़नेस ट्रिप MileMint में है। | Tone: 'आखिरी मौका' is sale/offer language; this is a deadline reminder. |
| A (slightly cheeky) nudge on Sunday evening to sort the week’s drives. | रविवार शाम को एक (थोड़ा शरारती) रिमाइंडर, ताकि आप हफ़्ते की ट्रिप सॉर्ट कर लें। | रविवार शाम को एक (थोड़ा मज़ेदार) रिमाइंडर, ताकि आप हफ़्ते की ट्रिप सॉर्ट कर लें। | Sensitivity: शरारती (naughty) can carry a flirtatious shade addressed to an adult; मज़ेदार keeps the playfulness. |
| A quick (slightly cheeky) reminder each Sunday evening to sort the week’s drives, so nothing goes unclaimed. | हर रविवार शाम हफ़्ते की ट्रिप सॉर्ट करने का एक छोटा (थोड़ा शरारती) रिमाइंडर, ताकि कुछ भी क्लेम होने से न छूटे। | हर रविवार शाम हफ़्ते की ट्रिप सॉर्ट करने का एक छोटा (थोड़ा मज़ेदार) रिमाइंडर, ताकि कुछ भी क्लेम होने से न छूटे। | Sensitivity: same as above. |
| Future you says thanks 🙌 | आगे चलकर आप खुद को शुक्रिया कहेंगे 🙌 | आने वाले कल की ओर से शुक्रिया 🙌 | Gender: 'आप खुद को शुक्रिया कहेंगे' is masculine. Neutral, and keeps the 'future thanks you' joke. |
| Wrap up warm out there ❄️ | बाहर ठंड है, गरम कपड़े पहनें ❄️ | बाहर ठंड है, अपना ध्यान रखें ❄️ | Tone: 'गरम कपड़े पहनें' read as an instruction; 'अपना ध्यान रखें' is the warm everyday wish. |
| 🔒 GPS runs only while you’re driving. Trips stay on your iPhone, never on our servers. | 🔒 GPS सिर्फ़ तभी चलता है जब आप ड्राइव कर रहे हों। ट्रिप आपके iPhone पर ही रहती हैं, हमारे सर्वर पर कभी नहीं। | 🔒 GPS सिर्फ़ ड्राइविंग के दौरान चलता है। ट्रिप आपके iPhone पर ही रहती हैं, हमारे सर्वर पर कभी नहीं। | Gender: 'कर रहे हों' is masculine. |
| A quick Sunday reminder to sort your week. Turn it off any time in Settings. | हफ़्ता सॉर्ट करने के लिए रविवार को एक छोटा रिमाइंडर। इसे कभी भी सेटिंग्ज़ में बंद कर सकते हैं। | हफ़्ता सॉर्ट करने के लिए रविवार को एक छोटा रिमाइंडर। इसे कभी भी सेटिंग्ज़ में बंद किया जा सकता है। | Gender: 'कर सकते हैं' is masculine. |
| Automatic tracking runs on your iPhone. You can still add trips by hand here. | ऑटोमैटिक ट्रैकिंग आपके iPhone पर चलती है। आप यहाँ फिर भी हाथ से ट्रिप जोड़ सकते हैं। | ऑटोमैटिक ट्रैकिंग आपके iPhone पर चलती है। यहाँ फिर भी हाथ से ट्रिप जोड़ी जा सकती हैं। | Gender: 'जोड़ सकते हैं' is masculine. |
| BAS: if you’re registered for GST or pay PAYG instalments, you lodge quarterly by 28 October, 28 February, 28 April and 28 July. Rideshare drivers must register for GST from their first ride; delivery riders only once turnover reaches $75,000. | BAS: अगर आप GST के लिए रजिस्टर्ड हैं या PAYG किस्तें भरते हैं, तो आप हर तिमाही 28 अक्टूबर, 28 फ़रवरी, 28 अप्रैल और 28 जुलाई तक BAS जमा (lodge) करते हैं। राइडशेयर ड्राइवरों को पहली राइड से ही GST के लिए रजिस्टर करना होता है; डिलीवरी राइडरों को तभी, जब टर्नओवर $75,000 तक पहुँच जाए। | BAS: अगर आप GST के लिए रजिस्टर्ड हैं या आपको PAYG किस्तें भरनी होती हैं, तो हर तिमाही 28 अक्टूबर, 28 फ़रवरी, 28 अप्रैल और 28 जुलाई तक BAS जमा (lodge) करना होता है। राइडशेयर ड्राइवरों को पहली राइड से ही GST के लिए रजिस्टर करना होता है; डिलीवरी राइडरों को तभी, जब टर्नओवर $75,000 तक पहुँच जाए। | Gender: 'भरते हैं … जमा करते हैं' are masculine. |
| Choose where you drove from and to. | चुनें कि आप कहाँ से कहाँ तक गए। | चुनें कि ट्रिप कहाँ से कहाँ तक थी। | Gender: 'आप … गए' is masculine. |
| Enter where you drove from and to. | लिखें कि आप कहाँ से कहाँ तक गए। | लिखें कि ट्रिप कहाँ से कहाँ तक थी। | Gender: 'आप … गए' is masculine. |
| Driving {{vehicle}}. Change vehicle | {{vehicle}} चला रहे हैं। गाड़ी बदलें | गाड़ी: {{vehicle}}। गाड़ी बदलें | Gender: 'चला रहे हैं' is masculine. Matches the visible 'गाड़ी:' chip. |
| Driving: | चला रहे हैं: | गाड़ी: | Gender + fit: 'चला रहे हैं:' is masculine; the chip shows the vehicle name right after it. |
| Driving now | अभी इस्तेमाल में | अभी चल रही | UI fit: badge was 1.5× English; 'अभी चल रही' (agrees with गाड़ी) is shorter. |
| Employees: if your employer pays less than 55p a mile (or nothing), claim the difference with form P87 or on Self Assessment. You can go back 4 tax years. | कर्मचारी: अगर आपका एम्प्लॉयर 55p प्रति मील से कम देता है (या कुछ नहीं देता), तो फ़र्क P87 फ़ॉर्म से या Self Assessment में क्लेम करें। आप पिछले 4 टैक्स वर्ष तक का क्लेम कर सकते हैं। | कर्मचारी: अगर आपका एम्प्लॉयर 55p प्रति मील से कम देता है (या कुछ नहीं देता), तो फ़र्क P87 फ़ॉर्म से या Self Assessment में क्लेम करें। पिछले 4 टैक्स वर्ष तक का क्लेम किया जा सकता है। | Gender: 'कर सकते हैं' is masculine. |
| Employees: you can claim Mileage Allowance Relief on the difference between this total and any mileage allowance your employer paid you. | कर्मचारी: इस कुल रकम और आपके एम्प्लॉयर से मिले किसी भी माइलेज भत्ते के बीच के फ़र्क पर आप Mileage Allowance Relief क्लेम कर सकते हैं। | कर्मचारी: इस कुल रकम और आपके एम्प्लॉयर से मिले किसी भी माइलेज भत्ते के बीच के फ़र्क पर Mileage Allowance Relief क्लेम किया जा सकता है। | Gender: 'कर सकते हैं' is masculine. |
| Export your {{year}} mileage report from MileMint and you’re one step closer. | MileMint से अपनी {{year}} की माइलेज रिपोर्ट एक्सपोर्ट करें, और आप एक कदम और आगे होंगे। | MileMint से अपनी {{year}} की माइलेज रिपोर्ट एक्सपोर्ट करें, और काम एक कदम और आगे बढ़ जाएगा। | Gender: 'आप … आगे होंगे' is masculine. |
| How do you work? | आप कैसे काम करते हैं? | आपका काम किस तरह का है? | Gender: 'करते हैं' is masculine. |
| If you’re employed | अगर आप नौकरी करते हैं | अगर आप कर्मचारी हैं | Gender: 'नौकरी करते हैं' is masculine; कर्मचारी also matches the 'Employees' lines. |
| MileMint sorts your drives to match. You can always swipe to change a trip. | MileMint उसी हिसाब से आपकी ट्रिप सॉर्ट करता है। ट्रिप बदलने के लिए आप कभी भी स्वाइप कर सकते हैं। | MileMint उसी हिसाब से आपकी ट्रिप सॉर्ट करता है। ट्रिप बदलनी हो, तो कभी भी स्वाइप करें। | Gender: 'कर सकते हैं' is masculine. |
| New to Pro? Your first month is on me: {{url}} | Pro पहली बार ले रहे हैं? आपका पहला महीना मेरी तरफ़ से: {{url}} | Pro पहली बार? आपका पहला महीना मेरी तरफ़ से: {{url}} | Gender: the friend receiving this share could be anyone; 'ले रहे हैं' is masculine. |
| Once a year: lodge by 31 October after the income year ends (30 June), or later if you use a registered tax agent and sign up with them before 31 October. | साल में एक बार: आय वर्ष (30 जून) खत्म होने के बाद 31 अक्टूबर तक रिटर्न जमा (lodge) करें, या बाद में, अगर आप किसी रजिस्टर्ड टैक्स एजेंट की मदद लेते हैं और 31 अक्टूबर से पहले उनके साथ साइन अप कर लेते हैं। | साल में एक बार: आय वर्ष (30 जून) खत्म होने के बाद 31 अक्टूबर तक रिटर्न जमा (lodge) करें, या बाद में, अगर किसी रजिस्टर्ड टैक्स एजेंट की मदद ली जाए और 31 अक्टूबर से पहले उनके साथ साइन अप हो जाए। | Gender: 'लेते हैं … कर लेते हैं' are masculine. |
| Sets your currency, miles or kilometres, tax year and official mileage rate. You can change it later. | इससे आपकी करेंसी, मील या किलोमीटर, टैक्स वर्ष और आधिकारिक माइलेज रेट तय होते हैं। आप इसे बाद में बदल सकते हैं। | इससे आपकी करेंसी, मील या किलोमीटर, टैक्स वर्ष और आधिकारिक माइलेज रेट तय होते हैं। इसे बाद में बदला जा सकता है। | Gender: 'बदल सकते हैं' is masculine. |
| The IRS asks for a record made at or near the time of each trip, showing the date, where you went, the business purpose and the miles. | IRS हर ट्रिप के समय या उसके आसपास बनाया गया रिकॉर्ड माँगता है, जिसमें तारीख, आप कहाँ गए, बिज़नेस का मकसद और मील हों। | IRS हर ट्रिप के समय या उसके आसपास बनाया गया रिकॉर्ड माँगता है, जिसमें तारीख, मंज़िल, बिज़नेस का मकसद और मील हों। | Gender: 'आप कहाँ गए' is masculine; मंज़िल is the glossary term. |
| Use other vehicles for work too? | काम के लिए दूसरी गाड़ियाँ भी चलाते हैं? | काम के लिए और गाड़ियाँ भी हैं? | Gender: 'चलाते हैं' is masculine. |
| What are you driving? | आप कौन-सी गाड़ी चला रहे हैं? | अभी कौन-सी गाड़ी है? | Gender: 'चला रहे हैं' is masculine. |
| What do you drive? | आप क्या चलाते हैं? | आपकी गाड़ी कौन-सी है? | Gender: 'चलाते हैं' is masculine. |
| Where do you drive? | आप कहाँ ड्राइव करते हैं? | आपकी ड्राइविंग किस देश में होती है? | Gender + migration sensitivity: neutral verb, and it asks about the country of driving, never where the user is 'from'. |
| Your country | आपका देश | देश चुनें | Migration sensitivity: for diaspora readers 'आपका देश' means homeland (India). The screen picks the tax country. |
| MileMint uses your country’s currency, distance unit, tax year and official mileage rate. | MileMint आपके देश की करेंसी, दूरी की इकाई, टैक्स वर्ष और आधिकारिक माइलेज रेट इस्तेमाल करता है। | MileMint चुने गए देश की करेंसी, दूरी की इकाई, टैक्स वर्ष और आधिकारिक माइलेज रेट इस्तेमाल करता है। | Migration sensitivity: 'आपके देश की करेंसी' can be read as rupees. Now 'the chosen country'. |
| You can claim up to 5,000 business kilometres per car each income year. This report assumes one car. | हर आय वर्ष में आप हर कार के लिए 5,000 बिज़नेस किलोमीटर तक क्लेम कर सकते हैं। यह रिपोर्ट एक ही कार मानकर बनी है। | हर आय वर्ष में हर कार के लिए 5,000 बिज़नेस किलोमीटर तक क्लेम किए जा सकते हैं। यह रिपोर्ट एक ही कार मानकर बनी है। | Gender: 'कर सकते हैं' is masculine. |
| You’ll choose which one when you start a shift. | शिफ्ट शुरू करते समय आप चुनेंगे कि कौन-सी गाड़ी। | शिफ्ट शुरू करते समय गाड़ी चुननी होगी। | Gender: 'आप चुनेंगे' is masculine. |
| Swipe to start shift | शिफ्ट शुरू करने के लिए स्वाइप करें | स्वाइप करके शिफ्ट शुरू करें | UI fit: slide-button label; shorter and more natural. |
| Swipe to sort business trips | बिज़नेस ट्रिप सॉर्ट करने के लिए स्वाइप | स्वाइप से बिज़नेस ट्रिप सॉर्ट करें | UI fit: Pro table row, shorter. |

## Checked and kept

- **Season greetings.** हैप्पी हैलोवीन, छुट्टियों की शुभकामनाएँ, नए साल की शुभकामनाएँ, बहार आ गई and हैलो! are all secular. शुभकामनाएँ means good wishes, not a blessing, and none of them uses a religious word.
- **Weekly jokes.** ठक ठक / कौन है?, संडे की टेंशन?, the dating-app pun (राइट स्वाइप, सबसे आसान मैच), आपके मीलों का फ़ोन आया था, मेहनत तो गाड़ी ने कर दी, रसीदों का ढेर and पाई-पाई all land well and are kind. None has a double meaning.
- **Cheers.** खेल शुरू!, चलो, शुरू करते हैं!, हो जाए!, चलो चलें!, चल पड़े! and चलो, गाड़ी स्टार्ट! are casual but respectful. Their verbs are first-person inclusive, so they don't gender the user.
- **Softened money lines** from check 2 (ड्राइविंग की भी कीमत है, असली पैसों की बात, मेहनत का सही इनाम, टैक्स कटौती पक्की करें). These stay as close to the English as rule 9 allows. Every estimate line still says अनुमानित / यह टैक्स सलाह नहीं है.
- **कारीगर for “Trades”.** It's a generic word for skilled tradesperson and has no caste link.
- **UI fit.** The country tiles (अमेरिका, यूके, कनाडा, ऑस्ट्रेलिया), the vehicle buttons, the badges (सबसे किफ़ायती, फ़्री प्लान, ट्रैकिंग चालू), the tabs and the weekday labels all fit. Devanagari with matras renders narrower than its character count. Two labels were shortened (see table).

## Not blocking

- **iOS Hindi system strings.** Like check 2, I couldn't confirm these on a device: “Ask Next Time Or When I Share”, the “ALLOW LOCATION ACCESS” header and “Change to Always Allow”. The wording is understandable either way. Whoever does the device QA pass should compare them with an iPhone set to Hindi. This is a screen-matching risk, not a cultural one.

## Sign-off

**Approved for release.** Nothing left in the file is offensive, religious, political, gender-marking for the user or refund-promising. The only open item is the iOS-wording check above, which doesn't block release.

## Round 3: logbook, P87, privacy and backup (October 2026)

**Scope.** I read all 201 new lines as a Hindi-speaking courier, care worker or employed driver in the UK, US, Canada or Australia would: tone, offence, money honesty, privacy reassurance, glossary consistency, iOS/iCloud wording and button length (≤1.3× English).

**What I checked**
- **Money honesty (P87, logbook).** No line promises a refund or a saving. Relief (राहत) is kept apart from the tax actually returned (टैक्स वापस, always with लगभग or अनुमानित). Logbook comparisons say "looks better", "could claim more", "usually" (बेहतर लग रहा है, हो सकता है, आम तौर पर).
- **Privacy for care workers.** The lines are plain and calm: सिर्फ़ इलाका, नाम या पता कभी नहीं, हम सिर्फ़ इलाका रखेंगे. मरीज़ (patients) and क्लाइंट are respectful, everyday words. Nothing suggests hiding anything from the tax office: the settings line still says the area, distance and purpose are enough for the टैक्स ऑफ़िस.
- **Backup.** Every line keeps "encrypted", "your iCloud Keychain", "MileMint never sees your trips". चाबी is used for "key" (की would be confused with the grammatical की).
- **Gender.** No new line genders the user. First-person lines (मेरे काम में … जाना होता है, मैंने … लॉग किया, इस साल का क्लेम हो गया) are gender-free.
- **Glossary consistency.** ट्रिप, बिज़नेस, पर्सनल (for "private" in the unsorted-drives line), सॉर्ट, टैक्स वर्ष, आय वर्ष, एम्प्लॉयर, कर्मचारी, सेल्फ़-एम्प्लॉयड, मकसद (for the ATO "reason", since the user fills it in the purpose field), सेटिंग्ज़, सेव, डिलीट करें, वैकल्पिक, ओडोमीटर रीडिंग, किमी.
- **Length.** Segmented controls (बेसिक / हायर / एडिशनल / पता नहीं, प्रति मील / कुछ नहीं, सेल्फ़-एम्प्लॉयड / कर्मचारी), alert buttons (रीस्टोर करें, पते हटाएँ, रहने दें, बदलें…, अभी खत्म करें) and chips (सिर्फ़ इलाका, पता रहने दें) all fit.
- **Mixed script.** “Client visit · इलाका” keeps the English label because that is what the app saves and shows. "logbook method" is in Latin like "cents per km method", the ATO name the user will see in myTax.

**Result.** 2 lines changed.

| English | Before | After | Why |
|---|---|---|---|
| See how to claim › | क्लेम कैसे करें, देखें › | क्लेम का तरीका देखें › | The comma version reads like two commands stuck together. This is one natural link phrase. |
| Start fresh instead | इसके बजाय नई शुरुआत करें | नए सिरे से शुरू करें | Shorter (button next to "Restore my trips") and more natural. "Instead" is clear from the two buttons side by side. |

**Not blocking**
- iOS Hindi wording for "Restore" (रीस्टोर करें), "Sign in" (साइन इन करें) and the "Settings → your name → iCloud" path couldn't be checked on a device. They're listed in the glossary's Unsure list.

## Round 3b: shift switch and number format

Each line was translated, back-translated cold, then checked for culture and length (the shift hint is a wrapping caption under the shift bar; target ≤1.3× English). The logbook parser now accepts both decimal points and decimal commas. `npx jest src/i18n` passes.

| English | Before | After | Why |
|---|---|---|---|
| Swipe back to end your shift. | (missing) | वापस स्वाइप करके शिफ्ट खत्म करें। | New line. Back-translation: "End the shift by swiping back." Mirrors "स्वाइप करके शिफ्ट शुरू करें" and "शिफ्ट खत्म करें" (आप, gender-free imperative). Shorter than English on screen. |
| {{hint}}. Swipe the button to the left, or double-tap. | (missing) | {{hint}}। बटन को बाईं ओर स्वाइप करें, या दो बार टैप करें। | New VoiceOver hint; mirrors the "दाईं ओर" line exactly. |
| Enter amounts as numbers, e.g. 2400 or 2,400.50. | रकम नंबर में लिखें, जैसे 2400 या 2,400.50। | (unchanged) | Checked: English-style example is natural; no dot instruction. |

## Round 4: referrals

28 new lines (Invite friends screen, the friend’s-code box in the welcome and Settings, the celebration share button, the free-plan counter, the share message with the code) and 3 removed (Invite a friend, Share it, Share MileMint on WhatsApp and more). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: the friend’s bonus is immediate, the sharer’s only “when a friend joins”, so nothing promises the user drives they don’t have yet. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| You both get +10 free drives a month when a friend joins. | दोस्त के जुड़ने पर आप दोनों को हर महीने +10 फ़्री ट्रिप मिलती हैं। | Gender-free: “को … मिलती हैं” agrees with ट्रिप (f.), not the user. |
| When a friend joins MileMint with your code, … | …आप दोनों को हर महीने 10 और फ़्री ऑटोमैटिक ट्रिप मिलती हैं… | Pass 2 reordered “10 ऑटोमैटिक ट्रिप ज़्यादा फ़्री” to the natural “10 और फ़्री ऑटोमैटिक ट्रिप”. |
| You get 10 extra free drives every month. | अब हर महीने 10 फ़्री ट्रिप ज़्यादा मिलेंगी। | “अब” (now) instead of a gendered “आप पाएँगे”. Back: “Now you’ll get 10 more free trips every month.” |
| You joined with {{code}}: … | कोड {{code}} से जुड़ने का फ़ायदा: हर महीने 10 फ़्री ट्रिप ज़्यादा। | “आप जुड़े” is masculine; a noun phrase (“benefit of joining with code”) avoids it. |
| Redeem | रिडीम करें | Loanword used by Indian payment apps for codes. |
| Invite friends | दोस्तों को इनवाइट करें | Same verb as the old “दोस्त को इनवाइट करें”. 22 chars: fits the nav bar. |

## Round 5: single-use invites

Referrals now use single-use invites: every share makes a new code that works for one friend, and a friend’s code stays **pending** (no bonus yet) until iCloud confirms it. 15 new lines (the Invite friends screen and Settings, the pending and confirmed states of the friend’s-code box, the reasons a code is turned down, the share message) and 6 removed (Your code, Share my code, the old hero line, the old “friends get their drives at once” note, the old own-code message and the old share line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing implies one permanent personal code, and nothing promises drives before the invite is confirmed. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Send a friend an invite. When they join MileMint with it, you both get 10 extra free automatic drives a month. For every friend, with no limit. | किसी दोस्त को इनवाइट भेजें। जब वह इसके ज़रिए MileMint से जुड़ेगा, तो आप दोनों को हर महीने 10 और फ़्री ऑटोमैटिक ट्रिप मिलेंगी। हर दोस्त पर, बिना किसी सीमा के। | “Send an invite to a friend. When they join MileMint through it, you both will get 10 more free automatic trips every month. For every friend, without any limit.” *इनवाइट* as in “दोस्तों को इनवाइट करें”; first draft “उससे दोस्त के … जुड़ने पर” read awkwardly, rewritten as a when-clause. |
| Send an invite | इनवाइट भेजें | “Send invite” Button, short. |
| Every invite has its own code, for one friend. | हर इनवाइट का अपना कोड होता है, एक दोस्त के लिए। | “Every invite has its own code, for one friend.” |
| Invites sent: {{count}} | भेजे गए इनवाइट: {{count}} | “Invites sent: {{count}}” Counter label. |
| Invites are confirmed through iCloud, which is coming in an update. Friends who join before then get their extra drives once it’s switched on, and so do you. | इनवाइट iCloud से कन्फ़र्म होते हैं, जो आने वाले किसी अपडेट में आएगा। उससे पहले जुड़ने वाले दोस्तों को इसके चालू होते ही ज़्यादा ट्रिप मिलेंगी, और आपको भी। | “Invites are confirmed with iCloud, which will come in some upcoming update. Friends who join before that will get more trips as soon as it’s on, and you too.” No promise of drives today. |
| You entered {{code}}. Your 10 extra drives are on their way once the invite is confirmed. | आपने {{code}} डाला है। इनवाइट कन्फ़र्म होते ही आपकी 10 ज़्यादा ट्रिप मिल जाएँगी। | “You have entered {{code}}. As soon as the invite is confirmed you will get your 10 extra trips.” |
| Code {{code}} saved | कोड {{code}} सेव हो गया | “Code {{code}} saved” Mirrors “कोड {{code}} जुड़ गया”. |
| Your 10 extra drives are on their way once the invite is confirmed. | इनवाइट कन्फ़र्म होते ही आपकी 10 ज़्यादा ट्रिप मिल जाएँगी। | “As soon as the invite is confirmed you will get your 10 extra trips.” |
| Your invite code is {{code}}. Enter it when you set up MileMint for 10 extra free drives a month. | आपका इनवाइट कोड {{code}} है। MileMint सेट करते समय इसे डालें और हर महीने 10 फ़्री ट्रिप ज़्यादा पाएँ। | “Your invite code is {{code}}. Enter it while setting up MileMint and get 10 more free trips every month.” Matches the old share line’s wording. |
| We couldn’t find that invite. Check the code with your friend. | यह इनवाइट नहीं मिला। अपने दोस्त से कोड दोबारा जाँच लें। | “This invite wasn’t found. Check the code again with your friend.” |
| That invite has already been used. Ask your friend to send you a new one. | यह इनवाइट पहले ही इस्तेमाल हो चुका है। अपने दोस्त से नया इनवाइट भेजने को कहें। | “This invite has already been used. Ask your friend to send a new invite.” |
| That’s one of your own invites. Send it to a friend instead. | यह आपका अपना इनवाइट है। इसे किसी दोस्त को भेजें। | “This is your own invite. Send it to a friend.” |
| This Apple Account has already joined with a friend’s invite. | यह Apple खाता पहले ही किसी दोस्त के इनवाइट से जुड़ चुका है। | “This Apple account has already joined with a friend’s invite.” *Apple खाता* as in existing lines. |
| 🎉 Your friend’s invite is confirmed | 🎉 आपके दोस्त का इनवाइट कन्फ़र्म हो गया | “🎉 Your friend’s invite is confirmed” *कन्फ़र्म*: everyday Hinglish, as users see it in other apps. |
| Your friend’s invite couldn’t be used | आपके दोस्त का इनवाइट इस्तेमाल नहीं हो सका | “Your friend’s invite couldn’t be used” |

**Sign-off:** approved, pending an on-device check of the new alert titles.

## Round 8: fair free plan

The free plan is made fair, with no surprise paywall. Personal drives no longer use the 40 free drives. Drives past the limit stay fully visible and sortable, and they are in the spreadsheet; only their value (money) waits for Pro. The limit is stated up front on the welcome screen, on the home meter ("What counts?" sheet) and on the paywall. 26 new lines, 13 removed (the old “locked drive” row, “Kept, locked”/“Unlocked”, the old meter and welcome lines, the old Settings plan line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing says a drive is *locked* or *hidden* any more. A drive past the limit is *saved and shown*, and only its **value** waits for Pro. “Work drives” uses the glossary’s business term. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Saved · value unlocks with Pro | सेव है · कीमत Pro से अनलॉक होगी | “Saved · the value will unlock with Pro.” *कीमत* is the glossary’s word for worth. |
| Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it. | सेव हो गई। इस महीने की फ़्री ट्रिप पूरी हो चुकी हैं, इसलिए पर्सनल से वापस बिज़नेस की गई ट्रिप की कीमत Pro के साथ दिखेगी। जिन ट्रिप की कीमत पहले से दिख रही है, वह बनी रहेगी। | “Saved. This month’s free trips are used up, so a trip changed back from personal to business will show its value with Pro. Trips whose value already shows keep it.” Gender-free for the user: no verb about “you”. |
| {{used}} of {{limit}} free work drives in {{month}} | {{month}} में {{limit}} में से {{used}} फ़्री बिज़नेस ट्रिप | “In {{month}}, {{used}} of {{limit}} free business trips”. Same order as the old meter line. |
| Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited. | फ़्री: हर महीने {{count}} बिज़नेस ट्रिप। पर्सनल ट्रिप नहीं गिनी जातीं, और शिफ्ट दिन में एक बार गिनी जाती है। हाथ से जोड़ी गई ट्रिप हमेशा फ़्री हैं। Pro: अनलिमिटेड। | “Free: 40 business trips every month. Personal trips aren’t counted, and a shift is counted once a day. Trips added by hand are always free. Pro: unlimited.” Passive *गिनी जाती* avoids a gendered verb for the user. |
| Personal drives don’t count. Sort one personal and the next drive gets its place. | पर्सनल ट्रिप नहीं गिनी जातीं। किसी ट्रिप को पर्सनल सॉर्ट करें, तो उसकी जगह अगली ट्रिप को मिल जाती है। | “Personal trips aren’t counted. Sort a trip as personal and the next trip gets its place.” |
| Past the limit nothing is hidden or lost: every drive is saved, shown in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro. | लिमिट के बाद भी कुछ छिपता या खोता नहीं: हर ट्रिप सेव होती है, पूरी दिखती है, सॉर्ट की जा सकती है और आपके स्प्रेडशीट एक्सपोर्ट में रहती है। सिर्फ़ उसकी कीमत Pro का इंतज़ार करती है। | “Even after the limit nothing hides or gets lost: every trip is saved, shows in full, can be sorted and stays in your spreadsheet export. Only its value waits for Pro.” |
| The month’s earliest drives go first, so a drive showing its value keeps it. The count starts again on the 1st. | महीने की सबसे पहली ट्रिप पहले गिनी जाती हैं, इसलिए जिस ट्रिप की कीमत दिख रही है, वह बनी रहती है। गिनती हर महीने की 1 तारीख को फिर शुरू होती है। | “The month’s earliest trips are counted first, so a trip whose value shows keeps it. Counting starts again on the 1st of every month.” “Got it” is *ठीक है* (“OK”): *समझ गए* would be gendered. |

**Sign-off:** approved, pending an on-device check of the “What counts?” sheet and the long welcome line on a small iPhone.

## Round 6: shift rows

The home list now shows one row per shift, which opens to its drives. A drive that runs past the end of a shift is cut there, and the part after it (the drive home) is left to sort. Shifts can be paused for an errand, started late (“Start shift from 10:40?”), have their times corrected, be undone for a few seconds after ending, and say when they end by themselves at 16 hours or the car has been parked at home a while. 41 new lines (row, legs, time steppers, pause, offers, undo toast, two notifications, a stored place label). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rules for all of them: the shift, drive and sort terms from the glossary; the part after a shift is never called personal (it is *not counted as work unless you choose*); nothing promises a tax result. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| {{count}} drives | one: {{count}} ट्रिप / other: {{count}} ट्रिप | “{{count}} trip(s)” |
| {{count}} drives since then look like deliveries. They’ll be added to the shift as business. | one: तब से {{count}} ट्रिप डिलीवरी जैसी लगती है। इसे बिज़नेस के रूप में शिफ्ट में जोड़ दिया जाएगा। / other: तब से {{count}} ट्रिप डिलीवरी जैसी लगती हैं। इन्हें बिज़नेस के रूप में शिफ्ट में जोड़ दिया जाएगा। | “Since then {{count}} trips seem like deliveries. They will be added to the shift as business.” |
| {{purpose}} · {{count}} to sort | one: {{purpose}} · {{count}} सॉर्ट करनी बाकी / other: {{purpose}} · {{count}} सॉर्ट करनी बाकी | “{{purpose}} · {{count}} left to sort” |
| After your shift ended · not counted as work unless you say so | शिफ्ट खत्म होने के बाद · जब तक आप न चुनें, काम में नहीं गिनी जाएगी | “After the shift ends · won’t be counted as work unless you choose” |
| Deliveries | डिलीवरी | “Delivery” Hindi uses डिलीवरी for both singular and plural. |
| Did your shift start at {{time}}? | क्या आपकी शिफ्ट {{time}} बजे शुरू हुई थी? | “Did your shift start at {{time}} o’clock?” |
| Drives join or leave the shift by when they started. A drive past the end is cut there. | ट्रिप अपने शुरू होने के समय के हिसाब से शिफ्ट में जुड़ती या हटती हैं। शिफ्ट खत्म होने के बाद भी चल रही ट्रिप वहीं से दो हिस्सों में बंट जाती है। | “Trips join or leave the shift by when they started. A trip still running after the shift ends is split into two parts there.” |
| During a pause in your shift · not counted as work unless you say so | शिफ्ट के ब्रेक के दौरान · जब तक आप न चुनें, काम में नहीं गिनी जाएगी | “During the shift’s break · won’t be counted as work unless you choose” |
| End 15 minutes earlier | खत्म होने का समय 15 मिनट पहले करें | “Make the end time 15 minutes earlier” |
| End 15 minutes later | खत्म होने का समय 15 मिनट बाद करें | “Make the end time 15 minutes later” |
| End your shift? | शिफ्ट खत्म करें? | “End the shift?” |
| Ended {{time}} | {{time}} बजे खत्म | “Ended at {{time}}” |
| Hide drives ▴ | ट्रिप छिपाएं ▴ | “Hide trips ▴” |
| Hides the drives in this shift | इस शिफ्ट की ट्रिप छिपाता है | “Hides this shift’s trips” |
| It was still on, so MileMint ended it. Drives from now on are left for you to sort. Tap to check the times. | यह अभी भी चालू थी, इसलिए MileMint ने इसे खत्म कर दिया। अब से होने वाली ट्रिप आपको खुद सॉर्ट करनी होंगी। समय जांचने के लिए टैप करें। | “It was still on, so MileMint ended it. Trips from now on you’ll have to sort yourself. Tap to check the time.” |
| Map of the drives in this shift | इस शिफ्ट की ट्रिप का नक्शा | “Map of this shift’s trips” |
| On shift | शिफ्ट पर | “On shift” |
| Pause | ब्रेक लें | “Take a break” *ब्रेक* is what couriers say; रोकें would read as “stop”. |
| Pause the shift for a personal errand | पर्सनल काम के लिए शिफ्ट पर ब्रेक लें | “Take a break in the shift for personal work” |
| Paused · {{elapsed}} | ब्रेक पर · {{elapsed}} | “On break · {{elapsed}}” |
| Paused: drives now aren’t counted as work. Resume when you’re back. | ब्रेक पर: अभी की ट्रिप काम में नहीं गिनी जाएंगी। लौटकर फिर शुरू करें। | “On break: current trips won’t be counted as work. Start again when you’re back.” |
| Resume | फिर शुरू करें | “Start again” |
| Resume the shift | शिफ्ट फिर शुरू करें | “Start the shift again” |
| Shift | शिफ्ट | “Shift” |
| Shift ended | शिफ्ट खत्म हुई | “Shift ended” |
| Shift on {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | {{date}} की शिफ्ट, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | “Shift of {{date}}, …” |
| Show drives ▾ | ट्रिप दिखाएं ▾ | “Show trips ▾” |
| Shows the drives in this shift | इस शिफ्ट की ट्रिप दिखाता है | “Shows this shift’s trips” |
| Since {{time}} | {{time}} से | “From {{time}}” |
| Start 15 minutes earlier | शुरू होने का समय 15 मिनट पहले करें | “Make the start time 15 minutes earlier” |
| Start 15 minutes later | शुरू होने का समय 15 मिनट बाद करें | “Make the start time 15 minutes later” |
| Start from {{time}} | {{time}} से शुरू करें | “Start from {{time}}” |
| Start shift from {{time}}? | शिफ्ट {{time}} से शुरू करें? | “Start the shift from {{time}}?” |
| Started {{time}} | {{time}} बजे शुरू | “Started at {{time}}” |
| Still working | अभी काम पर हूं | “I’m still at work” |
| Undo | पूर्ववत करें | “Undo” iOS Hindi पूर्ववत करें. |
| Undo ending the shift | शिफ्ट खत्म करना पूर्ववत करें | “Undo ending the shift” |
| Where your shift ended | जहां शिफ्ट खत्म हुई | “Where the shift ended” |
| You’ve been parked at home for a while and your shift is still on. Drives after it ends aren’t counted as work. | आप काफ़ी देर से घर पर पार्क हैं और आपकी शिफ्ट अभी भी चालू है। शिफ्ट खत्म होने के बाद की ट्रिप काम में नहीं गिनी जातीं। | “You’ve been parked at home for quite a while and your shift is still on. Trips after the shift ends aren’t counted as work.” |
| You’ve been parked at home since {{time}}. Drives after the shift aren’t counted as work. | आप {{time}} बजे से घर पर पार्क हैं। शिफ्ट के बाद की ट्रिप काम में नहीं गिनी जातीं। | “You’ve been parked at home since {{time}}. Trips after the shift aren’t counted as work.” |
| Your shift ended after 16 hours | आपकी शिफ्ट 16 घंटे बाद खत्म हो गई | “Your shift ended after 16 hours” |

**Sign-off:** approved, pending an on-device look at the shift row and the undo toast in this language.

## Round 7: tracking health

Tracking health: home card, Settings “ट्रैकिंग की जाँच” row and background notifications. 24 new lines. Terms: *ट्रिप* (f.), *ट्रैकिंग*, *लॉग*, *छूटी ट्रिप*, आप with gender-free verbs. iOS wording: *सेटिंग्ज़*, *स्थान*, *सटीक स्थान*. Three passes per line: translate; cold back-translation against the English; culture, honesty and length (titles and the Settings row wrap; buttons ≤1.3× English). Rule for all of them: say plainly what's wrong and the one tap that fixes it, never blame the driver, and say "may" wherever a missed drive isn't certain. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Precise Location is off | सटीक स्थान बंद है | “Precise location is off”. *सटीक स्थान*: best match for Apple’s Hindi toggle; listed under Unsure. |
| MileMint only gets a rough position, so drives can’t be measured. In Settings, tap Location and turn on Precise Location. | MileMint को सिर्फ़ अंदाज़न जगह मिल रही है, इसलिए ट्रिप नापी नहीं जा सकतीं। सेटिंग्ज़ में स्थान पर टैप करें और सटीक स्थान चालू करें। | “MileMint is only getting a rough place, so trips can’t be measured. In Settings tap Location and turn on Precise Location.” Passive *नापी नहीं जा सकतीं*: no gendered “you”. |
| Tracking has stopped | ट्रैकिंग रुक गई है | “Tracking has stopped”. |
| Automatic tracking stopped running, so new drives aren’t being logged. | ऑटोमैटिक ट्रैकिंग चलनी बंद हो गई है, इसलिए नई ट्रिप लॉग नहीं हो रही हैं। | “Automatic tracking has stopped running, so new trips aren’t being logged.” |
| Tracking may have stopped | हो सकता है ट्रैकिंग रुक गई हो | “It may be that tracking has stopped”. |
| No location since {{time}}, in the middle of a drive. | ट्रिप के बीच {{time}} से कोई स्थान नहीं मिला। | “During the trip, no location since {{time}}.” |
| Turn tracking back on | ट्रैकिंग फिर चालू करें | “Turn tracking on again”. Button. |
| Tracking stopped {{from}}–{{to}} | ट्रैकिंग {{from}}–{{to}} रुकी रही | “Tracking stayed stopped {{from}}–{{to}}”. |
| A drive may have been missed | हो सकता है एक ट्रिप छूट गई हो | “It may be that a trip was missed”. Same *छूट* as “ट्रिप छूट सकती हैं”. |
| About {{distance}} may be missing. Add the missed trip? | लगभग {{distance}} छूट गए हो सकते हैं। छूटी ट्रिप जोड़ें? | “About {{distance}} may have been missed. Add missed trip?” Reuses *छूटी ट्रिप जोड़ें*. |
| Your phone moved about {{distance}} between {{from}} and {{to}}, but no drive was logged. Add the missed trip? | आपका फ़ोन {{from}} से {{to}} के बीच लगभग {{distance}} आगे गया, लेकिन कोई ट्रिप लॉग नहीं हुई। छूटी ट्रिप जोड़ें? | “Your phone went about {{distance}} between {{from}} and {{to}}, but no trip was logged. Add missed trip?” |
| Not a drive | यह ट्रिप नहीं थी | “This wasn’t a trip”. |
| All good | सब ठीक है | “All is fine”. |
| just now | अभी-अभी | “just now”. |
| {{count}} minutes ago | one: {{count}} मिनट पहले / other: {{count}} मिनट पहले | “{{count}} minute(s) ago”. |
| {{count}} hours ago | one: {{count}} घंटा पहले / other: {{count}} घंटे पहले | “{{count}} hour(s) ago”: घंटा/घंटे. |
| {{count}} days ago | one: {{count}} दिन पहले / other: {{count}} दिन पहले | “{{count}} day(s) ago”. |
| Tracking check | ट्रैकिंग की जाँच | “Tracking check”. |
| Last location: {{ago}} | आख़िरी स्थान: {{ago}} | “Last location: {{ago}}”. |
| No location yet | अभी तक कोई स्थान नहीं | “No location yet”. |
| Location access for MileMint is off, so drives aren’t being logged. Tap to turn it back on. | MileMint के लिए स्थान की अनुमति बंद है, इसलिए ट्रिप लॉग नहीं हो रही हैं। फिर से चालू करने के लिए टैप करें। | “Location permission for MileMint is off, so trips aren’t being logged. Tap to turn it on again.” |
| Drives can’t be measured from a rough position. Tap to fix it. | अंदाज़न जगह से ट्रिप नापी नहीं जा सकतीं। ठीक करने के लिए टैप करें। | “Trips can’t be measured from a rough place. Tap to fix.” |
| New drives aren’t being logged. Tap to turn tracking back on. | नई ट्रिप लॉग नहीं हो रही हैं। ट्रैकिंग फिर चालू करने के लिए टैप करें। | “New trips aren’t being logged. Tap to turn tracking on again.” |
| No location since {{time}}, in the middle of a drive. Open MileMint to pick it back up. | ट्रिप के बीच {{time}} से कोई स्थान नहीं मिला। ट्रैकिंग फिर से शुरू करने के लिए MileMint खोलें। | “During the trip, no location since {{time}}. Open MileMint to start tracking again.” |

**Sign-off:** approved, pending an on-device check of *सटीक स्थान*.


## Round 8: pre-release fixes

| English | hi | Back-translation | Note |
|---|---|---|---|
| Where your shift started | जहां शिफ्ट शुरू हुई | Where the shift started | Mirrors the existing "Where your shift ended" line, same length and register. |
