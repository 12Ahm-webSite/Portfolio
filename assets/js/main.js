document.addEventListener('DOMContentLoaded', () => {
    // --- Render Shared Footer ---
    const footer = document.getElementById('site-footer');
    if (footer) {
        footer.innerHTML = `
            <p>Built with HTML, CSS, and Vanilla JS</p>
            <p>&copy; 2026 Ahmed Ali Al-Kamal. All rights reserved. | <span class="footer-location">Sana'a, Yemen</span></p>
        `;
    }

    // --- Dark Mode Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check for saved user preference, if any, on load of the website
    // If not, check the OS preference
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcon(false);
    }

    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            // toggle icons
            const isDark = document.documentElement.classList.contains('dark');
            
            if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
                updateThemeIcon(false);
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
                updateThemeIcon(true);
            }
        });
    }

    function updateThemeIcon(isDark) {
        if(themeIcon) {
            if(isDark) {
                // Sun Icon for dark mode (click to switch to light)
                themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>`;
            } else {
                // Moon Icon for light mode (click to switch to dark)
                themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`;
            }
        }
    }

    // --- Mobile Menu Logic ---
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }

    // --- Spotlight / Cursor Glow (CSS variables) ---
    (function initSpotlight() {
        const root = document.documentElement;
        let rafId = null;
        let lastX = 0;
        let lastY = 0;

        function setVars(x, y) {
            // x/y as viewport percentages for more stable look on resize
            const w = window.innerWidth || 1;
            const h = window.innerHeight || 1;
            const px = Math.max(0, Math.min(100, (x / w) * 100));
            const py = Math.max(0, Math.min(100, (y / h) * 100));
            root.style.setProperty('--spot-x', px + 'vw');
            root.style.setProperty('--spot-y', py + 'vh');
        }

        function onMove(e) {
            lastX = e.clientX;
            lastY = e.clientY;

            if (rafId) return;
            rafId = window.requestAnimationFrame(() => {
                rafId = null;
                setVars(lastX, lastY);
            });
        }

        // touch: move spotlight but avoid accidental scrolling issues
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (!e.touches || !e.touches[0]) return;
            onMove(e.touches[0]);
        }, { passive: true });

        // ensure initial position looks good
        setVars(window.innerWidth * 0.5, window.innerHeight * 0.35);
        // keep glow on navigation even if mouse leaves the screen
        document.body.classList.add('supports-spotlight');
    })();

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    // Stagger index for reveals (also works for dynamically added projects)
    let revealCounter = 0;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stagger using a CSS variable consumed by `assets/css/style.css`
                const delay = revealCounter * 70; // ms
                entry.target.style.setProperty('--reveal-delay', delay + 'ms');
                revealCounter += 1;

                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Run animation once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        observer.observe(el);
    });
    // --- Phone Copy to Clipboard ---
    const phoneCard = document.getElementById('phone-card');
    if (phoneCard) {
        const copyHandler = () => {
            const phoneEl = document.getElementById('phone-number');
            const phone = phoneEl.getAttribute('data-phone');
            copyToClipboard(phone);
            showNotification('Phone number copied to clipboard');
        };

        phoneCard.addEventListener('click', copyHandler);
        phoneCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyHandler();
            }
        });
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('تم النسخ بنجاح');
        }).catch(function(err) {
            console.error('فشل النسخ: ', err);
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    }

    function showNotification(msg) {
        const existing = document.querySelector('.copy-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = msg;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 9999;
            font-size: 14px;
            animation: fadeOut 2s ease-in-out forwards;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    // --- Dynamic Projects Loader ---
    const projectsContainer = document.getElementById('projects-container');

    // Simple HTML escape to prevent XSS
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    if (projectsContainer) {
        fetch('./projects.json')
            .then(response => response.json())
            .then(data => {
                // Remove skeleton cards
                const skeletons = projectsContainer.querySelectorAll('.skeleton-card');
                skeletons.forEach(s => s.remove());

                data.forEach(project => {
                    const article = document.createElement('article');
                    article.className = 'project-card reveal';
                    
                    let websiteIconLink = '';
                    if (project.websiteLink) {
                        websiteIconLink = `
                            <a href="${escapeHtml(project.websiteLink)}" target="_blank" class="project-link" title="Visit Live Website">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        `;
                    }

                    let tagsHtml = '';
                    if (project.tags && project.tags.length > 0) {
                        tagsHtml = '<div class="tag-list compact">';
                        project.tags.forEach(tag => {
                            tagsHtml += `<span class="tag tag-slate">${escapeHtml(tag)}</span>`;
                        });
                        tagsHtml += '</div>';
                    }

                    article.innerHTML = `
                        <div class="project-cover ${escapeHtml(project.coverColor)}">
                            <h3>${escapeHtml(project.shortTitle || project.title)}</h3>
                        </div>
                        <div class="project-body">
                            <div class="project-top">
                                <h3 class="outfit-font">${escapeHtml(project.title)}</h3>
                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    ${websiteIconLink}
                                    <a href="${escapeHtml(project.githubLink)}" target="_blank" class="project-link" title="View Source">
                                        <svg fill="currentColor" viewBox="0 0 24 24">
                                            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <p class="project-description">
                                ${escapeHtml(project.description)}
                            </p>
                            ${tagsHtml}
                        </div>
                    `;
                    projectsContainer.appendChild(article);
                    
                    // Observe the new element for scroll animations
                    if (observer) {
                        observer.observe(article);
                    }
                });
            })
            .catch(error => {
                console.error("Error loading projects:", error);
                // Remove skeleton cards
                const skeletons = projectsContainer.querySelectorAll('.skeleton-card');
                skeletons.forEach(s => s.remove());
                projectsContainer.innerHTML = '<p style="text-align: center; width: 100%; color: var(--color-text-muted);">Failed to load projects. Please try again later.</p>';
            });
    }
});