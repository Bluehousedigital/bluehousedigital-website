/* Blue House Digital: menus, sticky header, mobile bar and form handling. No dependencies. */
(function () {
  var header = document.querySelector('.site-header');
  var onScroll = function () { header && header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Desktop menus: click to toggle, hover on fine pointers, Esc and outside click to close
  var tops = document.querySelectorAll('.nav-links button.top');
  function closeAll(except) {
    tops.forEach(function (b) { if (b !== except) { b.setAttribute('aria-expanded', 'false'); var m = document.getElementById(b.getAttribute('aria-controls')); m && m.classList.remove('open'); } });
  }
  tops.forEach(function (btn) {
    var menu = document.getElementById(btn.getAttribute('aria-controls'));
    var li = btn.parentElement; var t; var openedAt = 0;
    function open() { if (btn.getAttribute('aria-expanded') !== 'true') openedAt = Date.now(); closeAll(btn); btn.setAttribute('aria-expanded', 'true'); menu.classList.add('open'); }
    function close() { btn.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); if (btn.getAttribute('aria-expanded') === 'true' && Date.now() - openedAt > 400) close(); else open(); });
    if (window.matchMedia('(hover: hover)').matches) {
      li.addEventListener('mouseenter', function () { clearTimeout(t); open(); });
      li.addEventListener('mouseleave', function () { t = setTimeout(close, 180); });
    }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.nav-links')) closeAll(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { var openBtn = document.querySelector('.nav-links button.top[aria-expanded="true"]'); closeAll(); openBtn && openBtn.focus(); toggleSheet(false); }
  });

  // Mobile sheet
  var toggle = document.querySelector('.menu-toggle'); var sheet = document.getElementById('mobile-sheet');
  function toggleSheet(force) {
    if (!toggle) return;
    var open = typeof force === 'boolean' ? force : toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open)); sheet.classList.toggle('open', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.innerHTML = open ? '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>' : '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>';
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  toggle && toggle.addEventListener('click', function () { toggleSheet(); });

  // Sticky mobile CTA: show after the hero, hide while any form is on screen
  var bar = document.querySelector('.mobile-bar');
  if (bar) {
    var hero = document.querySelector('main > section'); var forms = document.querySelectorAll('.bh-form'); var ticking = false;
    var update = function () {
      ticking = false; var vh = window.innerHeight;
      var past = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 400;
      var formVisible = Array.prototype.some.call(forms, function (f) { var r = f.getBoundingClientRect(); return r.top < vh && r.bottom > 0; });
      bar.classList.toggle('show', past && !formVisible);
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update); update();
  }

  // Forms
  var params = new URLSearchParams(location.search);
  var utm = {}; ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
    var v = params.get(k); try { if (v) sessionStorage.setItem(k, v); v = v || sessionStorage.getItem(k); } catch (e) {} if (v) utm[k] = v;
  });
  try { if (!sessionStorage.getItem('bh_ref') && document.referrer && document.referrer.indexOf(location.host) === -1) sessionStorage.setItem('bh_ref', document.referrer); } catch (e) {}
  var situation = params.get('situation');

  function cookie(name) { var m = document.cookie.match('(^|;)\\s*' + name + '=([^;]+)'); return m ? decodeURIComponent(m[2]) : ''; }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function check(field) {
    var input = field.querySelector('input,select,textarea'); if (!input || !input.required) return true;
    var ok = input.type === 'email' ? validEmail(input.value.trim()) : input.value.trim() !== '';
    field.classList.toggle('invalid', !ok); input.setAttribute('aria-invalid', String(!ok)); return ok;
  }

  document.querySelectorAll('.bh-form').forEach(function (form) {
    var sel = form.querySelector('select[name="situation"]');
    if (situation && sel) Array.prototype.forEach.call(sel.options, function (o) { if (o.text === situation) sel.value = o.text; });
    form.querySelectorAll('.field').forEach(function (f) {
      var input = f.querySelector('input,select,textarea'); if (!input) return;
      input.addEventListener('blur', function () { if (input.value) check(f); });
      input.addEventListener('input', function () { if (f.classList.contains('invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status'); status.textContent = '';
      var ok = true; form.querySelectorAll('.field').forEach(function (f) { if (!check(f)) ok = false; });
      if (!ok) { var first = form.querySelector('.invalid input, .invalid select'); first && first.focus(); return; }
      var btn = form.querySelector('button[type="submit"]'); btn.disabled = true; btn.textContent = 'Sending…';
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.form = form.getAttribute('data-form'); data.pageUri = location.href; data.pageName = document.title;
      data.hutk = cookie('hubspotutk'); data.referrer = (function () { try { return sessionStorage.getItem('bh_ref') || ''; } catch (e) { return ''; } })();
      Object.keys(utm).forEach(function (k) { data[k] = utm[k]; });
      fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.j.error || 'Something went wrong.');
          try { sessionStorage.setItem('bh_last_form', data.bh_form_location || ''); } catch (e) {}
          location.href = '/contact/thanks/';
        })
        .catch(function (err) {
          btn.disabled = false; btn.textContent = btn.getAttribute('data-label');
          status.textContent = (err && err.message ? err.message + ' ' : '') + 'You can also email max@bluehousedigital.com.';
          if (window.turnstile) try { turnstile.reset(form.querySelector('.cf-turnstile')); } catch (e) {}
        });
    });
  });
})();
