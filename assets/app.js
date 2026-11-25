/* ====== NARXLAR: narxni faqat shu yerda o'zgartiring ====== */
const NARXLAR = {
  oddiy:     [60000],
  shikoyat:  [120000, 150000],
  davo:      [150000, 250000],
  shartnoma: [170000, 300000],
  shoshilinchFoiz: 50
};
/* ========================================================= */

/* til: sahifaning <html lang> qiymatidan olinadi (uz / ru / en) */
const LANG = (document.documentElement.lang || 'uz').slice(0, 2);
const TEXTS = {
  uz: { free: 'Bepul', cur: "so'm", sep: '\u00a0', approx: 'Taxminiy narx: ',
        nFree: 'Qisqa maslahat matnda, Telegram orqali, bepul.',
        nUrgent: p => `Shoshilinch: asosiy narxga +${p}%. Aniq summa Telegramda kelishiladi.`,
        nBase: 'Oraliqdagi aniq summa Telegramda kelishiladi.' },
  ru: { free: 'Бесплатно', cur: 'сум', sep: '\u00a0', approx: 'Ориентировочная цена: ',
        nFree: 'Краткая консультация в текстовом виде, через Telegram, бесплатно.',
        nUrgent: p => `Срочно: +${p}% к основной цене. Точная сумма согласовывается в Telegram.`,
        nBase: 'Точная сумма в этом диапазоне согласовывается в Telegram.' },
  en: { free: 'Free', cur: 'UZS', sep: ',', approx: 'Estimated price: ',
        nFree: 'A short consultation by text message on Telegram is free.',
        nUrgent: p => `Urgent: +${p}% on the base price. The exact amount is agreed on Telegram.`,
        nBase: 'The exact amount within the range is agreed on Telegram.' }
};
const T = TEXTS[LANG] || TEXTS.uz;
const hasGsap = !!(window.gsap && window.ScrollTrigger);
const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, T.sep);
const mult = urgent => urgent ? 1 + NARXLAR.shoshilinchFoiz / 100 : 1;
function range(key, urgent){
  if (key === 'maslahat') return null;
  const k = mult(urgent);
  return NARXLAR[key].map(v => v * k);
}
function label(r){
  const sp = LANG === 'en' ? ' ' : '\u00a0';
  if (!r) return T.free;
  return r.length === 1 ? `${fmt(r[0])}${sp}${T.cur}` : `${fmt(r[0])}–${fmt(r[1])}${sp}${T.cur}`;
}

/* narxlarni sahifaga yozish (bitta manba) */
document.querySelectorAll('[data-price]').forEach(el => { el.textContent = label(range(el.dataset.price, false)); });
document.querySelectorAll('[data-urgent-pct]').forEach(el => { el.textContent = NARXLAR.shoshilinchFoiz; });

/* hisoblagich */
const big = document.getElementById('big'), live = document.getElementById('live'),
      urgentBox = document.getElementById('urgent'), outnote = document.getElementById('outnote');
let shown = null;
function current(){
  const key = document.querySelector('input[name="tur"]:checked').value;
  urgentBox.disabled = key === 'maslahat';
  if (urgentBox.disabled) urgentBox.checked = false;
  return { key, urgent: urgentBox.checked };
}
function renderCalc(){
  const { key, urgent } = current();
  const r = range(key, urgent);
  outnote.textContent = key === 'maslahat'
    ? T.nFree
    : (urgent ? T.nUrgent(NARXLAR.shoshilinchFoiz) : T.nBase);
  live.textContent = T.approx + label(r);
  const to = r ? r.slice() : null;
  if (!hasGsap || reduceMq.matches || !shown || !to || shown.length !== to.length){
    big.textContent = label(r); shown = to; return;
  }
  const o = { a: shown[0], b: shown[1] ?? 0 };
  gsap.to(o, { a: to[0], b: to[1] ?? 0, duration: .55, ease: 'power3.out', overwrite: true,
    onUpdate: () => { big.textContent = label(to.length === 1 ? [o.a] : [o.a, o.b]); },
    onComplete: () => { big.textContent = label(r); } });
  shown = to;
}
document.querySelectorAll('input[name="tur"], #urgent').forEach(i => i.addEventListener('change', renderCalc));
shown = (range(current().key, false) || null);
renderCalc();

