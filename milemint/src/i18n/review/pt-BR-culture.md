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

## Round 3: logbook, P87, privacy and backup (October 2026)

Read as a Brazilian courier or care worker in the UK, Australia, the US or Canada. Checked: offence and double meanings (no *dar* constructions), gendered wording (most care workers are women, and *empregada* means "maid" in Brazil), reassuring privacy wording that never suggests hiding anything from the tax office, money honesty on P87 lines, Apple's pt-BR iCloud and Ajustes wording, glossary consistency, and length of buttons and labels against the layouts in `app/settings.tsx`, `app/claim-relief.tsx`, `app/logbook.tsx`, `app/add-trip.tsx` and `components/header-menu.tsx`.

Result: **7 strings changed.** Completeness test for pt-BR passes.

| English | Before | After | Why |
|---|---|---|---|
| Claim mileage relief (menu item) | Pedir abatimento por quilometragem | Pedir abatimento (milhas) | 1.7× the English. The feature is UK-only, so "milhas" is right, and the detail line below says P87 / Self Assessment. |
| Estimated tax back (summary row) | Imposto de volta (estimativa) | Imposto de volta estimado | 1.6× in a label/value row; now 1.4× and more natural. "Estimado" kept. |
| Back up now (small button) | Fazer backup agora | Fazer backup | The small button shares a row with "Restaurar do backup no iCloud"; "agora" adds nothing on a button. |
| Employed, in your own vehicle? (welcome) | Empregado, com seu próprio veículo? | Tem empregador e usa seu veículo? | Addressing the user as "Empregado" is masculine, and the feminine "Empregada" reads as "housemaid". The new wording has no gender. |
| I visit clients or patients at home (care, nursing, support work) | …(cuidador, enfermagem, apoio) | …(cuidados, enfermagem, apoio) | "Cuidador" is masculine; "cuidados" names the kind of work, like the English. |
| New drives read like “{{example}}”… Places you saved yourself… | que você mesmo salvou | que você salvou | "Você mesmo" is masculine; "yourself" is implied. |
| Have to hand: your employer’s name and PAYE reference (on your payslip or P60)… | no seu holerite | no seu holerite, o payslip, | "Holerite" is Brazilian (and less familiar in Rio than "contracheque"); naming the English document helps the user find it in their papers. |

Checked and left as is:
- **Privacy lines** ("Vamos guardar só a região, nunca o endereço deles", "Para o fisco, a região, a distância e a finalidade bastam") are calm and plain, and say clearly what is kept; nothing hints at hiding trips.
- **"Client visit · região"** in the add-trip alert keeps "Client visit" in English, because the label MileMint saves (`domain/privacy.ts`) is always English and that is what the user will see on the trip.
- **Backup lines** say "criptografado", "Chaves do iCloud" and "O MileMint nunca vê seus trajetos"; none suggests MileMint servers or an account.
- **"Autônomo" / "Empregado"** as option labels: kept, as the standard generic category names on Brazilian forms (glossary).
- **"Encerrar antes"** (End early, 1.55×): a text link alone under the logbook card and an alert button, with room. "Encerrar" alone would hide that it ends the logbook early.
- **"Substituir…"** (Replace…, 1.4×) and **"Restaurar"** (Restore): Apple's own pt-BR words in alert buttons.
- **"Licenciamento"** for Registration (rego) and **"Juros do financiamento"** for loan interest are what a Brazilian calls these costs.
- **"logbook"**: kept, like "cents per km method". Brazilians in Australia use the word, and it matches the ATO's forms.

## Round 3b: shift switch and number format

Each line was translated, back-translated cold, then checked for culture and length (the shift hint is a wrapping caption under the shift bar; target ≤1.3× English). The logbook parser now accepts both decimal points and decimal commas. `npx jest src/i18n` passes.

| English | Before | After | Why |
|---|---|---|---|
| Swipe back to end your shift. | (missing) | Deslize de volta e encerre o turno. | New line. Back-translation: "Swipe back and end the shift." Uses Deslize (você) and "encerrar turno" as in "Encerrar turno". 1.21× English. |
| {{hint}}. Swipe the button to the left, or double-tap. | (missing) | {{hint}}. Deslize o botão para a esquerda ou toque duas vezes. | New VoiceOver hint; mirrors the "para a direita" line exactly. |
| Enter amounts as numbers, e.g. 2400 or 2,400.50. | Digite os valores só com números, ex.: 2400 ou 2400.50 (com ponto antes dos centavos). | Digite os valores em números, ex.: 2400 ou 2.400,50. | The parser now accepts a decimal comma, so the example uses Brazilian format and the "com ponto" instruction is gone. Back-translation: "Type the amounts as numbers, e.g. 2400 or 2.400,50." |

## Round 4: referrals

28 new lines (Invite friends screen, the friend’s-code box in the welcome and Settings, the celebration share button, the free-plan counter, the share message with the code) and 3 removed (Invite a friend, Share it, Share MileMint on WhatsApp and more). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: the friend’s bonus is immediate, the sharer’s only “when a friend joins”, so nothing promises the user drives they don’t have yet. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| You both get +10 free drives a month when a friend joins. | Vocês dois ganham +10 trajetos grátis por mês quando um amigo entra. | *ganhar* reads as a reward, natural for Brazilian promos (“ganhe”). |
| Share it · friends get +10 drives | Compartilhar · +10 trajetos para amigos | 39 chars (1.18×); verb first, like the old “Compartilhar”. |
| Invite friends | Convidar amigos | Matches the old “Convidar um amigo” style (infinitive for titles). |
| Redeem | Resgatar | Apple pt-BR wording (“Resgatar cartão-presente ou código”). |
| Got a code from a friend? It adds 10 free drives a month. | Tem o código de um amigo? Ele soma 10 trajetos grátis por mês. | Back: “Do you have a friend’s code? It adds 10 free trips a month.” ✓ |
| Enter my code {{code}} when you set up MileMint… | Use meu código {{code}} ao configurar o MileMint e ganhe 10 trajetos grátis a mais por mês. | “o MileMint” with the article, as the glossary sets. |

## Round 5: single-use invites

