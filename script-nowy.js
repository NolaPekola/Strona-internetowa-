// =====================================================
// DODATKI DO NOWEJ WERSJI STRONY (osobny plik - script.js zostaje bez zmian)
//  1. Dymek „Jesteś zainteresowany/a?" - pojawia się, gdy ktoś dojedzie do stopki
//  2. Przyciski „Umów lekcję próbną" - ustawiają temat w formularzu i ustawiają kursor w polu „Imię"
// =====================================================
(function () {
  const bubble = document.getElementById('bubble');
  const closeBtn = document.getElementById('bubbleClose');
  const footer = document.getElementById('stopka');
  const banner = document.getElementById('cookieBanner');
  const KEY = 'bubble_closed';

  function wasClosed() {
    try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function rememberClosed() {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  }

  // 1. Dymek
  let closed = wasClosed();
  let footerSeen = false;
  let hideTimer = null;

  function bannerOpen() { return !!(banner && !banner.hidden); }

  function showBubble() {
    if (closed || !bubble || bannerOpen()) return;   // najpierw wybór cookies, dymek dopiero potem
    clearTimeout(hideTimer);
    bubble.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => bubble.classList.add('is-visible')));
  }

  function hideBubble() {
    if (!bubble) return;
    bubble.classList.remove('is-visible');
    hideTimer = setTimeout(() => { bubble.hidden = true; }, 450);
  }

  function sync() { footerSeen ? showBubble() : hideBubble(); }

  if (bubble && footer) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(e => { footerSeen = e.isIntersecting; });
        sync();
      }, { threshold: 0.15 }).observe(footer);
    } else {
      window.addEventListener('scroll', () => {
        footerSeen = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120;
        sync();
      }, { passive: true });
    }

    if (banner && 'MutationObserver' in window) {
      new MutationObserver(sync).observe(banner, { attributes: true, attributeFilter: ['hidden'] });
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closed = true;
      rememberClosed();
      hideBubble();
    });
  }

  // 2. „Umów lekcję próbną" -> formularz
  document.querySelectorAll('[data-trial]').forEach(link => {
    link.addEventListener('click', () => {
      const topic = document.getElementById('topic');
      if (topic) topic.value = 'Lekcja próbna';
      if (link.closest('#bubble')) { closed = true; rememberClosed(); hideBubble(); }
      setTimeout(() => {
        const name = document.getElementById('name');
        if (name) name.focus({ preventScroll: true });
      }, 800);
    });
  });

  // 3. „Ustawienia cookies" w stopce - kasuje zapisany wybór i pokazuje okno zgody od nowa
  document.querySelectorAll('[data-cookie-settings]').forEach(btn => {
    btn.addEventListener('click', () => {
      try { localStorage.removeItem('cookie_consent'); } catch (e) {}
      location.reload();
    });
  });
})();
