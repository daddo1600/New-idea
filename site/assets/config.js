/*
 * MileMint website settings. Edit this file by hand; no build step.
 * Every page loads it before main.js, so changes apply site-wide.
 */

/* ------------------------------------------------------------------
 * 1. WAITLIST FORM
 *
 * FORM_ENDPOINT: the URL the waitlist form sends sign-ups to.
 *   Leave it '' (empty) until your email provider is set up: the form
 *   then shows "Sign-ups open soon" instead of failing.
 *
 * FORM_PROVIDER: 'mailerlite' or 'generic'.
 *
 * MailerLite (recommended, free up to 1,000 subscribers):
 *   1. Subscribers > Fields: add two text fields, "country" and "work".
 *   2. Forms > Embedded forms > Create. Add the fields Email, country, work.
 *      Turn ON double opt-in (Settings of the form) so addresses are confirmed.
 *   3. Open the form's "HTML code" and copy the <form action="..."> URL. It looks like
 *      https://assets.mailerlite.com/jsonp/1234567/forms/987654321098765432/subscribe
 *   4. Paste it below, set FORM_PROVIDER = 'mailerlite', and also paste the same URL
 *      into the action="" attribute of the <form> in index.html and join.html
 *      (that is the fallback for visitors with JavaScript switched off).
 *   Field names the form sends (MailerLite's own names, so no mapping needed):
 *      email, fields[country], fields[work]
 *   MailerLite does not return CORS headers to other sites, so in 'mailerlite' mode the
 *   form posts with mode:'no-cors' and treats a delivered request as success.
 *
 * Kit (ConvertKit):  action looks like https://app.kit.com/forms/1234567/subscriptions
 *   Set FORM_PROVIDER = 'generic' and FIELD_NAMES.email = 'email_address'.
 *   Create custom fields "country" and "work" in Kit; keep fields[country] / fields[work].
 * Buttondown: action looks like https://buttondown.com/api/emails/embed-subscribe/YOURNAME
 *   Set FORM_PROVIDER = 'generic'; FIELD_NAMES.email stays 'email'. Buttondown ignores
 *   unknown fields; use metadata__country / metadata__work if you want to keep them.
 * Any other service (Formspree, Netlify-style endpoints, your own): 'generic'.
 *   The form is sent as application/x-www-form-urlencoded with Accept: application/json.
 *   Any 2xx response is success.
 * ------------------------------------------------------------------ */
const FORM_ENDPOINT = '';
const FORM_PROVIDER = 'mailerlite'; // 'mailerlite' | 'generic'

/* Names of the fields as your provider expects them. */
const FIELD_NAMES = {
  email: 'email',
  country: 'fields[country]',
  work: 'fields[work]',
};

/* ------------------------------------------------------------------
 * 2. APP STORE BUTTON
 * While APP_STORE_LIVE is false, every App Store button reads
 * "App Store — coming soon" and points to the waitlist.
 * On launch day: set APP_STORE_LIVE = true. Buttons then link to
 * APP_STORE_URL and read "Download on the App Store".
 * (Only use Apple's official badge artwork once the app is live, and
 * follow Apple's marketing guidelines when you do.)
 * ------------------------------------------------------------------ */
const APP_STORE_LIVE = false;
const APP_STORE_URL = 'https://apps.apple.com/app/id6817748981';

/* 3. Used by the share button after someone joins. */
const SITE_URL = 'https://milemint.app/';
const FOUNDING_TOTAL = 1000; // the founders count itself lives in data/founders.json
