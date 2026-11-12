// CodeSnap landing page interactions
(() => {
  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const burger = document.getElementById('burger');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Smooth scroll for every [data-scroll] link/button ---------- */
  const closeMenu = () => {
    navLinks.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };

  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const id = el.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = id === '#home' ? 0 : target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight + 1;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
      closeMenu();
    });
  });

  /* ---------- Mobile menu ---------- */
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });

  /* ---------- Nav border on scroll + active link ---------- */
  const sections = ['features', 'pricing', 'footer'].map((id) => document.getElementById(id));
  const links = [...navLinks.querySelectorAll('a')];

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    const y = window.scrollY + nav.offsetHeight + window.innerHeight * 0.3;
    let current = null;
    sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) current = 'footer';
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Theme toggle (respects system preference by default) ---------- */
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');

  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('codesnap-theme', next); } catch (e) {}
  });

  /* ---------- Copy install command ---------- */
  const copyBtn = document.getElementById('copyInstall');
  const copyLabel = copyBtn.querySelector('.copy-btn__label');
  copyBtn.addEventListener('click', async () => {
    const text = 'npm i -g codesnap';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    copyBtn.classList.add('is-copied');
    copyLabel.textContent = 'Copied!';
    setTimeout(() => { copyBtn.classList.remove('is-copied'); copyLabel.textContent = 'Copy'; }, 1600);
  });

  /* ---------- Screenshot background swatches ---------- */
  const snap = document.getElementById('snap');
  document.querySelectorAll('.swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('is-active'));
      sw.classList.add('is-active');
      snap.dataset.bg = sw.dataset.bg;
    });
  });

  /* ---------- Pricing billing toggle ---------- */
  const proPrice = document.getElementById('proPrice');
  const proPer = document.getElementById('proPer');
  document.querySelectorAll('.billing__opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.billing__opt').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const yearly = btn.dataset.period === 'yearly';
      proPrice.textContent = `$${yearly ? proPrice.dataset.yearly : proPrice.dataset.monthly}`;
      proPer.textContent = yearly ? '/ month, billed yearly' : '/ month';
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.section__head, .card');
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealEls.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('is-visible');
          io.unobserve(el);
          // drop the stagger delay so hover effects stay snappy afterwards
          setTimeout(() => { el.style.transitionDelay = ''; }, 900);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 80}ms`;
      io.observe(el);
    });
  }

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