Referrals now use single-use invites: every share makes a new code that works for one friend, and a friend’s code stays **pending** (no bonus yet) until iCloud confirms it. 15 new lines (the Invite friends screen and Settings, the pending and confirmed states of the friend’s-code box, the reasons a code is turned down, the share message) and 6 removed (Your code, Share my code, the old hero line, the old “friends get their drives at once” note, the old own-code message and the old share line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing implies one permanent personal code, and nothing promises drives before the invite is confirmed. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Send a friend an invite. When they join MileMint with it, you both get 10 extra free automatic drives a month. For every friend, with no limit. | Mande um convite para um amigo. Quando ele entrar no MileMint com o convite, vocês dois ganham 10 trajetos automáticos grátis a mais por mês. Para cada amigo, sem limite. | “Send an invite to a friend. When they join MileMint with the invite, you two get 10 more free automatic trips a month. For each friend, no limit.” *trajetos*, *vocês dois ganham* as in Round 4. |
| Send an invite | Enviar convite | “Send invite” Button, 1.0×. |
| Every invite has its own code, for one friend. | Cada convite tem seu próprio código e vale para um amigo. | “Each invite has its own code and is good for one friend.” *vale para* = is valid for. |
| Invites sent: {{count}} | Convites enviados: {{count}} | “Invites sent: {{count}}” Counter label. |
| Invites are confirmed through iCloud, which is coming in an update. Friends who join before then get their extra drives once it’s switched on, and so do you. | Os convites são confirmados pelo iCloud, que chega em uma próxima atualização. Os amigos que entrarem antes disso ganham os trajetos extras quando ele for ativado, e você também. | “Invites are confirmed by iCloud, which comes in a next update. Friends who join before that get the extra trips when it’s turned on, and you too.” No promise of drives today. |
| You entered {{code}}. Your 10 extra drives are on their way once the invite is confirmed. | Você digitou {{code}}. Seus 10 trajetos extras chegam assim que o convite for confirmado. | “You typed {{code}}. Your 10 extra trips arrive as soon as the invite is confirmed.” *digitou*: everyday Brazilian verb for typing. |
| Code {{code}} saved | Código {{code}} salvo | “Code {{code}} saved” Mirrors “Código {{code}} adicionado”. |
| Your 10 extra drives are on their way once the invite is confirmed. | Seus 10 trajetos extras chegam assim que o convite for confirmado. | “Your 10 extra trips arrive as soon as the invite is confirmed.” |
| Your invite code is {{code}}. Enter it when you set up MileMint for 10 extra free drives a month. | Seu código de convite é {{code}}. Digite-o ao configurar o MileMint e ganhe 10 trajetos grátis a mais por mês. | “Your invite code is {{code}}. Type it when setting up MileMint and get 10 more free trips a month.” Sent to a friend; você. |
| We couldn’t find that invite. Check the code with your friend. | Não encontramos esse convite. Confira o código com seu amigo. | “We didn’t find that invite. Check the code with your friend.” *Confira*: friendly imperative. |
| That invite has already been used. Ask your friend to send you a new one. | Esse convite já foi usado. Peça ao seu amigo para mandar um novo. | “That invite has already been used. Ask your friend to send a new one.” |
| That’s one of your own invites. Send it to a friend instead. | Esse é um dos seus próprios convites. Mande para um amigo. | “That’s one of your own invites. Send it to a friend.” |
| This Apple Account has already joined with a friend’s invite. | Esta Conta Apple já entrou com o convite de um amigo. | “This Apple Account already joined with a friend’s invite.” *Conta Apple*: Apple’s pt-BR name. |
| 🎉 Your friend’s invite is confirmed | 🎉 O convite do seu amigo foi confirmado | “🎉 Your friend’s invite was confirmed” |
| Your friend’s invite couldn’t be used | Não foi possível usar o convite do seu amigo | “It wasn’t possible to use your friend’s invite” Alert title. |

**Sign-off:** approved, pending an on-device check of the new alert titles.

## Round 8: fair free plan

The free plan is made fair, with no surprise paywall. Personal drives no longer use the 40 free drives. Drives past the limit stay fully visible and sortable, and they are in the spreadsheet; only their value (money) waits for Pro. The limit is stated up front on the welcome screen, on the home meter ("What counts?" sheet) and on the paywall. 26 new lines, 13 removed (the old “locked drive” row, “Kept, locked”/“Unlocked”, the old meter and welcome lines, the old Settings plan line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing says a drive is *locked* or *hidden* any more. A drive past the limit is *saved and shown*, and only its **value** waits for Pro. “Work drives” uses the glossary’s business term. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Saved · value unlocks with Pro | Salvo · valor liberado com o Pro | Row label, shortened in pass 3 from *o valor é liberado com o Pro* to 32 chars. “Saved · value released with Pro.” *liberado* avoids *desbloqueado*, which the new copy no longer uses for trips. |
| Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it. | Salvo. Os trajetos grátis deste mês já foram usados, então um trajeto que volta de pessoal para profissional espera o Pro para mostrar o valor. Os trajetos que já mostram o valor continuam com ele. | “Saved. This month’s free trips were already used, so a trip that goes back from personal to professional waits for Pro to show the value. Trips that already show the value keep it.” |
| {{used}} of {{limit}} free work drives in {{month}} | {{used}} de {{limit}} trajetos profissionais grátis em {{month}} | “{{used}} of {{limit}} free professional trips in {{month}}”. |
| Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited. | Grátis: {{count}} trajetos profissionais por mês. Trajetos pessoais não contam, e um turno conta uma vez por dia. Trajetos adicionados à mão são sempre grátis. Pro: ilimitado. | “Free: 40 professional trips a month. Personal trips don’t count, and a shift counts once a day. Trips added by hand are always free. Pro: unlimited.” *o Pro* with the article, as in the glossary. |
| Personal drives don’t count. Sort one personal and the next drive gets its place. | Trajetos pessoais não contam. Classifique um como pessoal e o próximo trajeto fica com o lugar dele. | “Personal trips don’t count. Classify one as personal and the next trip gets its place.” |
| Past the limit nothing is hidden or lost: every drive is saved, shown in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro. | Além do limite, nada fica escondido nem se perde: todo trajeto é salvo, aparece completo, pode ser classificado e está na sua exportação para planilha. Só o valor espera o Pro. | “Beyond the limit, nothing is hidden or lost: every trip is saved, appears complete, can be classified and is in your spreadsheet export. Only the value waits for Pro.” *planilha* is the Brazilian word. |
| The month’s earliest drives go first, so a drive showing its value keeps it. The count starts again on the 1st. | Os primeiros trajetos do mês vêm primeiro, então um trajeto que mostra o valor continua com ele. A contagem recomeça no dia 1º. | “The month’s first trips come first, so a trip that shows the value keeps it. The count restarts on the 1st.” *dia 1º*: Brazilian usage. |

**Sign-off:** approved, pending an on-device check of the “What counts?” sheet and the long welcome line on a small iPhone.

## Round 6: shift rows

The home list now shows one row per shift, which opens to its drives. A drive that runs past the end of a shift is cut there, and the part after it (the drive home) is left to sort. Shifts can be paused for an errand, started late (“Start shift from 10:40?”), have their times corrected, be undone for a few seconds after ending, and say when they end by themselves at 16 hours or the car has been parked at home a while. 41 new lines (row, legs, time steppers, pause, offers, undo toast, two notifications, a stored place label). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rules for all of them: the shift, drive and sort terms from the glossary; the part after a shift is never called personal (it is *not counted as work unless you choose*); nothing promises a tax result. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| {{count}} drives | one: {{count}} trajeto / many: {{count}} trajetos / other: {{count}} trajetos | “{{count}} trip(s)” *trajeto* as everywhere. |
| {{count}} drives since then look like deliveries. They’ll be added to the shift as business. | one: {{count}} trajeto desde então parece uma entrega. Ele vai entrar no turno como profissional. / many: {{count}} trajetos desde então parecem entregas. Eles vão entrar no turno como profissionais. / other: {{count}} trajetos desde então parecem entregas. Eles vão entrar no turno como profissionais. | “{{count}} trips since then look like deliveries. They will go into the shift as professional.” *profissional* = business in this app. |
| {{purpose}} · {{count}} to sort | one: {{purpose}} · {{count}} para classificar / many: {{purpose}} · {{count}} para classificar / other: {{purpose}} · {{count}} para classificar | “{{purpose}} · {{count}} to classify” |
| After your shift ended · not counted as work unless you say so | Depois do fim do turno · não conta como trabalho, a não ser que você marque | “After the end of the shift · doesn’t count as work unless you mark it” |
| Deliveries | Entregas | “Deliveries” |
| Did your shift start at {{time}}? | Seu turno começou às {{time}}? | “Did your shift start at {{time}}?” |
| Drives join or leave the shift by when they started. A drive past the end is cut there. | Os trajetos entram ou saem do turno pela hora em que começaram. Um trajeto que passa do fim é cortado ali. | “Trips go in or out of the shift by the time they started. A trip that goes past the end is cut there.” |
| During a pause in your shift · not counted as work unless you say so | Durante uma pausa no turno · não conta como trabalho, a não ser que você marque | “During a pause in the shift · doesn’t count as work unless you mark it” |
| End 15 minutes earlier | Antecipar o fim em 15 minutos | “Bring the end forward by 15 minutes” VoiceOver. |
| End 15 minutes later | Adiar o fim em 15 minutos | “Postpone the end by 15 minutes” |
| End your shift? | Encerrar o turno? | “End the shift?” *Encerrar* as “Encerrar turno”. |
| Ended {{time}} | Terminou às {{time}} | “Ended at {{time}}” |
| Hide drives ▴ | Ocultar trajetos ▴ | “Hide trips ▴” 1.4× but the row has room beside it. |
| Hides the drives in this shift | Oculta os trajetos deste turno | “Hides this shift’s trips” |
| It was still on, so MileMint ended it. Drives from now on are left for you to sort. Tap to check the times. | Ele ainda estava ativo, então o MileMint o encerrou. Os trajetos daqui em diante ficam para você classificar. Toque para conferir os horários. | “It was still on, so MileMint ended it. Trips from here on are left for you to classify. Tap to check the times.” |
| Map of the drives in this shift | Mapa dos trajetos deste turno | “Map of this shift’s trips” |
| On shift | Em turno | “On shift” |
| Pause | Pausar | “Pause” |
| Pause the shift for a personal errand | Pausar o turno para resolver algo pessoal | “Pause the shift to sort out something personal” Natural pt-BR for an errand. |
| Paused · {{elapsed}} | Pausado · {{elapsed}} | “Paused · {{elapsed}}” |
| Paused: drives now aren’t counted as work. Resume when you’re back. | Pausado: os trajetos agora não contam como trabalho. Retome quando voltar. | “Paused: trips now don’t count as work. Resume when you come back.” |
| Resume | Retomar | “Resume” |
| Resume the shift | Retomar o turno | “Resume the shift” |
| Shift | Turno | “Shift” |
| Shift ended | Turno encerrado | “Shift ended” |
| Shift on {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | Turno de {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | “Shift of {{date}}, …” |
| Show drives ▾ | Ver trajetos ▾ | “See trips ▾” |
| Shows the drives in this shift | Mostra os trajetos deste turno | “Shows this shift’s trips” |
| Since {{time}} | Desde {{time}} | “Since {{time}}” |
| Start 15 minutes earlier | Antecipar o início em 15 minutos | “Bring the start forward by 15 minutes” |
| Start 15 minutes later | Adiar o início em 15 minutos | “Postpone the start by 15 minutes” |
| Start from {{time}} | Iniciar às {{time}} | “Start at {{time}}” Button, 1.2×. |
| Start shift from {{time}}? | Iniciar o turno a partir das {{time}}? | “Start the shift from {{time}}?” |
| Started {{time}} | Começou às {{time}} | “Started at {{time}}” |
| Still working | Ainda trabalhando | “Still working” |
| Undo | Desfazer | “Undo” Apple wording. |
| Undo ending the shift | Desfazer o fim do turno | “Undo the end of the shift” |
| Where your shift ended | Onde seu turno terminou | “Where your shift ended” |
| You’ve been parked at home for a while and your shift is still on. Drives after it ends aren’t counted as work. | Você está estacionado em casa há um tempo e seu turno continua ativo. Trajetos depois do fim do turno não contam como trabalho. | “You’ve been parked at home for a while and your shift is still on. Trips after the end of the shift don’t count as work.” |
| You’ve been parked at home since {{time}}. Drives after the shift aren’t counted as work. | Você está estacionado em casa desde {{time}}. Trajetos depois do turno não contam como trabalho. | “You’ve been parked at home since {{time}}. Trips after the shift don’t count as work.” |
| Your shift ended after 16 hours | Seu turno terminou após 16 horas | “Your shift ended after 16 hours” |

**Sign-off:** approved, pending an on-device look at the shift row and the undo toast in this language.

## Round 7: tracking health

Tracking health: home card, Settings “Status do rastreamento” row and background notifications. 24 new lines. Terms: *trajeto*, *rastreamento*, *registrar*, *ficar de fora* (as in “Trajetos podem ficar de fora”), você. iOS wording: *Ajustes*, *Localização*, *Localização Precisa* (Apple pt-BR capitalises it). Three passes per line: translate; cold back-translation against the English; culture, honesty and length (titles and the Settings row wrap; buttons ≤1.3× English). Rule for all of them: say plainly what's wrong and the one tap that fixes it, never blame the driver, and say "may" wherever a missed drive isn't certain. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Precise Location is off | Localização Precisa desativada | “Precise Location deactivated”. Apple’s pt-BR toggle name, capitalised as on screen. |
| MileMint only gets a rough position, so drives can’t be measured. In Settings, tap Location and turn on Precise Location. | O MileMint só recebe uma localização aproximada e não consegue medir os trajetos. Nos Ajustes, toque em Localização e ative Localização Precisa. | “MileMint only receives an approximate location and can’t measure the trips. In Settings, tap Location and turn on Precise Location.” |
| Tracking has stopped | O rastreamento parou | “Tracking stopped”. |
| Automatic tracking stopped running, so new drives aren’t being logged. | O rastreamento automático parou de funcionar, então os novos trajetos não estão sendo registrados. | “Automatic tracking stopped working, so new trips aren’t being recorded.” |
| Tracking may have stopped | O rastreamento pode ter parado | “Tracking may have stopped”. |
| No location since {{time}}, in the middle of a drive. | Sem localização desde {{time}}, no meio de um trajeto. | “No location since {{time}}, in the middle of a trip.” |
| Turn tracking back on | Reativar rastreamento | “Reactivate tracking”. Button, 21 chars (1.0×). |
| Tracking stopped {{from}}–{{to}} | Rastreamento parado: {{from}}–{{to}} | “Tracking stopped: {{from}}–{{to}}”. |
| A drive may have been missed | Um trajeto pode ter ficado de fora | “A trip may have been left out”. Same idiom as the existing “Trajetos podem ficar de fora”. |
| About {{distance}} may be missing. Add the missed trip? | Cerca de {{distance}} podem ter ficado de fora. Adicionar o trajeto que faltou? | “About {{distance}} may have been left out. Add the trip that was missing?” Plural agreement works for “11 km”. |
| Your phone moved about {{distance}} between {{from}} and {{to}}, but no drive was logged. Add the missed trip? | Seu celular se deslocou cerca de {{distance}} entre {{from}} e {{to}}, mas nenhum trajeto foi registrado. Adicionar o trajeto que faltou? | “Your phone moved about {{distance}} between {{from}} and {{to}}, but no trip was recorded. Add the trip that was missing?” |
| Not a drive | Não foi um trajeto | “It wasn’t a trip”. Link, 18 chars (1.6×). Sits beside a 17-char button with room on a 375 pt screen; shorter forms (“Não era”) lose the meaning. |
| All good | Tudo certo | “All fine”. Everyday Brazilian. |
| just now | agora mesmo | “just now”. |
| {{count}} minutes ago | one: há {{count}} minuto / many: há {{count}} minutos / other: há {{count}} minutos | “{{count}} minute(s) ago”. *há* + one/many/other (pt treats 0 and 1 as “one”; 0 never shows: under a minute is “agora mesmo”). |
| {{count}} hours ago | one: há {{count}} hora / many: há {{count}} horas / other: há {{count}} horas | “{{count}} hour(s) ago”. |
| {{count}} days ago | one: há {{count}} dia / many: há {{count}} dias / other: há {{count}} dias | “{{count}} day(s) ago”. |
| Tracking check | Status do rastreamento | “Tracking status”. *Status* is common in pt-BR apps. |
| Last location: {{ago}} | Última localização: {{ago}} | “Last location: {{ago}}”. |
| No location yet | Nenhuma localização ainda | “No location yet”. |
| Location access for MileMint is off, so drives aren’t being logged. Tap to turn it back on. | O acesso à localização do MileMint está desativado, então os trajetos não estão sendo registrados. Toque para reativar. | “MileMint’s location access is off, so trips aren’t being recorded. Tap to reactivate.” |
| Drives can’t be measured from a rough position. Tap to fix it. | Com uma localização aproximada não dá para medir os trajetos. Toque para corrigir. | “With an approximate location you can’t measure trips. Tap to fix.” |
| New drives aren’t being logged. Tap to turn tracking back on. | Os novos trajetos não estão sendo registrados. Toque para reativar o rastreamento. | “New trips aren’t being recorded. Tap to reactivate tracking.” |
| No location since {{time}}, in the middle of a drive. Open MileMint to pick it back up. | Sem localização desde {{time}}, no meio de um trajeto. Abra o MileMint para retomar o rastreamento. | “No location since {{time}}, in the middle of a trip. Open MileMint to resume tracking.” |

**Sign-off:** approved.


## Round 8: pre-release fixes

| English | pt-BR | Back-translation | Note |
|---|---|---|---|
| Where your shift started | Onde seu turno começou | Where your shift started | Mirrors the existing "Where your shift ended" line, same length and register. |

## Round 8b: business purpose

| English | pt-BR | Back-translation | Note |
|---|---|---|---|
| Opens trip details | Abre os detalhes do trajeto | Opens the trip details | Matches “Abre os detalhes do trajeto. Toque e segure…”. |
| Usual purpose · tap to change | Finalidade habitual · toque para mudar | Usual purpose · tap to change | *Finalidade* as in “Finalidade profissional”. |
| Purpose needed for your tax records | Falta a finalidade para seus registros fiscais | The purpose for your tax records is missing | Amber box title; wraps once at most. |
| Shows only the drives that need a purpose | Mostra só os trajetos que precisam de finalidade | Shows only the trips that need a purpose | Accessibility hint. |
| {{count}} work drives need a purpose | zero: {{count}} trajetos profissionais precisam de finalidade / one: {{count}} trajeto profissional precisa de finalidade / many: {{count}} trajetos profissionais precisam de finalidade / other: {{count}} trajetos profissionais precisam de finalidade | {{count}} work trip(s) need(s) a purpose | zero/one/many/other, like the file’s other plurals. |
| {{authority}} expects a purpose for every business drive. One tap each. | O {{authority}} exige uma finalidade para cada trajeto profissional. Um toque em cada. | The {{authority}} requires a purpose for each work trip. One tap on each. | Article *O* before the authority, as in “O {{authority}} exige…”. |
| Add purposes › | Adicionar finalidades › | Add purposes › | Natural, fits its place. |
| Every work drive has a purpose ✓ | Todo trajeto profissional tem finalidade ✓ | Every work trip has a purpose ✓ | Natural, fits its place. |
| Show all drives | Ver todos os trajetos | See all trips | Natural, fits its place. |
| {{count}} work drives have no purpose | zero: {{count}} trajetos profissionais estão sem finalidade / one: {{count}} trajeto profissional está sem finalidade / many: {{count}} trajetos profissionais estão sem finalidade / other: {{count}} trajetos profissionais estão sem finalidade | {{count}} work trip(s) is/are without a purpose | Natural, fits its place. |
| {{authority}} expects a purpose for every business drive. Add them before you export? | O {{authority}} exige uma finalidade para cada trajeto profissional. Adicionar antes de exportar? | The {{authority}} requires a purpose for each work trip. Add before exporting? | Infinitive question is the usual iOS-alert register in pt-BR. |
| Export anyway | Exportar mesmo assim | Export anyway | Natural, fits its place. |
| Add purposes | Adicionar finalidades | Add purposes | Natural, fits its place. |
| Usual business purpose | Finalidade profissional habitual | Usual business purpose | Natural, fits its place. |
| Clear | Limpar | Clear | Natural, fits its place. |
| Filled in for work drives that have none, so your tax records are complete. Shift drives use “Deliveries” unless you choose one. | Preenchida nos trajetos profissionais sem finalidade, para seus registros fiscais ficarem completos. Trajetos de turno usam “Entregas”, a menos que você escolha outra. | Filled in on work trips without a purpose, so your tax records are complete. Shift trips use “Deliveries” unless you choose another. | *turno* as in “Auto: em turno”. |
| Filled in for work drives that have none, so your tax records are complete. You can change it on any trip. | Preenchida nos trajetos profissionais sem finalidade, para seus registros fiscais ficarem completos. Você pode mudar em qualquer trajeto. | Filled in on work trips without a purpose, so your tax records are complete. You can change it on any trip. | Natural, fits its place. |
| None: ask me each time | Nenhuma: perguntar sempre | None: always ask | Shorter than “cada vez” and natural. |
| What are most of your work drives for? | Qual a finalidade da maioria dos seus trajetos profissionais? | What is the purpose of most of your work trips? | Rephrased: “Para que são…” sounds clumsy in pt-BR. |
| Tax offices want a purpose for every business drive. We’ll fill this in for you, and you can change it on any trip. | O fisco exige uma finalidade para cada trajeto profissional. Vamos preencher para você, e dá para mudar em qualquer trajeto. | The tax office requires a purpose for each work trip. We’ll fill it in for you, and you can change it on any trip. | *O fisco* is the everyday word for the tax office. |


## Round 8c: work purpose tiles

Back-translations: Choose all that apply. The first you choose is filled in for you. / Filled in for you / Usual. "Default" is rendered with the same word as the existing "Usual purpose" line, so the badge and the trip note match.


## Round 8d: permission preview

The four new lines reuse this file's existing wording: the two iOS button names are taken from the quoted part of "Tap “Allow While Using App”" and "Tap “Change to Always Allow”", "Tap “{{button}}”" keeps that line's frame, and "{{step}} OF 2" is "↑ {{step}} OF 2" without the arrow. No new terms.

## Round 8e: shorter setup

The welcome’s privacy line now names the phone, not the iPhone. Home and work are no longer asked during set-up; the home screen asks “Is this home?” / “Is this work?” instead. The removed set-up lines (“Where’s home?”, “Step 4 · Places”, …) are gone from the dictionary.

| English | pt-BR | Back-translation | Note |
|---|---|---|---|
| No account. Your trips stay on your phone. | Sem cadastro. Seus trajetos ficam no seu celular. | No sign-up. Your trips stay on your cell phone. | Keeps “Sem cadastro” from the old line; *celular* is the everyday pt-BR word. |
| Is this home? {{place}} | Aqui é sua casa? {{place}} | Is this your home? {{place}} | *Casa* as in “Home”. |
| You stopped here for the night. Trips to and from it will read “Home”. | Você passou a noite aqui. Os trajetos que saem ou chegam aqui vão mostrar “Casa”. | You spent the night here. Trips leaving or arriving here will show “Home”. |  |
| Yes, that’s home | Sim, é minha casa | Yes, it’s my home |  |
| No | Não | No |  |
| Is this work? {{place}} | Aqui é seu trabalho? {{place}} | Is this your work? {{place}} | *Trabalho* as in “Work”. |
| You’re often parked here in your work hours. Trips will read “Work”, and drives between home and work are flagged as commutes. | Você costuma estacionar aqui no horário de trabalho. Os trajetos vão mostrar “Trabalho”, e os deslocamentos casa-trabalho serão marcados. | You usually park here in work hours. Trips will show “Work”, and home-work commutes will be marked. | *estacionar* as in the end-shift prompt; *casa-trabalho* as before. |
| Yes, that’s work | Sim, é meu trabalho | Yes, it’s my work |  |


## Round 8f: motion activity

iOS’s own names, with iOS’s capitals: “Movimento e Preparo Físico” (Ajustes), “Permitir” / “Não Permitir” (alert). “Trajeto” as everywhere else. The alert’s own title and body come from iOS (the body is the English NSMotionUsageDescription), so the preview shows them as grey bars.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| One more for accuracy: Motion & Fitness | Mais uma, para mais precisão: Movimento e Preparo Físico | One more, for more accuracy: Motion & Fitness | |
| Lets MileMint tell driving from walking, so a stroll is never logged as a trip. It stays on your phone. | Permite que o MileMint diferencie dirigir de caminhar, para que uma caminhada nunca seja registrada como trajeto. Fica no seu celular. | Lets MileMint tell driving from walking, so a walk is never logged as a trip. It stays on your phone. | |
| Turn on Motion & Fitness | Ativar Movimento e Preparo Físico | Turn on Motion & Fitness | |
| Allow | Permitir | Allow | |
| Don’t Allow | Não Permitir | Don’t Allow | |
| Motion & Fitness | Movimento e Preparo Físico | Motion & Fitness | |
| On | Ativado | On | |
| Off | Desativado | Off | |

## Round 8g: practice tutorial

The practice run after setup (sorting two sample drives, a sample shift) and home’s first, empty screen worded from the setup answers. Business, personal, swipe and shift reuse this file’s existing words.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Swipe on your shift when you start work. Every drive in it counts as {{purpose}}. | Deslize para iniciar o turno quando começar a trabalhar. Todo trajeto nele conta como {{purpose}}. | Swipe to start the shift when you start working. Every trip in it counts as {{purpose}}. | *Deslize para iniciar o turno* as on the shift bar. |
| Drives in your hours ({{days}} {{from}}–{{to}}) are sorted as business for you. | Os trajetos no seu horário ({{days}} {{from}}–{{to}}) são marcados como profissionais para você. | Trips in your hours ({{days}} {{from}}–{{to}}) are marked professional for you. | *horário* as in “Horário de trabalho”. |
| Drives in your work hours are sorted as business for you. | Os trajetos no seu horário de trabalho são marcados como profissionais para você. | Trips in your work hours are marked professional for you. | Natural, fits its place. |
| After each drive, swipe right for business or left for personal. | Depois de cada trajeto, deslize para a direita se for profissional ou para a esquerda se for pessoal. | After each trip, swipe right if professional or left if personal. | Same shape as the auto notes. |
| {{rate}} a mile · {{vehicle}} · {{country}} | {{rate}} por milha · {{vehicle}} · {{country}} | {{rate}} per mile · {{vehicle}} · {{country}} | Natural, fits its place. |
| {{rate}} a km · {{vehicle}} · {{country}} | {{rate}} por km · {{vehicle}} · {{country}} | {{rate}} per km · {{vehicle}} · {{country}} | Natural, fits its place. |
| PRACTICE RUN | TREINO | PRACTICE | Eyebrow; *treino* is the everyday word. |
| This is how a drive shows up after you park. Try sorting it. | É assim que um trajeto aparece depois que você estaciona. Tente classificá-lo. | This is how a trip appears after you park. Try classifying it. | Natural, fits its place. |
| Swipe left for personal | Deslize para a esquerda se for pessoal | Swipe left if personal | Natural, fits its place. |
| Not that way. Try again. | Para o outro lado. Tente de novo. | The other way. Try again. | Natural, fits its place. |
| Sorted as personal ✓ | Marcado como pessoal ✓ | Marked as personal ✓ | Natural, fits its place. |
| Now a work drive. Work drives are worth money back. | Agora um trajeto profissional. Trajetos profissionais valem dinheiro de volta. | Now a professional trip. Professional trips are worth money back. | *Profissional* is this file’s word for business. |
| Swipe right for business | Deslize para a direita se for profissional | Swipe right if professional | Natural, fits its place. |
| Sorted as business: worth {{amount}} | Marcado como profissional: vale {{amount}} | Marked as professional: worth {{amount}} | *vale* as in “Vale {{amount}} se for profissional”. |
| Swipe to start your shift | Deslize para iniciar o seu turno | Swipe to start your shift | Natural, fits its place. |
| Your shift is on ✓ | Seu turno começou ✓ | Your shift has started ✓ | Natural, fits its place. |
| Mark as personal | Marcar como pessoal | Mark as personal | Natural, fits its place. |
| Mark as business | Marcar como profissional | Mark as professional | Natural, fits its place. |
| Practice drive · not saved | Trajeto de treino · não é salvo | Practice trip · not saved | Natural, fits its place. |
| Supermarket | Supermercado | Supermarket | Natural, fits its place. |
| Office | Escritório | Office | Natural, fits its place. |
| Customer | Cliente | Customer | Natural, fits its place. |
| That’s it. Just drive: trips appear here after you park. | Pronto. É só dirigir: os trajetos aparecem aqui depois que você estaciona. | Done. Just drive: trips appear here after you park. | *É só dirigir* as in the empty state before. |
| Start driving | Começar a dirigir | Start driving | Natural, fits its place. |
| Skip | Pular | Skip | Natural, fits its place. |
| Skip the practice run | Pular o treino | Skip the practice | Natural, fits its place. |
| Tutorial | Tutorial | Tutorial | Natural, fits its place. |
| Replay the tutorial | Rever o tutorial | See the tutorial again | Natural, fits its place. |
| Try sorting two sample drives again. Nothing is saved. | Classifique de novo dois trajetos de exemplo. Nada é salvo. | Classify two sample trips again. Nothing is saved. | Natural, fits its place. |
| Replay | Rever | See again | Natural, fits its place. |

## Round 8h: Pro screen

Plain trial terms on the paywall. “Ajustes” is the iPhone Settings app, as in “Abrir Ajustes”. {{date}} is “1 de novembro”, so “termina em {{date}}”. The trial pill and lengths are plurals, so “1 month” / “2 months” read right.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| {{count}} days free | {{count}} dia grátis / {{count}} dias grátis / {{count}} dias grátis | {{count}} day(s) free |  |
| {{count}} months free | {{count}} mês grátis / {{count}} meses grátis / {{count}} meses grátis | {{count}} month(s) free |  |
| {{count}} months | {{count}} mês / {{count}} meses / {{count}} meses | {{count}} month(s) |  |
| {{price}} a month | {{price}} por mês | {{price}} per month | Under the yearly price: the yearly price ÷ 12. |
| Most popular | Mais popular | Most popular | Badge on the yearly plan. |
| We’ll remind you 3 days before it ends. | Vamos te lembrar 3 dias antes de terminar. | We’ll remind you 3 days before it ends. |  |
| {{trial}} free, then {{price}} a year. Cancel any time in Settings. | {{trial}} grátis, depois {{price}} por ano. Cancele quando quiser nos Ajustes. | {{trial}} free, then {{price}} per year. Cancel whenever you like in Settings. |  |
| {{trial}} free, then {{price}} a month. Cancel any time in Settings. | {{trial}} grátis, depois {{price}} por mês. Cancele quando quiser nos Ajustes. | {{trial}} free, then {{price}} per month. Cancel whenever you like in Settings. |  |
| Free trial, then {{price}} a year. Cancel any time in Settings. | Teste grátis, depois {{price}} por ano. Cancele quando quiser nos Ajustes. | Free trial, then {{price}} per year. Cancel whenever you like in Settings. |  |
| Free trial, then {{price}} a month. Cancel any time in Settings. | Teste grátis, depois {{price}} por mês. Cancele quando quiser nos Ajustes. | Free trial, then {{price}} per month. Cancel whenever you like in Settings. |  |
| {{price}} a year. Cancel any time in Settings. | {{price}} por ano. Cancele quando quiser nos Ajustes. | {{price}} per year. Cancel whenever you like in Settings. |  |
| {{price}} a month. Cancel any time in Settings. | {{price}} por mês. Cancele quando quiser nos Ajustes. | {{price}} per month. Cancel whenever you like in Settings. |  |
| Your free month ends on {{date}} | Seu mês grátis termina em {{date}} | Your free month ends on {{date}} | Notification title, 3 days before a one-month trial ends. |
| Your free trial ends on {{date}} | Seu teste grátis termina em {{date}} | Your free trial ends on {{date}} | For other trial lengths. |
| Keep Pro for {{price}} a year, or cancel in Settings. Nothing to do if you’re staying. | Continue com o Pro por {{price}} por ano ou cancele nos Ajustes. Se for ficar, não precisa fazer nada. | Continue with Pro for {{price}} per year or cancel in Settings. If you’re staying, you don’t need to do anything. | Notification body. |
| Keep Pro for {{price}} a month, or cancel in Settings. Nothing to do if you’re staying. | Continue com o Pro por {{price}} por mês ou cancele nos Ajustes. Se for ficar, não precisa fazer nada. | Continue with Pro for {{price}} per month or cancel in Settings. If you’re staying, you don’t need to do anything. |  |

## Round 8i: parking & tolls

Parking and tolls on a drive: the “+ Parking or tolls” fields when adding a trip and on the trip screen, the line on a business trip’s row and under home’s total, the report screen, and each country’s line on what counts. Tax terms stay in English as elsewhere (Mileage Allowance Relief, Car, van and travel expenses, T2125, D2, cents per km, Congestion Charge, ULEZ). The “recorded” lines are for Canada and UK employees, where they aren’t added to the total.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Kept with the drive, but only counted on business drives. | Fica salvo no trajeto, mas só conta nos trajetos profissionais. | Stays saved on the trip, but only counts on work trips. | Add trip / trip details: note under the fields on a personal drive. |
| + Parking or tolls | + Estacionamento ou pedágio | + Parking or toll | Add trip: the link that opens the two fields. Keep the "+". |
| incl. {{amount}} parking & tolls | incl. {{amount}} de estacionamento e pedágios | incl. {{amount}} of parking and tolls | Home hero card, under the total; lower-case start as it continues the figure. |
| Parking & tolls: {{amount}} (recorded) | Estacionamento e pedágios: {{amount}} (registrado) | Parking and tolls: {{amount}} (recorded) | Home hero card where they aren’t added (Canada, UK employees). |
| +{{amount}} parking & tolls | +{{amount}} de estacionamento e pedágios | +{{amount}} of parking and tolls | Trip row detail on a business drive. |
| A claim line for every business trip (date, from, to, purpose, distance, rate, amount, parking and tolls) for your employer’s expense system. | Uma linha de reembolso para cada trajeto profissional (data, origem, destino, finalidade, distância, taxa, valor, estacionamento e pedágios) para o sistema de despesas do seu empregador. | A reimbursement line for each work trip (date, origin, destination, purpose, distance, rate, amount, parking and tolls) for your employer’s expense system. | Report screen: expense-claim export description (was without parking and tolls). |
| Mileage at {{authority}} rates | Quilometragem pelas taxas do {{authority}} | Mileage at the {{authority}} rates | Report screen: the mileage part of the total. |
| Parking | Estacionamento | Parking | Field label and report line. |
| Tolls | Pedágios | Tolls | Field label and report line (bridge and road tolls, Congestion Charge, ULEZ). |
| Included in the total above. {{note}} | Incluído no total acima. {{note}} | Included in the total above. {{note}} | Report screen; note = the country’s line below. |
| Recorded, not included in the total above. {{note}} | Registrado, fora do total acima. {{note}} | Recorded, outside the total above. {{note}} | Report screen (Canada, UK employees); note = the country’s line below. |
| Enter parking as an amount, e.g. 3.50. | Digite o estacionamento como valor, ex.: 3,50. | Type the parking as an amount, e.g. 3,50. | Error under the fields. |
| Enter tolls as an amount, e.g. 3.50. | Digite os pedágios como valor, ex.: 3,50. | Type the tolls as an amount, e.g. 3,50. | Error under the fields. |
| Parking or tolls over {{max}} for one drive? Check the amount. | Mais de {{max}} de estacionamento ou pedágio num só trajeto? Confira o valor. | More than {{max}} of parking or toll on one trip? Check the amount. | Error; max = £1,000.00 / $1,000.00. |
| {{what}}, in {{currency}} | {{what}}, em {{currency}} | {{what}}, in {{currency}} | VoiceOver label of a money box, e.g. "Parking, in GBP". |
| Business parking and tolls are deductible on top of the mileage rate. Parking at your regular workplace isn’t, and fines never are. | Estacionamento e pedágios profissionais são dedutíveis além da taxa por milha. O estacionamento no seu local de trabalho fixo não é, e multas nunca são. | Work parking and tolls are deductible on top of the per-mile rate. Parking at your fixed workplace isn’t, and fines never are. | US note under the fields. |
| Parking at your regular place of work and tolls on your commute are not deductible. | Estacionamento no seu local de trabalho fixo e pedágios no trajeto casa-trabalho não são dedutíveis. | Parking at your fixed workplace and tolls on the home-work trip aren’t deductible. | US report guidance (PDF stays English). |
| Self-employed: business parking, tolls and Congestion Charge or ULEZ charges are claimed on top of the mileage rate. Parking and traffic fines never are. | Autônomos: estacionamento, pedágios e cobranças de Congestion Charge ou ULEZ profissionais entram além da taxa por milha. Multas de estacionamento e de trânsito nunca entram. | Self-employed: work parking, tolls and Congestion Charge or ULEZ charges go on top of the per-mile rate. Parking and traffic fines never do. | UK self-employed note under the fields. |
| Parking and tolls aren’t part of Mileage Allowance Relief. Claim them from your employer, or as a separate employment expense if they don’t repay them. Fines never count. | Estacionamento e pedágios não fazem parte do Mileage Allowance Relief. Peça o reembolso ao seu empregador, ou declare como despesa de trabalho à parte se ele não reembolsar. Multas nunca contam. | Parking and tolls aren’t part of Mileage Allowance Relief. Ask your employer to reimburse them, or declare them as a separate work expense if they don’t. Fines never count. | UK employee note under the fields. |
| Self-employed: parking, tolls and Congestion Charge or ULEZ charges on business journeys are added on top of the mileage figure, in the same Car, van and travel expenses box. Parking and traffic fines are never allowable. | Autônomos: estacionamento, pedágios e cobranças de Congestion Charge ou ULEZ em trajetos profissionais são somados ao valor da quilometragem, no mesmo campo Car, van and travel expenses. Multas de estacionamento e de trânsito nunca são dedutíveis. | Self-employed: parking, tolls and Congestion Charge or ULEZ charges on work trips are added to the mileage amount, in the same Car, van and travel expenses field. Parking and traffic fines are never deductible. | UK report guidance (PDF stays English). |
| Employees: parking and tolls are not part of Mileage Allowance Relief. They are listed separately, to claim from your employer or as a separate employment expense. | Empregados: estacionamento e pedágios não fazem parte do Mileage Allowance Relief. Eles aparecem à parte, para pedir reembolso ao empregador ou declarar como despesa de trabalho separada. | Employees: parking and tolls aren’t part of Mileage Allowance Relief. They appear separately, to ask the employer to reimburse or declare as a separate work expense. | UK report guidance (PDF stays English). |
| Recorded apart from the per-km figure. Self-employed: business parking is usually claimed in full. Ask your accountant about tolls. | Registrados à parte do valor por km. Autônomos: o estacionamento profissional costuma ser deduzido integralmente. Sobre pedágios, pergunte ao seu contador. | Recorded apart from the per-km amount. Self-employed: work parking is usually deducted in full. About tolls, ask your accountant. | Canada note under the fields. |
| Parking and tolls are listed separately and not added to the per-km figure. Self-employed: business parking fees are deducted in full on T2125, not reduced to your business-use share. Ask your accountant whether your tolls can be claimed. | Estacionamento e pedágios aparecem à parte e não são somados ao valor por km. Autônomos: o estacionamento profissional é deduzido integralmente no T2125, sem reduzir pela sua parte de uso profissional. Pergunte ao seu contador se os pedágios podem ser deduzidos. | Parking and tolls appear separately and aren’t added to the per-km amount. Self-employed: work parking is deducted in full on the T2125, without reducing it by your work-use share. Ask your accountant whether the tolls can be deducted. | Canada report guidance (PDF stays English). |
| Work parking and tolls aren’t covered by cents per km, so they’re claimed separately. Not parking at your regular workplace, or tolls on the way there. | O cents per km não cobre estacionamento nem pedágios do trabalho, então eles são declarados à parte. Exceto estacionamento no seu local de trabalho fixo ou pedágios no caminho até lá. | Cents per km doesn’t cover work parking or tolls, so they’re declared separately. Except parking at your fixed workplace or tolls on the way there. | Australia note under the fields. |
| Parking fees and tolls for work trips aren’t covered by the cents per km rate. Claim them separately: individuals as Work-related travel expenses (D2), sole traders with business expenses. Not parking at your regular workplace, or tolls between home and work. | O cents per km não cobre estacionamento nem pedágios de trajetos de trabalho. Declare à parte: pessoas físicas, em Work-related travel expenses (D2); sole traders (autônomos), com as despesas do negócio. Exceto estacionamento no seu local de trabalho fixo ou pedágios entre casa e trabalho. | Cents per km doesn’t cover parking or tolls on work trips. Declare them separately: individuals in Work-related travel expenses (D2); sole traders (self-employed) with business expenses. Except parking at your fixed workplace or tolls between home and work. | Australia report guidance (PDF stays English). |

## Round 9: tabs

The app now opens on four tabs (Home, Drives, Money, Settings) instead of one long home screen with a menu. The menu’s lines (Menu, Close menu, Free plan, ★ Pro · unlimited drives, Work hours, places and reminders) are gone. “Início” as in Brazilian iPhone apps; “Casa” stays for the place. “Aba” is the Brazilian word for a tab.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Home (tab) | Início | Start | Tab bar label for the first tab. Key is "Home (tab)" so it isn’t the place “Home” (English shows “Home”). Short: under an icon. |
| Drives | Trajetos | Journeys | Tab bar label: every drive, by month. Same word as the app’s “drives”. |
| Money | Dinheiro | Money | Tab bar label: the tax year’s money back, month by month, Pro and the tax screens. One short word. |
| Opens the Money tab | Abre a aba Dinheiro | Opens the Money tab | VoiceOver hint on home’s green card, which opens the Money tab. |
| To sort | Para classificar | To classify | Home: heading over the drives still to sort as business or personal. |
| All drives sorted ✓ | Todos os trajetos classificados ✓ | All journeys classified ✓ | Home, when nothing is left to sort; the row opens the Drives tab. |
| See all drives › | Ver todos os trajetos › | See all journeys › | Home, next to the line above: opens the Drives tab. Keep the “›”. |
| By month | Por mês | By month | Money tab: heading over this tax year’s months. |
| Earlier tax years | Anos fiscais anteriores | Previous tax years | Money tab: heading over the years before this one. |
| Tracking | Rastreamento | Tracking | Settings group heading, small capitals: the tracking check, work hours and places. |
| Driving & tax | Trajetos e impostos | Journeys and taxes | Settings group heading: country, vehicles, how drives start, mileage pay, client privacy. |
| Pro & friends | Pro e amigos | Pro and friends | Settings group heading: the Pro plan and inviting friends. |
| Backup & data | Backup e dados | Backup and data | Settings group heading: iCloud backup and restore. |
| Notifications | Notificações | Notifications | Settings group heading: the Sunday reminder. |
| About & support | Sobre e suporte | About and support | Settings group heading: language, the tutorial, help and feedback. |
| Automatic tracking runs on your iPhone. Add a trip from the Drives tab to try the app here. | O rastreamento automático funciona no seu iPhone. Adicione um trajeto na aba Trajetos para testar o app aqui. | Automatic tracking works on your iPhone. Add a journey in the Journeys tab to try the app here. | Web preview only (no tracking there): the + moved from home to the Drives tab. Name the tab as its label is translated. |
| Add a drive you missed | Adicionar um trajeto que faltou | Add a journey that was missing | Drives tab: dashed row under the list, opens Add missed trip. A backup for drives tracking missed. |
| Varies by day | Varia conforme o dia | Varies according to the day | Settings → Work hours heading, on the right, when the days have different hours (otherwise e.g. "Mon–Fri 09:00–17:00", or Off). |
| Free · {{used}} of {{limit}} | Grátis · {{used}} de {{limit}} | Free · {{used}} of {{limit}} | Settings → MileMint Pro heading, on the right: this month’s free work drives used, e.g. "Free · 3 of 40". Short. |
