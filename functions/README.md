# Cloudflare Pages Functions (`functions/`)

Server code for milesprout.app. Cloudflare Pages runs every `.js` file in this folder as a route, so it must stay at the **repository root** next to `website/` (not inside it).

| File | Route | What it does |
|---|---|---|
| `api/waitlist.js` | `POST /api/waitlist` | Adds an email to the pre-launch waitlist in a D1 database bound as `DB` |

Functions only run when the site is deployed with **Cloudflare Pages** (Git integration, or `npx wrangler pages deploy website`). The Workers static-assets flow in `wrangler.jsonc` serves `website/` only and does not run them.

## `POST /api/waitlist`

- Takes JSON (the site's script) or a plain form post (no JavaScript). Fields: `email` (required), `consent` (required: `yes`), `segment`, `country`, `source`, and for testers `group` and `device` (all optional, checked against fixed lists or cleaned; see Founding testers below) and `company` (a honeypot: if filled in, the reply says OK and nothing is stored).
- Email is trimmed and lowercased, at most 254 characters, and must look like `name@domain.tld`.
- `INSERT OR IGNORE`, so signing up twice looks exactly like signing up once.
- Replies: JSON `{"ok":true}`, or `400 {"ok":false,"error":"email"|"consent"}`; form posts get a 303 to `/waitlist?joined=1#joined` or `/waitlist?error=1#error` (`/testers?...` for tester sign-ups).
- No `DB` binding: `503` with a message saying so.
- Stores only `email, segment, country, consent_at, source, created_at`. No IP address, no user agent.

Tests (Node 22, fake D1): `node --test tests/waitlist-function.test.mjs`

## Set up the database (once)

1. Cloudflare dashboard → **Storage & Databases → D1 → Create**. Name it `milesprout-waitlist`. If it offers a location or jurisdiction, pick **EU** / Western Europe.
2. Open the database → **Console**, paste this and run it:

   ```sql
   CREATE TABLE IF NOT EXISTS waitlist (
     email TEXT PRIMARY KEY,
     segment TEXT,
     country TEXT,
     consent_at TEXT,
     source TEXT,
     created_at TEXT
   );
   ```

3. **Workers & Pages →** the milesprout Pages project → **Settings → Bindings → Add → D1 database**. Variable name **`DB`**, database `milesprout-waitlist`. Add it for Production (and Preview if you want previews to work).
4. **Deployments →** retry the latest deployment (or push a commit) so the binding takes effect.
5. Check: sign up on the live site, then in the D1 Console run `SELECT count(*) FROM waitlist;`.

## Export the list

D1 Console: `SELECT * FROM waitlist ORDER BY created_at;` → **Download** (CSV). Or from a terminal: `npx wrangler d1 execute milesprout-waitlist --remote --command "SELECT * FROM waitlist ORDER BY created_at" --json`.

### Founding testers

`/testers` posts to the same function with `source=testers`, an optional `group` and an optional `device`. The table is unchanged (no migration):

- **Group.** Share the page as `https://milesprout.app/testers?g=fb-leeds-couriers`. The site's script copies `g` into the form (without JavaScript the function reads it from the page address in the `Referer`). It's cleaned to lowercase a–z, 0–9 and hyphens, at most 40 characters, and stored in `source` as `testers:<group>`, or just `testers` with no group.
- **iPhone model.** Stored in `segment` after a `|`: `parcels|12-to-15`, or `|older` if they didn't say what they drive for. Values: `15pro-or-newer`, `12-to-15`, `older`, `not-sure`. Waitlist rows never contain `|`.
- No-JS posts from the page are redirected to `/testers?joined=1#joined` or `/testers?error=1#error` (keeping `g=` on the error, for the retry).

All testers, oldest first:

```sql
SELECT * FROM waitlist WHERE source LIKE 'testers%' ORDER BY created_at;
```

Sign-ups per group (`(none)` = no `?g=` in the link):

```sql
SELECT COALESCE(NULLIF(substr(source, 9), ''), '(none)') AS grp, count(*) AS testers
FROM waitlist WHERE source LIKE 'testers%' GROUP BY grp ORDER BY testers DESC;
```

Testers with their drive type and iPhone split out:

```sql
SELECT email, source,
  CASE WHEN instr(segment, '|') > 0 THEN NULLIF(substr(segment, 1, instr(segment, '|') - 1), '') ELSE segment END AS drives_for,
  CASE WHEN instr(segment, '|') > 0 THEN substr(segment, instr(segment, '|') + 1) END AS iphone,
  country, created_at
FROM waitlist WHERE source LIKE 'testers%' ORDER BY created_at;
```

To delete someone (privacy request or unsubscribe): `DELETE FROM waitlist WHERE email = 'name@example.com';`

The privacy policy (`website/privacy.html`, section 9) promises: the launch email (other launch news only with consent), kept until 12 months after launch or until they unsubscribe or ask. Delete the table's rows when that time is up, and put an unsubscribe link in every email you send.
