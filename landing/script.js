// Progressive enhancement only: the page reads fine with this file blocked.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky nav gets a backdrop once the page scrolls.
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll, staggering siblings that enter together.
  const reveals = [...document.querySelectorAll('.reveal')];
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((entry, i) => {
        entry.target.style.setProperty('--d', `${i * 70}ms`);
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  }

  // Count-up numbers in the hero.
  const counters = document.querySelectorAll('[data-count]');
  const paint = (el, value) => {
    const decimals = Number(el.dataset.decimals || 0);
    el.textContent = value.toFixed(decimals) + (el.dataset.suffix || '');
  };
  counters.forEach((el) => {
    const target = Number(el.dataset.count);
    if (reduced) return paint(el, target);
    const started = performance.now() + 500;
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - started) / 1400));
      paint(el, target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // The invoice card plays through "awaiting → confirming → paid" on a loop.
  const status = document.getElementById('status');
  const bar = document.getElementById('bar');
  const hash = document.getElementById('hash');
  const eta = document.getElementById('eta');
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function play() {
    for (;;) {
      status.textContent = 'Awaiting payment';
      status.classList.remove('is-paid');
      bar.style.transition = 'none';
      bar.style.width = '0';
      hash.textContent = 'Waiting for the network…';
      eta.textContent = '~1 block';
      await wait(2200);

      bar.style.transition = '';
      bar.style.width = '64%';
      status.textContent = 'Confirming';
      hash.textContent = '0x7c1e…a94f';
      eta.textContent = '2 of 3 confirmations';
      await wait(1900);

      bar.style.width = '100%';
      await wait(900);
      status.textContent = 'Paid';
      status.classList.add('is-paid');
      eta.textContent = 'Settled in 00:38';
      await wait(5200);
    }
  }
  if (reduced) {
    status.textContent = 'Paid';
    status.classList.add('is-paid');
    bar.style.width = '100%';
    hash.textContent = '0x7c1e…a94f';
    eta.textContent = 'Settled in 00:38';
  } else {
    play();
  }

  // Signup form: validate inline, never leave the page (this is a demo).
  const form = document.getElementById('start');
  const email = document.getElementById('email');
  const message = document.getElementById('signupMsg');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    message.classList.toggle('is-ok', ok);
    message.classList.toggle('is-bad', !ok);
    message.textContent = ok
      ? 'You are on the list. This is a demo, so nothing was sent anywhere.'
      : 'That does not look like an email address yet.';
    if (!ok) email.focus();
  });
})();
