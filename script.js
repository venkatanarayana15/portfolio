/* ==========================================================================
   VENKATA NARAYANA — PORTFOLIO INTERACTIONS
   Dark/light futuristic system. Reduced-motion aware.
   ========================================================================== */

(function () {
    'use strict';

    const STORAGE_KEY = 'vn-theme';

    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    window.prefersReducedMotion = reduceMotion;

    /* ---------------------------------------------------------------------
       Theme switch
       --------------------------------------------------------------------- */
    function initTheme() {
        const root = document.documentElement;
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        const current = () => (root.classList.contains('light') ? 'light' : 'dark');

        const apply = (theme) => {
            const isLight = theme === 'light';

            root.classList.remove('dark', 'light');
            root.classList.add(theme);
            root.style.colorScheme = theme;

            toggle.setAttribute('aria-checked', String(isLight));
            toggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
            toggle.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';

            const themeColor = document.querySelector('meta[name="theme-color"]');
            if (themeColor) themeColor.setAttribute('content', isLight ? '#F6F7FB' : '#04050A');

            try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* noop */ }
        };

        // Re-sync button state with the theme chosen before first paint.
        apply(current());

        toggle.addEventListener('click', () => {
            apply(current() === 'light' ? 'dark' : 'light');
        });
    }

    /* ---------------------------------------------------------------------
       Mobile menu
       --------------------------------------------------------------------- */
    window.toggleMobileMenu = function () {
        const menu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-overlay');
        const hamburger = document.querySelector('.hamburger');
        if (!menu || !overlay || !hamburger) return;

        const open = !menu.classList.contains('open');
        menu.classList.toggle('open', open);
        overlay.classList.toggle('open', open);
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        overlay.setAttribute('aria-hidden', String(!open));
        menu.setAttribute('aria-hidden', String(!open));
        // Keep closed-menu links out of the tab order and accessibility tree.
        menu.toggleAttribute('inert', !open);
        document.body.style.overflow = open ? 'hidden' : '';

        // While the dialog is open, the rest of the page should not take focus.
        const pageRegions = document.querySelectorAll('main, .site-nav, .site-footer');
        pageRegions.forEach((region) => {
            if (open) region.setAttribute('inert', '');
            else region.removeAttribute('inert');
        });

        if (open) {
            const closeBtn = menu.querySelector('.mobile-menu-close');
            if (closeBtn) closeBtn.focus();
        } else {
            hamburger.focus();
        }
    };

    window.scrollToTop = function () {
        window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    };

    /* ---------------------------------------------------------------------
       Copy email + toast
       --------------------------------------------------------------------- */
    window.copyEmail = function () {
        const email = 'venkatnarayana727@gmail.com';
        const toast = document.getElementById('toast');
        const show = () => {
            if (!toast) return;
            toast.classList.add('visible');
            window.clearTimeout(show._t);
            show._t = window.setTimeout(() => toast.classList.remove('visible'), 2200);
        };

        const fallback = () => {
            const input = document.createElement('textarea');
            input.value = email;
            input.setAttribute('readonly', '');
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            try { document.execCommand('copy'); } catch (e) { /* noop */ }
            document.body.removeChild(input);
            show();
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(email).then(show).catch(fallback);
        } else {
            fallback();
        }
    };

    /* ---------------------------------------------------------------------
       Preloader — cinematic boot, once per session
       --------------------------------------------------------------------- */
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        const finish = () => {
            preloader.classList.add('finished');
            preloader.setAttribute('aria-hidden', 'true');
            window.setTimeout(() => {
                if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
            }, 900);
        };

        let seen = false;
        try { seen = sessionStorage.getItem('vn_booted') === '1'; } catch (e) { seen = false; }

        if (reduceMotion() || seen || window.location.hash) {
            finish();
            return;
        }

        try { sessionStorage.setItem('vn_booted', '1'); } catch (e) { /* noop */ }

        // Safety net: if animation frames are throttled (background tab), make
        // sure the overlay never traps the page.
        window.setTimeout(() => {
            if (document.getElementById('preloader')) finish();
        }, 4200);

        const titleEl = document.getElementById('preloader-title');
        const statusEl = document.getElementById('preloader-status');
        const barFill = document.getElementById('preloader-bar-fill');
        const countEl = document.getElementById('preloader-progress-count');
        const framesContainer = preloader.querySelector('.preloader-frames');
        if (!titleEl || !statusEl || !barFill || !countEl || !framesContainer) {
            finish();
            return;
        }

        const frameTotal = parseInt(document.getElementById('preloader-frame-total')?.textContent, 10) || 40;
        const frames = [];
        for (let i = 0; i < frameTotal; i++) {
            const frame = document.createElement('span');
            frame.className = 'preloader-frame';
            framesContainer.appendChild(frame);
            frames.push(frame);
        }

        const titleText = titleEl.textContent.trim() || 'FADE IN';
        const stages = [
            { at: 0.00, text: 'CALIBRATING LENS' },
            { at: 0.28, text: 'LOADING ASSETS' },
            { at: 0.55, text: 'RENDERING SCENE' },
            { at: 0.82, text: 'FADE IN' }
        ];
        const duration = 1750;
        const start = performance.now();
        const easeOut = (t) => 1 - Math.pow(1 - t, 4);
        let lastStage = '';

        function render(now) {
            const p = Math.min((now - start) / duration, 1);
            const e = easeOut(p);

            titleEl.textContent = titleText.slice(0, Math.round(titleText.length * e));
            barFill.style.width = (e * 100).toFixed(1) + '%';

            const frameCount = Math.round(e * frameTotal);
            countEl.textContent = String(frameCount).padStart(2, '0');

            const stage = stages.reduce((acc, s) => (p >= s.at ? s.text : acc), stages[0].text);
            if (stage !== lastStage) {
                statusEl.textContent = stage;
                lastStage = stage;
            }

            for (let i = 0; i < frames.length; i++) {
                frames[i].classList.toggle('active', i < frameCount);
            }

            if (p < 1) {
                requestAnimationFrame(render);
            } else {
                window.setTimeout(finish, 420);
            }
        }

        requestAnimationFrame(render);
    }

    /* ---------------------------------------------------------------------
       Section labels (film-strip chapter markers)
       --------------------------------------------------------------------- */
    function initSectionLabels() {
        const sections = Array.from(document.querySelectorAll('section[data-cinematic]:not(#hero)'));
        if (!sections.length) return;

        const observer = reduceMotion() ? null : new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

        sections.forEach((section) => {
            if (section.querySelector(':scope > .section-label')) return;
            const label = document.createElement('div');
            label.className = 'section-label';
            label.setAttribute('aria-hidden', 'true');
            label.textContent = section.dataset.label || section.id.toUpperCase();
            section.insertBefore(label, section.firstChild);

            if (reduceMotion()) {
                label.classList.add('visible');
            } else {
                observer.observe(label);
            }
        });
    }

    /* ---------------------------------------------------------------------
       Scroll-linked UI: nav state, progress, back-to-top, HUD
       --------------------------------------------------------------------- */
    function initScrollUI() {
        const nav = document.getElementById('site-nav');
        const progressContainer = document.querySelector('.scroll-progress-container');
        const progressBar = document.querySelector('.scroll-progress-bar');
        const backToTop = document.querySelector('.back-to-top');
        const hudSection = document.getElementById('hud-section');
        const hudPercent = document.getElementById('hud-percent');
        const hudProgress = document.getElementById('hud-progress');
        const hud = document.getElementById('hud');
        const navLinks = Array.from(document.querySelectorAll('.nav-link'));
        const sections = Array.from(document.querySelectorAll('main section[id]'));

        let ticking = false;

        const update = () => {
            const y = window.scrollY;
            const viewport = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const max = Math.max(docHeight - viewport, 1);
            const pct = Math.min(100, Math.max(0, Math.round((y / max) * 100)));

            if (nav) nav.classList.toggle('scrolled', y > 24);
            if (backToTop) backToTop.classList.toggle('visible', y > 520);
            if (hud) hud.classList.toggle('is-visible', y > 320);

            if (progressBar) progressBar.style.width = pct + '%';
            if (progressContainer) progressContainer.style.opacity = y > 120 ? '1' : '0';

            if (hudPercent) hudPercent.textContent = String(pct).padStart(2, '0');
            if (hudProgress) hudProgress.style.width = pct + '%';

            // Current section = last one whose top has crossed the reading line.
            const line = y + viewport * 0.32;
            let current = sections[0] || null;
            for (const section of sections) {
                const top = section.getBoundingClientRect().top + y;
                if (top <= line) current = section;
            }

            if (current) {
                if (hudSection) {
                    hudSection.textContent = (current.dataset.label || current.id).replace(/^\d+\s*·\s*/, '');
                }
                const id = current.getAttribute('id');
                navLinks.forEach((link) => {
                    const active = link.getAttribute('href') === '#' + id;
                    link.classList.toggle('active', active);
                    if (active) link.setAttribute('aria-current', 'page');
                    else link.removeAttribute('aria-current');
                });
            }
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                update();
                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        update();
    }

    /* ---------------------------------------------------------------------
       Scroll reveals
       --------------------------------------------------------------------- */
    function initReveals() {
        const elements = Array.from(document.querySelectorAll(
            '.stagger-item, .fade-in, .slide-in-left, .slide-in-right, .slide-in-up, .scale-in'
        ));
        if (!elements.length) return;

        if (reduceMotion() || !('IntersectionObserver' in window)) {
            elements.forEach((el) => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
                // Drop the stagger delay once the reveal is done so hover/tilt
                // transitions stay instant afterwards.
                window.setTimeout(() => {
                    entry.target.classList.remove('delay-100', 'delay-200', 'delay-300', 'delay-400');
                }, 1200);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

        elements.forEach((el) => observer.observe(el));
    }

    /* ---------------------------------------------------------------------
       Terminal typing
       --------------------------------------------------------------------- */
    function initTerminal() {
        const typed = document.getElementById('typed-command');
        const output = document.getElementById('terminal-output');
        const cursor = document.getElementById('cursor');
        if (!typed || !output || !cursor) return;

        const commands = [
            { cmd: 'whoami', output: 'Forward Deployed Engineer · AI Full-Stack Developer' },
            { cmd: 'cat focus.txt', output: 'OCR · RAG · AI agents · production delivery' },
            { cmd: 'ls projects/', output: 'centralize  medical-camp  harmonix  a2z-converters' },
            { cmd: 'status', output: 'Shipping @ Tiny Magiq · open to opportunities' }
        ];

        if (reduceMotion()) {
            typed.textContent = commands[0].cmd;
            output.innerHTML = '<span class="text-accent">&gt;</span> <span class="text-muted">' + commands[0].output + '</span>';
            cursor.style.display = 'none';
            return;
        }

        let index = 0;
        let char = 0;

        function type() {
            const { cmd, output: line } = commands[index];

            if (char < cmd.length) {
                typed.textContent = cmd.slice(0, char + 1);
                char += 1;
                window.setTimeout(type, 48 + Math.random() * 46);
                return;
            }

            cursor.style.display = 'none';
            output.innerHTML = '<span class="text-accent">&gt;</span> <span class="text-muted">' + line + '</span>';

            window.setTimeout(() => {
                typed.textContent = '';
                output.innerHTML = '';
                cursor.style.display = 'inline-block';
                char = 0;
                index = (index + 1) % commands.length;
                window.setTimeout(type, 280);
            }, 2800);
        }

        window.setTimeout(type, 700);
    }

    /* ---------------------------------------------------------------------
       Hero: timecode + pointer parallax
       --------------------------------------------------------------------- */
    function initHeroTimecode() {
        const el = document.getElementById('hero-timecode');
        if (!el) return;

        if (reduceMotion()) {
            el.textContent = '00:00:00';
            return;
        }

        const start = performance.now();
        window.setInterval(() => {
            const t = (performance.now() - start) / 1000;
            const minutes = Math.floor(t / 60);
            const seconds = Math.floor(t % 60);
            const frames = Math.floor((t % 1) * 24);
            el.textContent = [minutes, seconds, frames].map((n) => String(n).padStart(2, '0')).join(':');
        }, 90);
    }

    function initHeroPointer() {
        if (reduceMotion() || !canHover()) return;
        const hero = document.getElementById('hero');
        if (!hero) return;
        const layers = Array.from(hero.querySelectorAll('.hero-aurora span'));
        if (!layers.length) return;

        let raf = 0;
        hero.addEventListener('pointermove', (event) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const rect = hero.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                layers.forEach((layer, i) => {
                    const depth = (i + 1) * 12;
                    layer.style.translate = (x * depth).toFixed(1) + 'px ' + (y * depth).toFixed(1) + 'px';
                });
            });
        });

        hero.addEventListener('pointerleave', () => {
            layers.forEach((layer) => { layer.style.translate = '0px 0px'; });
        });
    }

    /* ---------------------------------------------------------------------
       Particle field
       --------------------------------------------------------------------- */
    function initParticles() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas || reduceMotion()) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const hero = document.getElementById('hero');
        const mouse = { x: -9999, y: -9999 };
        let width = 0;
        let height = 0;
        let dpr = 1;
        let points = [];
        let raf = 0;
        let inView = true;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const target = Math.round((width * height) / 24000);
            const count = Math.max(16, Math.min(width < 720 ? 34 : 64, target));
            points = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.24,
                vy: (Math.random() - 0.5) * 0.24,
                r: Math.random() * 1.4 + 0.5
            }));
        };

        const draw = () => {
            if (!inView) { raf = 0; return; }
            ctx.clearRect(0, 0, width, height);

            const linkDistance = width < 720 ? 96 : 124;

            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10;
                if (p.y > height + 10) p.y = -10;

                const dxm = p.x - mouse.x;
                const dym = p.y - mouse.y;
                const mouseDist = Math.sqrt(dxm * dxm + dym * dym);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = mouseDist < 140 ? 'rgba(167, 139, 250, 0.9)' : 'rgba(103, 232, 249, 0.72)';
                ctx.fill();

                if (mouseDist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = 'rgba(34, 211, 238, ' + (0.16 * (1 - mouseDist / 150)).toFixed(3) + ')';
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }

                for (let j = i + 1; j < points.length; j++) {
                    const q = points[j];
                    const dx = p.x - q.x;
                    const dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > linkDistance) continue;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = 'rgba(34, 211, 238, ' + (0.13 * (1 - dist / linkDistance)).toFixed(3) + ')';
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }

            raf = requestAnimationFrame(draw);
        };

        const start = () => {
            if (!raf && inView && !document.hidden) raf = requestAnimationFrame(draw);
        };

        const stop = () => {
            if (raf) cancelAnimationFrame(raf);
            raf = 0;
        };

        resize();
        start();

        window.addEventListener('resize', () => {
            stop();
            resize();
            start();
        });

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                inView = entries[0].isIntersecting;
                if (inView) start(); else stop();
            }, { threshold: 0 });
            io.observe(canvas);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop(); else start();
        });

        if (hero) {
            hero.addEventListener('pointermove', (event) => {
                const rect = canvas.getBoundingClientRect();
                mouse.x = event.clientX - rect.left;
                mouse.y = event.clientY - rect.top;
            });
            hero.addEventListener('pointerleave', () => {
                mouse.x = -9999;
                mouse.y = -9999;
            });
        }
    }

    /* ---------------------------------------------------------------------
       Card tilt + spotlight
       --------------------------------------------------------------------- */
    function initTilt() {
        if (reduceMotion() || !canHover()) return;
        const cards = Array.from(document.querySelectorAll('.project-card, .capability-card'));
        if (!cards.length) return;

        cards.forEach((card) => {
            let raf = 0;

            card.addEventListener('pointermove', (event) => {
                if (raf) return;
                const x = event.clientX;
                const y = event.clientY;
                raf = requestAnimationFrame(() => {
                    raf = 0;
                    const rect = card.getBoundingClientRect();
                    const px = (x - rect.left) / rect.width;
                    const py = (y - rect.top) / rect.height;
                    card.style.setProperty('--rx', ((0.5 - py) * 6).toFixed(2) + 'deg');
                    card.style.setProperty('--ry', ((px - 0.5) * 6).toFixed(2) + 'deg');
                    card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
                    card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
                });
            });

            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });
    }

    /* ---------------------------------------------------------------------
       Magnetic buttons
       --------------------------------------------------------------------- */
    function initMagnetic() {
        if (reduceMotion() || !canHover()) return;
        const items = Array.from(document.querySelectorAll('[data-magnetic]'));
        items.forEach((el) => {
            el.addEventListener('pointermove', (event) => {
                const rect = el.getBoundingClientRect();
                const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
                const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
                el.style.translate = (x * 4.5).toFixed(1) + 'px ' + (y * 3.5).toFixed(1) + 'px';
            });
            el.addEventListener('pointerleave', () => {
                el.style.translate = '0px 0px';
            });
        });
    }

    /* ---------------------------------------------------------------------
       Tech ticker clone for a seamless loop
       --------------------------------------------------------------------- */
    function initTicker() {
        const track = document.getElementById('tech-ticker-track');
        if (!track) return;
        const group = track.querySelector('.tech-ticker-group');
        if (!group) return;
        const clone = group.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
        track.classList.add('is-ready');
    }

    /* ---------------------------------------------------------------------
       Count-up stats
       --------------------------------------------------------------------- */
    function initCounters() {
        const items = Array.from(document.querySelectorAll('[data-count]'));
        if (!items.length) return;

        const format = (value, pad) => (pad ? String(value).padStart(pad, '0') : String(value));

        const animate = (el) => {
            const target = parseInt(el.dataset.count, 10) || 0;
            const pad = parseInt(el.dataset.pad, 10) || 0;

            if (reduceMotion()) {
                el.textContent = format(target, pad);
                return;
            }

            const duration = 1200;
            const start = performance.now();
            const step = (now) => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = format(Math.round(target * eased), pad);
                if (p < 1) requestAnimationFrame(step);
                else el.textContent = format(target, pad);
            };
            requestAnimationFrame(step);
        };

        if (!('IntersectionObserver' in window)) {
            items.forEach(animate);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                animate(entry.target);
            });
        }, { threshold: 0.5 });

        items.forEach((el) => observer.observe(el));
    }

    /* ---------------------------------------------------------------------
       IST clock
       --------------------------------------------------------------------- */
    function initLocalTime() {
        const el = document.getElementById('local-time');
        if (!el) return;

        const render = () => {
            try {
                const time = new Date().toLocaleTimeString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                el.textContent = time + ' IST';
            } catch (e) {
                el.textContent = 'IST';
            }
        };

        render();
        window.setInterval(render, 30000);
    }

    /* ---------------------------------------------------------------------
       Boot
       --------------------------------------------------------------------- */
    function boot() {
        initTheme();
        initPreloader();
        initSectionLabels();
        initScrollUI();
        initReveals();
        initTerminal();
        initHeroTimecode();
        initHeroPointer();
        initParticles();
        initTilt();
        initMagnetic();
        initTicker();
        initCounters();
        initLocalTime();

        const menu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-overlay');
        if (menu) menu.setAttribute('aria-hidden', 'true');
        if (overlay) overlay.setAttribute('aria-hidden', 'true');

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            if (menu && menu.classList.contains('open')) window.toggleMobileMenu();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 900 && menu && menu.classList.contains('open')) {
                window.toggleMobileMenu();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
