# Brazilian Portuguese (pt-BR): accuracy review (check 2 of 3)

Scope: every entry in `src/i18n/locales/pt-BR.ts` (750 keys, including every form of every plural object). I back-translated each line into English on its own, then compared it with the English key. I checked unclear lines against `TRANSLATOR-NOTES.md` and the source files, including `app/add-trip.tsx`, `app/pro.tsx`, `app/settings.tsx`, `app/index.tsx`, `app/compare.tsx`, `app/milestones.tsx`, `components/tax-countdown.tsx`, `components/header-menu.tsx`, `domain/reminders.ts`, `domain/deadlines.ts` and `domain/format.ts`.

Also checked:
- Placeholders, `<b>` tags and plural objects (`npx jest src/i18n` passes).
- Glossary consistency: trajeto, profissional / pessoal, classificar, deslizar, turno, ano fiscal, taxa, relatório, Ajustes, Apagar, OK, Seja Pro / Assinar o Pro, plano grátis.
- Money and tax wording: "estimated" is kept everywhere the English has it, and no line promises more than the English does.
- How the weekly reminders pair up (title and body, and the miles and km titles), so the jokes still work in both units.

Result: **24 strings changed across 22 keys.** `npx jest src/i18n` passes.

## Changes

| English | Before | After | Why |
|---|---|---|---|
| {{price}} per month / per year is charged to your Apple Account and renews automatically unless cancelled… (2 keys) | O valor de {{price}} por mês é cobrado… e renovado automaticamente, a menos que seja cancelado… | {{price}} por mês são cobrados na sua Conta Apple, e a assinatura é renovada automaticamente, a menos que seja cancelada… | This back-translated as "the amount is renewed… unless the amount is cancelled". The subscription is what renews and gets cancelled. This is legal billing text, so it needs to be exact. |
| After the {{trial}}, {{price}} per month / per year is charged… (2 keys) | …o valor de {{price}} por mês é cobrado… e renovado… cancelado… | …{{price}} por mês são cobrados…, e a assinatura é renovada… cancelada… | Same problem as above. |
| Enter the miles driven, e.g. 12.5. | ex.: 12.5. | ex.: 12,5. | `parseMiles` now accepts a decimal comma. Brazilians write 12,5, and "12.5" could read as twelve thousand five hundred. |
| Enter the kilometres driven, e.g. 12.5. | ex.: 12.5. | ex.: 12,5. | Same reason. |
| 🔒 GPS runs only while you’re driving. … | O GPS só funciona enquanto você dirige. | O GPS só fica ligado enquanto você dirige. | "só funciona" reads as "only works", as if the GPS were faulty otherwise. The English is a privacy and battery point: the GPS is only on while driving. |
| GPS only runs while you drive. Parked, MileMint sleeps. | O GPS só funciona… | O GPS só fica ligado… | Same reason. |
| 40 automatic drives a month (…), plus unlimited trips by hand. Go Pro any time for unlimited. (2 keys) | …para ter tudo ilimitado. | …para ter trajetos automáticos ilimitados. | "Everything unlimited" overstated the offer. Manual trips are already unlimited, and Pro unlimits only automatic drives. |
| Unless a rule says otherwise (…). Swipe left on any that were personal; only business drives should be claimed. | só trajetos profissionais devem ser declarados | só trajetos profissionais podem ser declarados | "devem ser declarados" reads as an obligation ("business trips must be declared"). The English means only business trips may be claimed. |
| Employees: if your employer pays less than 55p a mile…  You can go back 4 tax years. | Dá para voltar até 4 anos fiscais. | Dá para pedir referente a até 4 anos fiscais anteriores. | "Voltar 4 anos" (go back 4 years) was vague and didn't say what you go back for. Now it clearly means claiming for up to 4 earlier tax years. |
| Employees: claim work-related car expenses at D1 on your return… | despesas com carro no trabalho | despesas com o carro relacionadas ao trabalho | This back-translated as "car expenses at work". The fix matches the ATO category "Work-related car expenses". |
| I use MileMint to log my business mileage automatically. … | quilometragem de trabalho | quilometragem profissional | Glossary consistency. "business mileage" is "quilometragem profissional" everywhere else. |
| {{distance}} is more than one trip should be. Check for an extra digit. | Veja se não sobrou um dígito. | Veja se não tem um dígito a mais. | "Sobrou um dígito" (a digit was left over) is unclear. "Um dígito a mais" means "an extra digit". |
| By road, from Apple Maps | Distância pela rua, do Apple Maps | Pelas ruas, segundo o Apple Maps | "Pela rua" (singular) is odd and "do Apple Maps" was unclear. The new wording says the distance is measured along the roads, according to Apple Maps. It is still a small label. |
| Added manually | Adicionado à mão | Adicionado manualmente | The English says "manually". "Manualmente" is the normal app word, and "à mão" suggests "handmade". The translator's "à mão" stays for the English "by hand" lines. |
| {{date}} · {{distance}} · Added manually | …Adicionado à mão | …Adicionado manualmente | Same reason. |
| Free plan: {{count}} automatic drives a month, unlimited manual trips and CSV export. (all 3 forms) | trajetos à mão ilimitados | trajetos manuais ilimitados | Same reason ("manual"). |
| Add a missed trip (screen-reader label in the header menu) | Adicionar trajeto | Adicionar trajeto que faltou | "Missed" was dropped. This is a screen-reader label, so length doesn't matter. |
| I’ll swipe each drive myself. | Prefiro deslizar cada trajeto. | Prefiro deslizar cada trajeto por conta própria. | "Myself" was dropped. This option means the user sorts trips by hand instead of using work hours. "Por conta própria" works for any gender. |
| Share MileMint on WhatsApp and more | …no WhatsApp e mais | …no WhatsApp e em outros apps | "e mais" was an unfinished English calque. |

