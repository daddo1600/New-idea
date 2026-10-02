/*
 * Waitlist form (index.html and join.html): <form data-waitlist>.
 * Settings live in assets/config.js (FORM_ENDPOINT, FORM_PROVIDER, FIELD_NAMES).
 * Without JavaScript the form still posts natively to its action="" attribute.
 */
(function () {
  'use strict';

  var endpoint = (typeof FORM_ENDPOINT !== 'undefined' && FORM_ENDPOINT) || '';
  var provider = (typeof FORM_PROVIDER !== 'undefined' && FORM_PROVIDER) || 'generic';
  var names = (typeof FIELD_NAMES !== 'undefined' && FIELD_NAMES) || {};
  var shareUrl = (typeof SITE_URL !== 'undefined' && SITE_URL) || location.origin + '/';

  var TEXT = {
    soon: "Sign-ups open soon. We're setting up the list. Please check back in a few days, or email hello@milemint.app and we'll add you by hand.",
    sending: 'Joining…',
    error: "Sorry, that didn't go through. Check your connection and try again, or email hello@milemint.app.",
    badEmail: 'Please enter a valid email address.',
    consent: 'Please tick the box so we can email you. It’s the only thing we use your address for.',
    copied: 'Link copied. Paste it to a driver friend.',
    shareText: "I've joined the MileMint waitlist: an iPhone mileage tracker that tells you if a mile was missed. No account, trips stay on your phone.",
  };

  function setStatus(el, kind, msg) {
    el.className = 'status ' + kind;
    el.textContent = msg;
    el.hidden = false;
  }

  document.querySelectorAll('form[data-waitlist]').forEach(function (form) {
    var status = form.querySelector('[data-status]');
    var button = form.querySelector('button[type="submit"]');
    var thanks = document.getElementById(form.getAttribute('data-thanks'));
    if (endpoint) form.action = endpoint;
    form.noValidate = true; // show our own messages instead of the browser's

    // Rename fields to the provider's names (in case the HTML ones differ).
    ['email', 'country', 'work'].forEach(function (key) {
      var input = form.querySelector('[data-field="' + key + '"]');
      if (input && names[key]) input.name = names[key];
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = form.querySelector('[data-field="email"]');
      var consent = form.querySelector('[data-field="consent"]');
      if (!email.value || !email.checkValidity()) {
        setStatus(status, 'error', TEXT.badEmail); email.focus(); return;
      }
      if (!consent.checked) {
        setStatus(status, 'error', TEXT.consent); consent.focus(); return;
      }
      if (!endpoint) { setStatus(status, 'soon', TEXT.soon); return; }

      var body = new URLSearchParams(new FormData(form));
      if (provider === 'mailerlite') { body.set('ml-submit', '1'); body.set('anticsrf', 'true'); }

      button.disabled = true;
      var label = button.textContent;
      button.textContent = TEXT.sending;
      status.hidden = true;

      var opts = { method: 'POST', body: body, headers: { 'Accept': 'application/json' } };
      if (provider === 'mailerlite') opts.mode = 'no-cors';

      fetch(endpoint, opts)
        .then(function (res) {
          // no-cors returns an opaque response: delivered, status unknown.
          if (res.type === 'opaque' || res.ok) return done();
          throw new Error('HTTP ' + res.status);
        })
        .catch(function () {
          setStatus(status, 'error', TEXT.error);
        })
        .then(function () { button.disabled = false; button.textContent = label; });
    });

    function done() {
      form.hidden = true;
      if (thanks) {
        thanks.hidden = false;
        var h = thanks.querySelector('h2, h3');
        if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
      }
    }
  });

  /* Share button in the thank-you box: Web Share API, else copy the link. */
  document.querySelectorAll('[data-share]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var note = btn.parentNode.querySelector('[data-share-status]');
      var data = { title: 'MileMint', text: TEXT.shareText, url: shareUrl };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
        return;
      }
      var fallback = function () {
        window.prompt('Copy this link:', shareUrl);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(TEXT.shareText + ' ' + shareUrl).then(function () {
          if (note) { note.textContent = TEXT.copied; note.hidden = false; }
        }, fallback);
      } else { fallback(); }
    });
  });
})();