/* til almashtirganda bo'lim (#) saqlansin */
document.querySelectorAll('.lang a').forEach(a => a.addEventListener('click', () => { if (location.hash) a.href = a.getAttribute('href').split('#')[0] + location.hash; }));

/* savol-javob */
document.querySelectorAll('.q button').forEach(btn => {
  btn.addEventListener('click', () => {
    const q = btn.closest('.q');
    const open = q.dataset.open === 'true';
    q.dataset.open = String(!open);
    btn.setAttribute('aria-expanded', String(!open));
    if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 420);
  });
});
document.querySelector('.q').dataset.open = 'true';
document.querySelector('.q button').setAttribute('aria-expanded', 'true');

/* ====== GSAP effektlar ====== */
if (hasGsap){
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add({ ok: '(prefers-reduced-motion: no-preference)', fine: '(prefers-reduced-motion: no-preference) and (pointer: fine)' }, (ctx) => {
    const { fine } = ctx.conditions;
    const cleanups = [];
    /* o'qish chizig'i */
    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

    /* aurora: sekin suzadi va skroll bilan siljiydi */
    [['.b1', 60, 40, 17], ['.b2', -70, 50, 21], ['.b3', 50, -60, 19], ['.b4', -40, -40, 23]].forEach(([sel, x, y, d]) => {
      gsap.to(sel, { x, y, duration: d, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });
    gsap.to('.b1', { yPercent: 36, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1.2 } });
    gsap.to('.b2', { yPercent: 55, xPercent: -12, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1.2 } });
    gsap.to('.b3', { yPercent: -45, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1.2 } });
    gsap.to('.b4', { yPercent: -60, xPercent: 18, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1.2 } });

    /* hero ketma-ketligi */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero .eyebrow', { y: 16, opacity: 0, duration: .6 })
      .from('.hero h1 .w > span', { yPercent: 115, duration: 1.05, stagger: .08, ease: 'power4.out' }, '<.1')
      .from('.hero .lead', { y: 20, opacity: 0, duration: .7 }, '-=.55')
      .from('.hero .cta > *', { y: 16, opacity: 0, stagger: .1, duration: .6 }, '-=.45')
      .from('#paper', { y: 70, rotation: -8, opacity: 0, duration: 1.1, ease: 'power4.out' }, .25)
      .from('#paper .ln', { scaleX: 0, transformOrigin: '0 50%', stagger: .07, duration: .55 }, '-=.6')
      .from('.stamp', { scale: 2.4, rotation: -28, opacity: 0, duration: .5, ease: 'back.out(2.2)' }, '-=.1')
      .from('.stat', { y: 22, opacity: 0, stagger: .1, duration: .6 }, '-=.6')
      .from('.fchip', { y: 30, opacity: 0, scale: .8, stagger: .15, duration: .8, ease: 'back.out(2)' }, 1.4);
    gsap.utils.toArray('.fchip').forEach((c, i) => gsap.to(c, { y: i ? 6 : -6, duration: 2.6 + i * .5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.4 }));

    /* raqamlar sanaladi */
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = +el.dataset.count, suf = el.dataset.suffix || '', o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 95%', once: true, onEnter: () => {
        el.textContent = fmt(0) + suf;
        gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', delay: .5,
          onUpdate: () => { el.textContent = fmt(o.v) + suf; },
          onComplete: () => { el.textContent = fmt(end) + suf; } });
      }});
    });

    /* hujjat varag'i skroll bilan siljiydi */
    gsap.to('#paperWrap', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* tasma: skroll tezligiga qarab tezlashadi */
    const mq = gsap.to('#mtrack', { xPercent: -50, repeat: -1, duration: 30, ease: 'none' });
    let settle;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
      gsap.to(mq, { timeScale: boost, duration: .25, overwrite: true });
      clearTimeout(settle);
      settle = setTimeout(() => gsap.to(mq, { timeScale: 1, duration: .9 }), 140);
    }});

    /* sarlavhalar va bo'lim matni */
    gsap.utils.toArray('.art-h, .art-p, .calc, .rev, .src, .rule-note, .cbox').forEach(el => {
      gsap.from(el, { y: 34, opacity: .2, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });

    /* yopishuvchi xizmat kartalari */
    const cards = gsap.utils.toArray('.svc');
    cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      gsap.to(c, { scale: .93, ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top 88%', end: 'top 28%', scrub: true } });
    });

    /* qadamlar */
    gsap.fromTo('#fill', { scaleY: 0 }, { scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '#steps', start: 'top 70%', end: 'bottom 75%', scrub: .4 } });
    gsap.utils.toArray('.steps li').forEach(li => {
      gsap.from(li, { x: -22, opacity: .25, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 88%', once: true } });
      ScrollTrigger.create({ trigger: li, start: 'top 62%', toggleClass: { targets: li, className: 'on' } });
    });

    /* savollar */
    ScrollTrigger.batch('.q', { start: 'top 92%', once: true,
      onEnter: els => gsap.from(els, { y: 26, opacity: .2, stagger: .08, duration: .7, ease: 'power3.out' }) });

    /* yakuniy chaqiriq */
    gsap.from('.contact h2 .w > span', { yPercent: 115, duration: 1, stagger: .1, ease: 'power4.out',
      scrollTrigger: { trigger: '.contact h2', start: 'top 85%', once: true } });
    gsap.from('.contact .cta, .contact .socials', { y: 20, opacity: .2, stagger: .12, duration: .7, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact .cta', start: 'top 92%', once: true } });

    /* sichqoncha bor qurilmalarda: yog'du, qiyalik, magnit tugmalar */
    if (fine){
      const ring = document.getElementById('ring');
      const rx = gsap.quickTo(ring, 'x', { duration: .35, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .35, ease: 'power3' });
      const onAny = e => { ring.classList.add('on'); rx(e.clientX); ry(e.clientY); ring.classList.toggle('hot', !!e.target.closest('a, button, label, .q, .svc')); };
      window.addEventListener('pointermove', onAny);
      cleanups.push(() => { window.removeEventListener('pointermove', onAny); ring.classList.remove('on'); });
      document.querySelectorAll('.stats, .svc, .calc, .rev, .q, .chip-note, .cbox').forEach(el => {
        el.classList.add('shine');
        const mv = e => { const r = el.getBoundingClientRect(); el.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%'); el.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%'); };
        el.addEventListener('pointermove', mv);
        cleanups.push(() => { el.removeEventListener('pointermove', mv); el.classList.remove('shine'); });
      });
      const hero = document.querySelector('.hero'), glow = document.getElementById('glow');
      const gx = gsap.quickTo(glow, 'x', { duration: .6, ease: 'power3' }), gy = gsap.quickTo(glow, 'y', { duration: .6, ease: 'power3' });
      gsap.set(glow, { opacity: 1 });
      const tx = gsap.quickTo('#paper', 'rotationY', { duration: .7, ease: 'power3' }), ty = gsap.quickTo('#paper', 'rotationX', { duration: .7, ease: 'power3' });
      const onMove = e => {
        const r = hero.getBoundingClientRect();
        gx(e.clientX - r.left); gy(e.clientY - r.top);
        tx((e.clientX / innerWidth - .5) * 14); ty(-(e.clientY / innerHeight - .5) * 10);
      };
      hero.addEventListener('pointermove', onMove);
      cleanups.push(() => hero.removeEventListener('pointermove', onMove));
      document.querySelectorAll('[data-mag]').forEach(b => {
        const bx = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' }), by = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
        const mv = e => { const r = b.getBoundingClientRect(); bx((e.clientX - (r.left + r.width / 2)) * .22); by((e.clientY - (r.top + r.height / 2)) * .3); };
        const lv = () => { bx(0); by(0); };
        b.addEventListener('pointermove', mv); b.addEventListener('pointerleave', lv);
        cleanups.push(() => { b.removeEventListener('pointermove', mv); b.removeEventListener('pointerleave', lv); });
      });
    }

    return () => { cleanups.forEach(f => f()); };
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
