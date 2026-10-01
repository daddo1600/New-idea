# Brazilian Portuguese (pt-BR): cultural and UX-copy review (check 3 of 3)

Reviewer profile: native Brazilian who has lived in the UK, US and Australia and knows the Brazilian motoboy, entregador and driver communities there (London especially).

Scope: every entry in `src/i18n/locales/pt-BR.ts`, read in context. I checked how the jokes, cheers, greetings and celebrations are used in `src/domain/reminders.ts` (title/body pairs, miles/km titles), `src/domain/cheers.ts`, `src/domain/seasons.ts` and `src/milestones/copy.ts`. For short labels I checked the layouts in `src/app/index.tsx` (select bar, bulk buttons), `src/app/pro.tsx`, `src/app/settings.tsx`, `src/app/welcome.tsx`, `src/app/add-trip.tsx`, `src/components/celebration.tsx` and `src/components/country-options.tsx`.

Checks:
1. Offence and sensitivity, including Brazilian double meanings (dar, comer, pegar, meter, gozar, "dar uma ___ada" and so on).
2. Tone: warm, respectful, "você", not childish, bossy or salesy.
3. Money and tax honesty.
4. Units on lines shown in every country.
5. Zero counts in plural objects.
6. UI fit, "Apple Maps" vs "Mapas", "o CRA" vs "a CRA".

Result: **34 strings changed, plus a `zero` form added to 18 plural objects.** Keys, placeholders, `<b>` tags and plural objects are intact. `npx jest src/i18n` passes (31/31).

## Changes

