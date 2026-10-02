/*
 * "How much could you claim?" calculator. Runs only in the browser; nothing is sent.
 * Rates (check each year and update RATES below):
 *   UK  HMRC approved mileage rates from 6 Apr 2026: 55p first 10,000 business miles, then 25p.
 *   US  IRS standard mileage rate 2026: 72.5c Jan-Jun, 76c from 1 Jul.
 *   CA  CRA reasonable per-km allowance 2026: 73c first 5,000 km, then 67c (employee allowance).
 *   AU  ATO cents per km 2026-27: 91c per km, max 5,000 km per car.
 */
(function () {
  'use strict';

  var RATES = {
    UK: { unit: 'mile', units: 'miles', locale: 'en-GB', currency: 'GBP' },
    US: { unit: 'mile', units: 'miles', locale: 'en-US', currency: 'USD' },
    CA: { unit: 'km', units: 'km', locale: 'en-CA', currency: 'CAD' },
    AU: { unit: 'km', units: 'km', locale: 'en-AU', currency: 'AUD' },
  };

  var form = document.getElementById('calc');
  var out = document.getElementById('result');
  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  // Guess a starting country from the browser language (no network, nothing stored).
  var lang = (navigator.language || '').toLowerCase();
  var guess = /-us$/.test(lang) ? 'US' : /-ca$/.test(lang) ? 'CA' : /-au$/.test(lang) ? 'AU' : null;
  if (guess) form.querySelector('input[name="country"][value="' + guess + '"]').checked = true;

  function money(n, c, dp) {
    return new Intl.NumberFormat(RATES[c].locale, {
      style: 'currency', currency: RATES[c].currency,
      minimumFractionDigits: dp || 0, maximumFractionDigits: dp || 0,
    }).format(n);
  }
  function num(n) { return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(n); }
  function row(label, value) {
    var tr = document.createElement('tr');
    var a = document.createElement('td'); a.textContent = label;
    var b = document.createElement('td'); b.textContent = value;
    tr.appendChild(a); tr.appendChild(b);
    return tr;
  }
  function val(id) { var v = parseFloat(document.getElementById(id).value); return isFinite(v) && v > 0 ? v : 0; }

  function update() {
    var c = form.querySelector('input[name="country"]:checked').value;
    var period = form.querySelector('input[name="period"]:checked').value;
    var R = RATES[c];

    form.querySelectorAll('[data-unit-plural]').forEach(function (el) { el.textContent = R.units; });
    $('[data-period-label]', form).textContent = period === 'week' ? 'a week' : 'a year';
    $('[data-weeks-wrap]', form).hidden = period !== 'week';
    $('[data-ca-only]', form).hidden = c !== 'CA';

    var d = val('distance');
    var weeks = Math.min(52, val('weeks') || 0);
    var yearly = period === 'week' ? d * weeks : d;

    var rows = $('[data-rows]', out);
    rows.textContent = '';
    var total = 0, note = '', headline = 'Your estimated claim for a year';

    if (c === 'UK') {
      var first = Math.min(yearly, 10000), rest = Math.max(0, yearly - 10000);
      total = first * 0.55 + rest * 0.25;
      rows.appendChild(row(num(first) + ' miles at 55p', money(first * 0.55, c)));
      if (rest) rows.appendChild(row(num(rest) + ' miles at 25p', money(rest * 0.25, c)));
      note = "HMRC approved mileage rates from 6 April 2026, for cars and vans: 55p a mile for the first 10,000 business miles in the tax year (6 April to 5 April), then 25p. Self-employed: this is your simplified-expenses figure. Employees: if your employer pays less, you may claim the difference as Mileage Allowance Relief.";
    } else if (c === 'US') {
      total = yearly * 0.76;
      rows.appendChild(row(num(yearly) + ' miles at 76¢', money(total, c)));
      rows.appendChild(row('Same miles at 72.5¢ (Jan–Jun 2026 rate)', money(yearly * 0.725, c)));
      note = 'IRS standard mileage rate for business use: 76¢ a mile from 1 July 2026 (72.5¢ from January to June 2026). Miles driven in the first half of 2026 use the lower rate. Commuting miles are not deductible.';
    } else if (c === 'CA') {
      headline = 'At CRA’s per-km allowance rate, a year';
      var f = Math.min(yearly, 5000), r = Math.max(0, yearly - 5000);
      total = f * 0.73 + r * 0.67;
      rows.appendChild(row(num(f) + ' km at 73¢', money(f * 0.73, c)));
      if (r) rows.appendChild(row(num(r) + ' km at 67¢', money(r * 0.67, c)));
      note = 'These are CRA’s 2026 rates for a reasonable employee allowance (73¢ a km for the first 5,000 km, then 67¢): what an employer can pay you tax-free. If you’re self-employed, you claim your actual vehicle costs multiplied by your business-use percentage, which needs a logbook of business and total km.';
      var tk = val('totalkm'), costs = val('costs');
      if (tk && costs) {
        var pct = Math.min(1, yearly / tk);
        rows.appendChild(row('Business use (' + num(yearly) + ' of ' + num(tk) + ' km)', Math.round(pct * 100) + '%'));
        rows.appendChild(row('Self-employed: costs × business use', money(costs * pct, c)));
      }
    } else {
      var claim = Math.min(yearly, 5000);
      total = claim * 0.91;
      rows.appendChild(row(num(claim) + ' km at 91c', money(total, c)));
      if (yearly > 5000) rows.appendChild(row(num(yearly - 5000) + ' km over the 5,000 km cap', money(0, c)));
      note = 'ATO cents per kilometre method for 2026–27: 91c a km, up to 5,000 business km per car (a maximum of ' + money(4550, c) + '). Above 5,000 km, the logbook method may give you a bigger claim.';
    }

    $('[data-headline]', out).textContent = headline;
    $('[data-total]', out).textContent = money(total, c);
    rows.insertBefore(row('Business ' + R.units + ' a year', num(yearly)), rows.firstChild);
    $('[data-note]', out).textContent = note;
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', function (e) { e.preventDefault(); update(); });
  update();
})();
