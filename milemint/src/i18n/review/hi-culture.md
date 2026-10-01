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
