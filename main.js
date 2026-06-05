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
   2. STICKY WHATSAPP BUTTON
   Aparece al bajar del hero, se oculta en desktop via CSS
───────────────────────────────────────── */
(function initStickyWhatsApp() {
  const sentinel = document.querySelector('.scroll-sentinel');
  const stickyBtn = document.getElementById('sticky-whatsapp');

  if (!sentinel || !stickyBtn) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          stickyBtn.classList.add('visible');
        } else {
          stickyBtn.classList.remove('visible');
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px 0px 0px' }
  );

  observer.observe(sentinel);
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
   7. SMOOTH HEADER HIDE/SHOW ON SCROLL
───────────────────────────────────────── */
(function initHeaderBehavior() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastY = 0;
  let ticking = false;

  header.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = window.scrollY;

        if (currentY > lastY && currentY > 100) {
          header.style.transform = 'translateY(-100%)';
        } else {
          header.style.transform = 'translateY(0)';
        }

        lastY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
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