| English | Before | After | Why |
|---|---|---|---|
| Free money alert 💸 | Alerta de dinheiro grátis 💸 | Deixou algo pelo caminho? 💸 | *Dinheiro grátis* is word for word how WhatsApp and SMS scams ("ganhe dinheiro") read in Brazil. The new title is a light tease that promises nothing. |
| Well, technically it’s your money. Sort this week’s drives to claim it back. | Tá, tecnicamente o dinheiro já é seu. Classifique… para recuperá-lo. | Você rodou, você trabalhou. Classifique os trajetos da semana para nenhuma dedução ficar de fora. | *Recuperá-lo* promises a refund. The new body is warm ("you drove, you worked") and talks about deductions, which is what the app actually offers. It follows the new title. |
| Plot twist: driving pays | Reviravolta: dirigir dá dinheiro | Reviravolta: dirigir conta a seu favor | *Dá dinheiro* is an earnings pitch, and it uses *dar*. "Counts in your favour" keeps the twist without a money claim. |
| Swipe this week’s trips business or personal and see what you’ve earned back. | …e veja quanto você recuperou. | …e veja quanto eles valem. | *Recuperou* sounds like cash already refunded. *Quanto valem* matches the app's "worth" wording. |
| Low effort, high reward | Pouco esforço, muita recompensa | Pouco esforço, muito resultado | *Recompensa* hints at a payout. *Resultado* is the natural Brazilian pairing and promises nothing. |
| Swipe right on savings | Dê match no seu dinheiro | Hora do match | It used *dar* (zero tolerance) and promised money. The dating-app pun stays and pairs with the body "O match mais fácil da semana". |
| Sunday scaries? Not for your taxes | Bateu a deprê de domingo? Que não seja pelos impostos | Bateu o desânimo de domingo? Que não seja pelos impostos | *Deprê* is slang for depression. Making light of mental health is a needless risk. *Desânimo* is the same Sunday-night feeling. |
| Before Monday shows up, give this week’s drives a quick sort. | …dê uma classificada rápida nos trajetos da semana. | …separe um minuto para classificar os trajetos da semana. | "Dar uma ___ada rápida" is the pattern behind *dar uma rapidinha* (a quickie). Brazilians will spot it. |
| Now spend one minute taking the credit. Sort this week’s drives. | Agora é sua vez de levar o crédito, em um minutinho. Classifique… | Agora é com você: um minutinho para classificar os trajetos da semana. | In a tax app, *crédito* reads as a tax credit, and the line was clumsy. "Agora é com você" follows the title *Seu carro já fez a parte difícil* naturally. |
| {{amount}} back in your pocket | {{amount}} de volta no seu bolso | Já são {{amount}} encontrados | A milestone title that promised cash back. "That's already {{amount}} found" celebrates and is true. |
| MileMint has now found {{amount}}… That’s real money back at tax time. | …É dinheiro de verdade de volta na época do imposto. | …Isso faz diferença de verdade na época do imposto. | "Real money back" promises a refund. "Makes a real difference" is honest. |
| MileMint has now found {{amount}}… Hard work, properly rewarded. | …Trabalho duro, bem recompensado. | …Muito trabalho, tudo bem registrado. | *Recompensado* implies a payout. *Duro* invites a double reading next to *trabalho*. The new line praises the work and what the app actually does (logging). |
| Money back (Milestones section) | Dinheiro de volta | Valores encontrados | Refund promise. "Amounts found" matches the app's own "found" wording. |
| Your money back and badges (menu detail) | Seu dinheiro de volta e conquistas | Valores encontrados e conquistas | Same reason. |
| Sort your drives… Every business mile is money back. | …Cada milha profissional é dinheiro de volta. | …Cada milha profissional conta na declaração. | Refund promise. |
| Sort your drives… Every business kilometre is money back. | …Cada quilômetro profissional é dinheiro de volta. | …Cada quilômetro profissional conta na declaração. | Same. |
| Worth money (welcome feature heading) | Vale dinheiro | Quanto vale | *Vale dinheiro* on a first screen reads like a "make money" app. "How much it's worth" leads into the body *Veja quanto cada trajeto profissional vale…*. |
| Never miss a mile. | Não perca nenhuma milha. | Nenhum trajeto fica de fora. | Onboarding step 2 is shown in every country, so Canadian and Australian users saw "milha". |
| Every business mile, counted. | Cada milha profissional, contada. | Cada trajeto profissional, contado. | The first welcome screen is shown before or regardless of the country, so it can't name a unit. |
| Employees: if your employer pays less than 55p a mile… You can go back 4 tax years. | Dá para pedir referente a… | Você pode pedir referente a… | *Dá para* is innocent, but there is zero tolerance on *dar*, and *Você pode* is clearer in tax text. |
| Give the place a name, e.g. “Acme HQ”. | Dê um nome ao local… | Escolha um nome para o local… | Same zero-tolerance rule on *dar*. The meaning is unchanged. |
| Apple Maps couldn’t place that one. Try another suggestion. | O Apple Maps não conseguiu localizar esse. | O Apple Maps não encontrou esse endereço. | "Esse" had no noun, so it read unfinished. |
| Your driving (Settings section) | Ao volante | Veículos e trajetos | *Ao volante* (at the wheel) is odd for cyclists and moto riders. The section holds vehicles, the "new drives start as business" switch and shift mode. |
| Best value (yearly plan badge) | Mais vantajoso | Compensa mais | UI fit: 14 → 13 characters (1.3×). It's what Brazilians say ("o anual compensa mais"), and it makes no saving claim. |
| Use now (vehicle row) | Usar agora | Usar | UI fit: small inline link was 1.4×. The status beside the current vehicle already says *Em uso agora*. |
| UK (half-width country tile) | Reino Unido | UK | UI fit: 11 characters with `numberOfLines={1}` beside a 30pt flag can truncate on an iPhone SE or with larger text. Brazilians in Britain say "UK" daily ("moro no UK"). The tile's screen-reader label still uses "Reino Unido" (United Kingdom key). |
| Select {{count}} unsorted (one / many / other) | Selecionar {{count}} sem classificar | Selecionar {{count}} pendente / pendentes | UI fit: it shares a row with "Trajetos" and "Cancelar". At 28 characters against 17 it overflowed a 343pt row at 14pt. *Pendentes* is everyday Brazilian for "still to do". |
| CRA asks for a logbook… | A CRA pede… | O CRA pede… | The placeholder lines must say "o {{authority}}", so a Canadian user saw "o CRA" and "a CRA" on the same screens. Now it's masculine everywhere (read as "o órgão"), like o HMRC, o IRS, o ATO. |
| CRA needs your total distance driven… | A CRA precisa… | O CRA precisa… | Same. |
| CRA per-km rate: 73¢… | Taxa por km da CRA… | Taxa por km do CRA… | Same. |
| Employees reimbursed at CRA’s per-km rate… | …taxa por km da CRA… | …taxa por km do CRA… | Same. |
| Instalments: … CRA asks for quarterly payments… | …a CRA pede… | …o CRA pede… | Same. |
| The CRA per-km rate is for cars… | A taxa por km da CRA… | A taxa por km do CRA… | Same. |
| This is CRA’s reimbursement rate for employees… | …da CRA… a CRA normalmente… | …do CRA… o CRA normalmente… | Same. |

