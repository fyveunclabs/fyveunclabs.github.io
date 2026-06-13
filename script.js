/**
 * FyveUnc Labs — main script
 * Handles: nav scroll state, active link, stagger reveals,
 *           mobile menu, scroll progress bar, newsletter form
 */
(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Nav scroll state ─────────────────────────────────────────────────── */
    const nav = document.getElementById('nav');
    const SCROLL_THRESHOLD = 40;

    function onScroll() {
        if (!nav) return;
        nav.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
        updateScrollProgress();
    }

    /* ── Scroll progress bar ──────────────────────────────────────────────── */
    const progressBar = document.getElementById('scroll-progress');

    function updateScrollProgress() {
        if (!progressBar) return;
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
        progressBar.style.width = pct + '%';
    }

    /* ── Active nav link ──────────────────────────────────────────────────── */
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        const target = href.split('/').pop();
        if (target && target === currentPage) {
            link.classList.add('active');
        }
    });

    /* ── Mobile menu ──────────────────────────────────────────────────────── */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    let menuOpen = false;

    function toggleMenu(open) {
        menuOpen = open !== undefined ? open : !menuOpen;
        if (nav) nav.classList.toggle('menu-open', menuOpen);
        if (mobileMenu) {
            mobileMenu.classList.toggle('active', menuOpen);
            mobileMenu.setAttribute('aria-hidden', String(!menuOpen));
        }
        if (hamburger) hamburger.setAttribute('aria-expanded', String(menuOpen));
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => toggleMenu());
    }

    if (mobileMenu) {
        // Close when a link inside is clicked
        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => toggleMenu(false));
        });
    }

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuOpen) toggleMenu(false);
    });

    /* ── Stagger delays ───────────────────────────────────────────────────── */
    const staggerContainers = Array.from(document.querySelectorAll('[data-stagger]'));
    staggerContainers.forEach((container) => {
        const delayStep = Number(container.getAttribute('data-stagger')) || 80;
        const items = Array.from(container.querySelectorAll(':scope > .reveal, .hero-metrics .reveal'));
        items.forEach((item, index) => {
            // Only set if not already set by CSS
            if (!item.style.getPropertyValue('--delay')) {
                item.style.setProperty('--delay', `${index * delayStep}ms`);
            }
        });
    });

    /* ── Scroll-triggered reveals ─────────────────────────────────────────── */
    const revealTargets = Array.from(document.querySelectorAll('.reveal'));

    if (!prefersReduced && 'IntersectionObserver' in window && revealTargets.length) {
        const revealObs = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
        );
        revealTargets.forEach((el) => revealObs.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add('visible'));
    }

    /* ── Newsletter form ──────────────────────────────────────────────────── */
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterBtn = document.getElementById('newsletter-submit');

    if (newsletterForm && newsletterBtn) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            if (!emailInput || !emailInput.value.includes('@')) {
                emailInput && emailInput.focus();
                return;
            }
            newsletterBtn.textContent = '✓ Subscribed!';
            newsletterBtn.disabled = true;
            newsletterBtn.style.background = '#28C840';
            emailInput.value = '';
        });
    }

    /* ── Contact form UX ──────────────────────────────────────────────────── */
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const submitBtn = contactForm.querySelector('[type="submit"]');
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (submitBtn) {
                submitBtn.textContent = 'Sending…';
                submitBtn.disabled = true;
                setTimeout(() => {
                    submitBtn.textContent = '✓ Sent! We\'ll be in touch.';
                    submitBtn.style.background = '#28C840';
                }, 900);
            }
        });
    }

    /* ── Mouse-tracking tilt + spotlight ──────────────────────────────────── */
    const TILT_CARDS = '.feature-card, .pricing-card, .case-card';
    const MAX_TILT = 8; // degrees

    function applyTilt(card, e) {
        const rect = card.getBoundingClientRect();
        // Cursor position relative to card (0–1)
        const rx = (e.clientX - rect.left) / rect.width;
        const ry = (e.clientY - rect.top)  / rect.height;
        // Map to tilt: centre = 0, edges = ±MAX_TILT
        const tiltY =  (rx - 0.5) * 2 * MAX_TILT;   // left-right → rotateY
        const tiltX = -(ry - 0.5) * 2 * MAX_TILT;   // top-bottom  → rotateX (inverted)

        card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
        card.style.setProperty('--mouse-x', `${(rx * 100).toFixed(1)}%`);
        card.style.setProperty('--mouse-y', `${(ry * 100).toFixed(1)}%`);
        card.style.transition = 'border-color 0.3s ease, box-shadow 0.3s ease';
    }

    function resetTilt(card) {
        card.style.transition =
            'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)';
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
    }

    if (!prefersReduced) {
        document.querySelectorAll(TILT_CARDS).forEach((card) => {
            let rafId = null;

            card.addEventListener('mousemove', (e) => {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => applyTilt(card, e));
            });

            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                resetTilt(card);
            });
        });
    }

    /* ── Init ─────────────────────────────────────────────────────────────── */
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();
