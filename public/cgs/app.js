// Церква Божого Спасіння — поведінка сторінки (без бібліотек)
(function () {
  var CFG = window.CGS || { services: [], holidays: [] };
  var $ = function (id) { return document.getElementById(id); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var hhmm = function (d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  var DAYS = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'пʼятниця', 'субота'];
  var MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

  /* ── мобільне меню ── */
  var mnav = $('mnav'), burger = $('burger');
  function setMenu(open) {
    mnav.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('mclose').focus();
  }
  burger.addEventListener('click', function () { setMenu(true); });
  $('mclose').addEventListener('click', function () { setMenu(false); burger.focus(); });
  mnav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) { setMenu(false); burger.focus(); } });

  /* ── шапка: лінія після прокрутки ── */
  var header = $('header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ── біжуча стрічка ── */
  var words = ['Віра', 'Надія', 'Любов', 'Сім’я', 'Молодь', 'Служіння', 'Рівне'];
  var row = words.map(function (w) { return '<span>' + w + '</span><b>•</b>'; }).join('');
  $('marquee').innerHTML = row + row + row;

  /* ── YouTube ── */
  if (CFG.youtube) document.querySelectorAll('[data-yt]').forEach(function (a) { a.href = CFG.youtube; a.target = '_blank'; a.rel = 'noreferrer'; });

  /* ── годинник служінь: «Наживо», таймер, найближче богослужіння ── */
  function clock(now) {
    var live = false, liveAt = null, next = null;
    (CFG.services || []).forEach(function (s) {
      var start = new Date(now);
      start.setHours(s.hour, s.minute || 0, 0, 0);
      start.setDate(now.getDate() + ((s.weekday - now.getDay() + 7) % 7));
      var end = new Date(start.getTime() + (s.durationMin || 120) * 60000);
      if (now >= start && now < end) { live = true; liveAt = new Date(start); }
      if (now >= start) start.setDate(start.getDate() + 7);
      if (!next || start < next) next = start;
    });
    return { live: live, liveAt: liveAt, next: next };
  }
  function tick() {
    var now = new Date(), c = clock(now);
    if (!c.next) return;                       // час ще не вписано в config.js — лишаються [ЧАС]
    var d = c.next;
    $('livePill').hidden = !c.live;
    $('liveNow').hidden = !c.live;
    $('countdown').hidden = c.live;
    $('ticketWhen').textContent = c.live ? 'зараз' : DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    $('ticketTime').textContent = c.live ? 'наживо' : hhmm(d);
    $('ticketTitle').textContent = c.live ? 'Богослужіння триває' : 'Найближче богослужіння';
    $('playerBadge').innerHTML = c.live ? '<span class="dot"></span> Наживо' : 'Неділя · ' + hhmm(d);
    var s = Math.max(0, Math.floor((d - now) / 1000));
    var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    document.querySelectorAll('[data-cd]').forEach(function (el) { el.textContent = pad(v[el.dataset.cd]); });
  }
  tick(); setInterval(tick, 1000);

  /* ── свята ── */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var list = (CFG.holidays || []).map(function (h) {
    var p = h.date.split('-').map(Number);
    return { name: h.name, when: new Date(p[0], p[1] - 1, p[2]), day: p[2], month: MONTHS[p[1] - 1], year: p[0] };
  });
  var next = list.filter(function (h) { return h.when >= today; })[0];
  if (list.length) $('feastYear').textContent = 'календар ' + list[0].year;
  $('feasts').innerHTML = list.map(function (h) {
    var cls = h === next ? 'is-next' : h.when < today ? 'is-past' : '';
    return '<li class="feast ' + cls + '"><span class="feast__date">' + h.day + '<small>' + h.month + '</small></span>' +
      '<span class="feast__name">' + h.name + '</span>' + (h === next ? '<span class="feast__badge">наступне</span>' : '') + '</li>';
  }).join('');
  if (next) {
    var days = Math.round((next.when - today) / 864e5);
    var word = days % 10 === 1 && days % 100 !== 11 ? 'день' : [2, 3, 4].indexOf(days % 10) >= 0 && [12, 13, 14].indexOf(days % 100) < 0 ? 'дні' : 'днів';
    var box = $('nextFeast');
    box.querySelector('strong').textContent = next.name;
    box.querySelector('span').textContent = next.day + ' ' + next.month + ' · ' + (days === 0 ? 'сьогодні' : 'через ' + days + ' ' + word);
    box.hidden = false;
  }

  /* ── молитовне прохання (TODO: надсилати в Telegram-бот або на пошту церкви) ── */
  $('prayerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!this.text.value.trim()) return;
    this.hidden = true; $('prayerDone').hidden = false;
  });
  $('prayerAgain').addEventListener('click', function () {
    var f = $('prayerForm'); f.reset(); f.hidden = false; $('prayerDone').hidden = true;
  });

  /* ── підписка ── */
  $('subscribe').addEventListener('submit', function (e) { e.preventDefault(); this.hidden = true; $('subscribed').hidden = false; });

  /* ── поява при прокрутці ── */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add('is-in'); });

  $('year').textContent = new Date().getFullYear();
})();
