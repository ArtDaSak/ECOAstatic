/* ═══════════════════════════════════════════
   ECOA — main.js
   Interactivity & Scroll Animations
═══════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   1. SCROLL-REVEAL (IntersectionObserver)
───────────────────────────────────────── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
})();



/* ─────────────────────────────────────────
   3. FAQ ACCORDION
───────────────────────────────────────── */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Cierra todos
      faqItems.forEach((otherItem) => {
        const otherBtn = otherItem.querySelector('.faq-question');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherBtn && otherAnswer) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.hidden = true;
        }
      });

      // Abre el actual si estaba cerrado
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });
})();

/* ─────────────────────────────────────────
   4. ACCORDION DE RAZONES ("Tal vez llegaste")
   Sección #para-quien — comportamiento tipo separador editorial
───────────────────────────────────────── */
(function initReasonsAccordion() {
  const accItems = document.querySelectorAll('.acc-item');
  if (!accItems.length) return;

  accItems.forEach((item) => {
    const trigger = item.querySelector('.acc-trigger');
    const panel   = item.querySelector('.acc-panel');

    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Cierra todos los ítems del accordion
      accItems.forEach((other) => {
        const otherTrigger = other.querySelector('.acc-trigger');
        const otherPanel   = other.querySelector('.acc-panel');
        if (otherTrigger && otherPanel) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherPanel.hidden = true;
        }
      });

      // Abre el actual si estaba cerrado
      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;

        // Scroll suave al ítem para que quede visible en mobile
        setTimeout(() => {
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 80);
      }
    });
  });
})();

/* ─────────────────────────────────────────
   5. UTM → WHATSAPP LINK INJECTION
   Lee UTMs de la URL y los añade a todos los links de WhatsApp
───────────────────────────────────────── */
(function injectUTMs() {
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const utms = {};

  utmKeys.forEach((key) => {
    if (params.has(key)) utms[key] = params.get(key);
  });

  if (!Object.keys(utms).length) return;

  const utmString = Object.entries(utms)
    .map(([k, v]) => `${encodeURIComponent(k)}%3D${encodeURIComponent(v)}`)
    .join('%26');

  const waLinks = document.querySelectorAll('a[href*="wa.me"]');
  waLinks.forEach((link) => {
    const href = link.getAttribute('href');
    link.setAttribute('href', `${href}%20%5B${utmString}%5D`);
  });
})();

/* ─────────────────────────────────────────
   6. META PIXEL EVENTS (stub)
   Reemplaza YOUR_PIXEL_ID y descomenta fbq cuando esté instalado.
───────────────────────────────────────── */
(function trackMetaEvents() {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'PageView');
  }

  setTimeout(() => {
    if (typeof fbq !== 'undefined') {
      fbq('track', 'ViewContent', {
        content_name: 'Formación Coaching Ontológico ECOA',
        content_category: 'Educación / Coaching',
      });
    }
  }, 3000);

  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    link.addEventListener('click', () => {
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Contact', { content_name: 'WhatsApp CTA' });
        fbq('trackCustom', 'ClickWhatsApp', { button_id: link.id || 'unknown' });
      }
    });
  });

  const heroCta = document.getElementById('hero-whatsapp-cta');
  if (heroCta) {
    heroCta.addEventListener('click', () => {
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', { content_name: 'Hero WhatsApp CTA' });
      }
    });
  }
})();



