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