### Zero forms added (18 plural objects)

CLDR puts 0 in `one` for Portuguese, so I added `zero` (the same wording as `other`) to every plural object whose `one` differs from `other`. Placeholders are identical.

`{{count}} days`, `{{count}} days left`, `{{count}} days left in the {{year}} tax year`, `{{count}} drives are locked…`, `{{count}} drives are waiting to be unlocked`, `{{count}} selected`, `{{count}} trips aren’t classified yet…`, `{{count}}-day free trial`, `{{count}}-month free trial`, `{{distance}} · {{value}} · {{count}} drives`, `{{distance}} miles` ("0 milhas", the case in `app/compare.tsx`), `{{distance}} miles · a typical month of business driving`, `{{dueLine}}: {{count}} days to go`, `days`, `Free plan: {{count}} automatic drives a month…`, `On shift for {{elapsed}}, {{count}} drives`, `Select {{count}} unsorted`, `Sort {{count}} drives`.

The objects whose forms are all the same ("{{count}} por mês", "{{distance}} km…") don't need one.

## Decisions on the open questions

- **Apple Maps vs Mapas:** kept **Apple Maps** (3 lines). The pt-BR iPhone labels the app "Mapas", but in a sentence ("segundo o Mapas") that reads as generic "maps", and most couriers use Waze or Google Maps, so it could even suggest the wrong app. Brazilians say "Apple Maps".
- **o CRA vs a CRA:** masculine everywhere (see the table).
- **Kept although longer than 1.3×, after checking the layouts:**
  - *Profissional* (Business): the segmented controls, bulk buttons and swipe action are all at least half the screen wide. *A trabalho* would clash with the saved place *Trabalho*.
  - *Selecionar* (Select): Apple's word. When it shows, it has the row alone with "Trajetos".
  - *Compartilhar* (Share it / Share this): Apple's word, and the only text on a full-width button.
  - *Observação* (Note): a screen-reader label and a full-width field label.
  - *Nenhum dos dois* (Neither): the title of a full-width option card. "Nenhum" alone is unclear.

## Checked and left as is

- **Cheers:** Partiu!, Vamos lá!, Hora de rodar!, Valendo!, Vamos nessa!, Lá vamos nós! These are all clean and natural for a shift start.
- **Season greetings:** all secular. Boas festas, Feliz Ano Novo, Feliz Halloween (widely used in Brazil, no religious tone), E aí! Verão na estrada, Se agasalhe bem por aí, A primavera chegou, Dias de sol, trajetos profissionais. "No outono, cada trajeto conta" is unit-neutral, so it suits Canada and Australia too.
- **Other weekly reminders:** "Suas milhas / Seus quilômetros ligaram" with the gender-neutral body, "Toc, toc / Quem é?", "Seu eu do futuro agradece", "Literalmente. A gente contou.", "caixa de sapato cheia de notinhas", "deixe a dedução anotada". All kind and natural.
- **Share lines:** "O app de quilometragem que conta cada trajeto" and "Cada trajeto contado" are unit-neutral. The km share lines say "cada quilômetro".
- "Você mereceu cada centavo", "Mandou bem. Continue rodando.", "O primeiro mês é por minha conta". Warm, with no promise.
- "Não, obrigado" is the standard Brazilian UI formula, used by everyone whatever their gender.
- "Empregado(s)" is kept as the neutral legal and tax term (CLT usage). It's respectful in this context.
- No mentions of nationality, migration status, religion or politics anywhere.

## Still to confirm (does not block)

- The iOS system wording (Permitir Durante o Uso do App, Alterar para Sempre Permitir, etc.) was accepted by check 2 from memory. A glance at a pt-BR iPhone before the App Store screenshots would be good practice. The strings are standard, and I see no reason to doubt them.

**Sign-off: Approved for release.**