/* ─────────────────────────────────────────
   8. COUNTER ANIMATION for stats
───────────────────────────────────────── */
(function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  function parseTarget(text) {
    const clean = text.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  }

  function formatValue(val, original) {
    if (original.includes('+')) return '+' + Math.round(val).toLocaleString('es-CO');
    if (original === '∞') return '∞';
    if (original.includes('h')) return Math.round(val) + 'h';
    return Math.round(val).toLocaleString('es-CO');
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const original = el.textContent.trim();
        const target = parseTarget(original);
        if (!target) return;

        const duration = 1600;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = formatValue(target * eased, original);
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();

/* ─────────────────────────────────────────
   9. VIDEO CAROUSEL
   Maneja: dots, prev/next, scroll-snap nativo,
   sincronización del dot activo por IntersectionObserver,
   soporte de teclado y estados disabled en bordes.
───────────────────────────────────────── */
(function initVideoCarousel() {
  const carousel = document.getElementById('video-carousel');
  if (!carousel) return;

  const track   = document.getElementById('video-track');
  const dotsEl  = document.getElementById('vc-dots');
  const prevBtn = document.getElementById('vc-prev');
  const nextBtn = document.getElementById('vc-next');
  const cards   = Array.from(track.querySelectorAll('.video-card'));

  if (!cards.length) return;

  let currentIndex = 0;

  /* ── Generar dots ── */
  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    dot.className = 'vc-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Video ${i + 1} de ${cards.length}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');

    dot.addEventListener('click', () => scrollToCard(i));
    dotsEl.appendChild(dot);
  });

  const dots = Array.from(dotsEl.querySelectorAll('.vc-dot'));

  /* ── Actualizar dot activo y estados de botones ── */
  function setActive(index) {
    currentIndex = index;

    dots.forEach((d, i) => {
      const isActive = i === index;
      d.classList.toggle('active', isActive);
      d.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === cards.length - 1;
  }

  /* ── Scroll a una card concreta ── */
  function scrollToCard(index) {
    const card = cards[index];
    if (!card) return;

    // Calcular offset relativo al track para centrar la card
    const trackRect  = track.getBoundingClientRect();
    const cardRect   = card.getBoundingClientRect();
    const scrollLeft = track.scrollLeft + cardRect.left - trackRect.left
                       - (trackRect.width / 2) + (cardRect.width / 2);

    track.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    setActive(index);
  }

  /* ── Prev / Next ── */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      scrollToCard(Math.max(0, currentIndex - 1));
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      scrollToCard(Math.min(cards.length - 1, currentIndex + 1));
    });
  }

  /* ── Soporte de teclado en el track ── */
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollToCard(Math.max(0, currentIndex - 1)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollToCard(Math.min(cards.length - 1, currentIndex + 1)); }
  });

  /* ── Sincronizar dot activo con scroll nativo (drag/swipe) ──
     IntersectionObserver detecta qué card está más centrada.
  ── */
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = cards.indexOf(entry.target);
          if (index !== -1) setActive(index);
        }
      });
    },
    {
      root: track,
      // Threshold alto: solo cuando el centro del card está visible
      threshold: 0.55,
    }
  );

  cards.forEach((card) => cardObserver.observe(card));

  /* ── Estado inicial ── */
  setActive(0);
})();

/* ─────────────────────────────────────────
   10. VIDEO PLAYBACK WITH SOUND
   Maneja el play overlay personalizado para que los videos
   se reproduzcan con sonido y muestren los controles nativos.
───────────────────────────────────────── */
(function initVideoPlayback() {
  const mediaContainers = document.querySelectorAll('.vc-media');

  mediaContainers.forEach((container) => {
    const video = container.querySelector('video');
    const playOverlay = container.querySelector('.vc-play-overlay');

    if (!video || !playOverlay) return;

    // Asegurar que el video inicie silenciado en bucle como preview
    video.muted = true;
    video.loop = true;
    video.play().catch((err) => {
      console.log("Autoplay preview silenciado en espera de interacción:", err);
    });

    playOverlay.addEventListener('click', () => {
      // Activar sonido, quitar bucle, reiniciar video y mostrar controles nativos
      video.muted = false;
      video.loop = false;
      video.currentTime = 0;
      video.setAttribute('controls', ''); // Activar controles nativos
      container.classList.add('is-playing');
      
      video.play().catch((err) => {
        console.log("Error al reproducir el video:", err);
      });
    });

    // Al finalizar el video, restaurar preview en bucle silencioso
    video.addEventListener('ended', () => {
      video.removeAttribute('controls');
      container.classList.remove('is-playing');
      video.muted = true;
      video.loop = true;
      video.play().catch((err) => {
        console.log("Error al reiniciar preview:", err);
      });
    });
  });
})();

/* ─────────────────────────────────────────
   11. MOBILE STICKY CTA — SCROLL REVEAL
   Muestra la barra sticky después de 300px de scroll.
   Respeta prefers-reduced-motion: aparece inmediatamente.
───────────────────────────────────────── */
(function initStickyBar() {
  const bar = document.getElementById('mobile-sticky-bar');
  if (!bar) return;

  const THRESHOLD = 300; // px de scroll antes de aparecer
  let shown = false;

  // Si prefiere menos movimiento, mostrar siempre
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bar.classList.add('sticky-visible');
    return;
  }

  function onScroll() {
    if (shown) return;
    if (window.scrollY > THRESHOLD) {
      bar.classList.add('sticky-visible');
      shown = true;
      window.removeEventListener('scroll', onScroll, { passive: true });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ─────────────────────────────────────────
   12. CTA INTENT TRACKING (analytics-ready)
   Dispara evento personalizado en cada clic a WhatsApp.
   Compatible con GA4, Meta Pixel o cualquier listener externo.
───────────────────────────────────────── */
(function initCtaTracking() {
  document.querySelectorAll('a[data-cta-location]').forEach((link) => {
    link.addEventListener('click', () => {
      const payload = {
        cta_location: link.dataset.ctaLocation || 'unknown',
        cta_intent:   link.dataset.ctaIntent   || 'unknown',
        button_text:  link.textContent.trim().slice(0, 60),
      };

      // GA4
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click_whatsapp', payload);
      }
      // Meta Pixel
      if (typeof fbq !== 'undefined') {
        fbq('trackCustom', 'ClickWhatsAppCTA', payload);
      }
      // Debug
      console.debug('[ECOA CTA]', payload);
    });
  });
})();
