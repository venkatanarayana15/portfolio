document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------
    // Mobile Menu & Theme Toggles
    // -----------------------------------------
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-overlay');
    const hamburger = document.querySelector('.hamburger');

    window.toggleMobileMenu = function() {
        if (!menu || !overlay || !hamburger) return;
        menu.classList.toggle('open');
        overlay.classList.toggle('open');
        hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', hamburger.classList.contains('open'));
    };

    window.toggleTheme = function() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    // -----------------------------------------
    // Copy to Clipboard
    // -----------------------------------------
    window.copyEmail = function() {
        const email = 'venkatnarayana727@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
            const toast = document.getElementById('toast');
            if (toast) {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(-50%) translateY(0)';
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateX(-50%) translateY(10px)';
                }, 2000);
            }
        });
    };

    // -----------------------------------------
    // Scroll To Top
    // -----------------------------------------
    window.scrollToTop = function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // -----------------------------------------
    // Active Navigation Highlighting
    // -----------------------------------------
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollY = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - window.innerHeight / 3;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // -----------------------------------------
    // Intersection Observer for Animations
    // -----------------------------------------
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // Animate sections and cards on scroll
    const animatedElements = document.querySelectorAll('.fade-in, .skill-card, .project-card, .timeline-item');
    
    const elementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: add stagger effect for children
                const children = entry.target.querySelectorAll('.stagger-item');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('visible');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => elementObserver.observe(el));

    // -----------------------------------------
    // Back to top visibility
    // -----------------------------------------
    const backToTop = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        updateActiveNav();
        if (backToTop) {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });

    // -----------------------------------------
    // Terminal Typing Effect
    // -----------------------------------------
    const commands = [
        { cmd: 'npx start-portfolio', output: 'Loading modules... Done.' },
        { cmd: 'whoami', output: 'Venkata Narayana G V - Forward Deployed Engineer' },
        { cmd: 'skills --list', output: 'MERN Stack, Serverless, GenAI, DevOps' },
        { cmd: 'status', output: 'Building scalable software @ Tiny Magiq' }
    ];
    
    let currentCommandIndex = 0;
    let currentChar = 0;
    
    const typedCommand = document.getElementById('typed-command');
    const terminalOutput = document.getElementById('terminal-output');
    const cursor = document.getElementById('cursor');
    
    function typeCommand() {
        if (!typedCommand || !terminalOutput || !cursor) return;

        if (currentCommandIndex >= commands.length) {
            currentCommandIndex = 0;
        }
        
        const { cmd, output } = commands[currentCommandIndex];
        
        if (currentChar < cmd.length) {
            typedCommand.textContent = cmd.substring(0, currentChar + 1);
            currentChar++;
            setTimeout(typeCommand, Math.random() * 50 + 50); // random typing speed
        } else {
            cursor.style.display = 'none';
            terminalOutput.innerHTML = `<span class="text-accent mr-2">➜</span><span class="text-muted">${output}</span>`;
            
            setTimeout(() => {
                typedCommand.textContent = '';
                terminalOutput.innerHTML = '';
                cursor.style.display = 'inline-block';
                currentChar = 0;
                currentCommandIndex++;
                setTimeout(typeCommand, 300);
            }, 3000); // Wait before next command
        }
    }
    
    setTimeout(typeCommand, 1000);

    // Initial Trigger
    updateActiveNav();
});

// Immediately invoked theme check to prevent flash of wrong theme
(function() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
})();
document.addEventListener('DOMContentLoaded', () => {
    const containers = ['focus-scroll-container', 'interests-scroll-container'];
    
    containers.forEach(id => {
        const carousel = document.getElementById(id);
        if (!carousel) return;

        let isAutoScrolling = true;
        const scrollInterval = 3000; // Slide every 4 seconds

        function autoSlide() {
            // Only run on mobile (when the element is a flex container, not a grid)
            if (window.innerWidth >= 768 || !isAutoScrolling) return;

            const firstChild = carousel.firstElementChild;
            if (!firstChild) return;

            const cardWidth = firstChild.offsetWidth + 24; // Card + Gap
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;

            if (carousel.scrollLeft >= maxScroll - 10) {
                // Reset to beginning if at the end
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Move to next card
                carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
            }
        }

        // Start interval
        let slideTimer = setInterval(autoSlide, scrollInterval);

        // Pause auto-slide when user touches the carousel
        carousel.addEventListener('touchstart', () => {
            isAutoScrolling = false;
            clearInterval(slideTimer);
        }, { passive: true });
    });
});