## iOS wording (Unsure list item 1)

These are checked against the pt-BR iOS strings I know (iOS 13 and later). I accept all of them as written:

| English (iOS) | pt-BR | Verdict |
|---|---|---|
| Allow While Using App | Permitir Durante o Uso do App | Correct. Apple's pt-BR alert button, in title case. |
| Allow Once | Permitir Uma Vez | Correct. This key isn't in the dictionary at the moment. |
| Change to Always Allow | Alterar para Sempre Permitir | Correct. |
| Keep Only While Using | Manter Apenas Durante o Uso | Correct. This key isn't in the dictionary at the moment. |
| While Using the App / short "While Using" | Durante o Uso do App / Durante o Uso | Correct. The longer form is the option in the Location list, and the short form is the value shown on the app's Settings row. |
| Ask Next Time Or When I Share | Perguntar na Próxima Vez ou Quando Eu Compartilhar | Correct for current iOS. |
| ALLOW LOCATION ACCESS | PERMITIR ACESSO À LOCALIZAÇÃO | Correct. |
| Always / Never / Location | Sempre / Nunca / Localização | Correct. |
| Settings → Notifications | Ajustes → Notificações | Correct. In pt-BR the iOS Settings app is "Ajustes". |
| Open Settings | Abrir Ajustes | This is the app's own button, and it matches Apple's term. |

I couldn't check these on a real device. The third check should compare them with a pt-BR iPhone screen.

## Other Unsure items

- **2 (12.5 with a dot):** resolved. The comma is now accepted, so the examples are 12,5.
- **3 (Profissional vs "a trabalho"):** I kept "Profissional". It avoids clashing with the saved place "Trabalho", and it reads correctly in every sentence I checked. The Romanian review found "driving *to* work" (commuting) in 10 strings. That doesn't happen here, because "em trajetos profissionais" can't be read as commuting.
- **4 (masculine article before {{authority}}):** "o HMRC / o IRS / o ATO" read naturally, since Brazilians default to the masculine for acronyms. "A CRA" (Agência) in the written-out lines is fine too. One small point: the placeholder lines say "o {{authority}}" even when the authority is CRA ("o CRA"). Most readers won't notice, and fixing it would need different strings per country.
- **5 (Conferir distância perdida):** accepted. It doesn't name a unit and the meaning is clear.
- **6 ({{label}}: conquista obtida):** accepted. `label` can be money, a distance or a habit title, and the noun fixes the gender agreement for all three.
- **7 (Your driving → Ao volante):** accepted, with a note. The meaning is right for the section header, but it reads a little oddly for cyclists. "Seus veículos e turnos" would be more literal if the third check prefers that.
- **8–10:** accepted ("Moto ou scooter", "deixe a dedução anotada", "Relatório PDF para o fisco"). None of them promises a saving.
- **11–12 (length):** layout isn't part of this check, so I left these for the on-screen check.

## Checked and left as is

- `{{achievement}} … The mileage app that counts every mile.` → "…que conta cada trajeto", and `…Every mile counted, automatically.` → "Cada trajeto contado". These are small drifts (mile → trip) made on purpose, so the same string works for km users. I accepted them.
- `Add a missed drive` (tax countdown button) and `Add missed trip` (screen title) → "Adicionar trajeto". "Missed" is dropped to keep the button short. Here the meaning is clear from context.
- `{{count}} drives are waiting to be unlocked` → "{{count}} trajetos esperando para ser desbloqueados". There's no verb, but it reads fine as a status line.
- `See what each business drive saves you at tax time.` → "…quanto cada trajeto profissional vale…". This is a softening ("is worth" rather than "saves you"), and that's welcome under rule 9.
- `Mileage log export (CSV)` → "Exportar registro…" (an infinitive). It reads correctly as a feature name.

## Unresolved

1. **A count of 0 takes the `one` form.** CLDR pt puts 0 (and 0.x after `Math.round` gives 0) in `one`, so `{{distance}} miles` in `app/compare.tsx` would show "0 milha". Standard Brazilian usage is "0 milhas" for zero. Most other plural keys never get 0 (`{{count}} selected`, the countdowns and "Sort {{count}} drives" all check for it first). Fixing this needs a code change (for example an explicit `zero` / `=0` case) and can't be done in the dictionary.
2. The iOS wording needs a check on a device (see above).
3. "Apple Maps" stays as "Apple Maps". On a pt-BR iPhone the app is called "Mapas", but Brazilians commonly say "Apple Maps". I left it for the third check.
