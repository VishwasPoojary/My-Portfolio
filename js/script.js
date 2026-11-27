/* ==========================================================================
   SCRIPT.JS - Vishwas J Portfolio
   Interactive Engine: Floating Nav, Scroll Reveals, Continuous Rows & Contact Form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. CONDITIONAL POPOVER POLYFILL --- */
  if (!Object.hasOwn(HTMLElement.prototype, 'popover')) {
    const polyfill = document.createElement('script');
    polyfill.src = 'https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js';
    document.head.appendChild(polyfill);
  }

  /* --- 2. RESPONSIVE SITE HEADER & POPOVER NAVIGATION --- */
  const headerWrapper = document.getElementById('header-wrapper');
  const headerInner = headerWrapper ? headerWrapper.querySelector('.header-inner') : null;
  const siteMenu = document.getElementById('site-menu');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (headerWrapper && headerInner && siteMenu) {
    let lastMeasuredWidth = 0;

    const updateNavLayout = (forceMeasure = false) => {
      const currentWidth = headerWrapper.clientWidth;
      const isCurrentlyWide = headerWrapper.classList.contains('is-wide');
      if (!forceMeasure && !isCurrentlyWide && currentWidth <= lastMeasuredWidth) {
        return;
      }
      lastMeasuredWidth = currentWidth;

      const wasOpen = siteMenu.matches(':popover-open') || siteMenu.classList.contains(':popover-open');
      headerWrapper.classList.add('is-measuring');
      headerWrapper.classList.add('is-wide');
      siteMenu.removeAttribute('popover');

      const fitsInline = headerInner.scrollWidth <= headerInner.clientWidth;
      if (!fitsInline) {
        headerWrapper.classList.remove('is-wide');
        siteMenu.setAttribute('popover', 'auto');
        if (wasOpen && typeof siteMenu.showPopover === 'function') {
          try {
            siteMenu.showPopover();
          } catch {
            // Ignore if popover cannot be reopened during transition
          }
        }
      }

      requestAnimationFrame(() => {
        headerWrapper.classList.remove('is-measuring');
      });
    };

    updateNavLayout(true);
    if ('ResizeObserver' in window) {
      const navObserver = new ResizeObserver(() => updateNavLayout(false));
      navObserver.observe(headerWrapper);
      navObserver.observe(siteMenu);
    } else {
      window.addEventListener('resize', () => updateNavLayout(true));
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => updateNavLayout(true));
    }

    // Close collapsed popover when selecting an anchor link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (!headerWrapper.classList.contains('is-wide') && typeof siteMenu.hidePopover === 'function') {
          try {
            siteMenu.hidePopover();
          } catch {
            // Ignore if already closed
          }
        }
      });
    });
  }

  /* --- 3. HEADER SCROLL TRACKING --- */
  const handleScroll = () => {
    const scrollY = window.scrollY;

    if (headerWrapper) {
      if (scrollY > 40) {
        headerWrapper.classList.add('header-scrolled');
      } else {
        headerWrapper.classList.remove('header-scrolled');
      }
    }

    if (sections.length === 0) return;

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    if (currentSection) {
      const matchingLink = Array.from(navLinks).find(
        link => link.getAttribute('href') === `#${currentSection}`
      );
      if (matchingLink) {
        navLinks.forEach(link => {
          const isCurrent = link === matchingLink;
          link.classList.toggle('active', isCurrent);
          if (isCurrent) {
            link.setAttribute('aria-current', 'page');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }
    }
  };

  let isTicking = false;
  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });

  handleScroll();


  /* --- 4. INTERSECTION OBSERVER FOR SCROLL REVEALS --- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }


  /* --- 5. FORMSPREE CONTACT FORM SUBMISSION & TOAST --- */
  const contactForm = document.getElementById('contact-form');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  function showToast(msg) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      // Allow natural POST submission to Formspree endpoint
      showToast('Transmitting your message to Vishwas J...');
    });
  }


  /* --- 6. BACK-TO-TOP BUTTON --- */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  /* --- 7. SUBTLE INTERACTIVE TILT / MOUSE MOVE GLOW --- */
  const interactiveCards = document.querySelectorAll('.featured-project-card, .tech-chip');
  
  if (window.innerWidth > 992 && !prefersReducedMotion) {
    interactiveCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }


  /* --- 8. ROW-WISE CONTINUOUS AUTO-MOVE & MANUAL MOUSE DRAG/SCROLL --- */
  function initInteractiveRowScroll(wrapperId, trackId, itemCountInOneSet, speedInPxPerSec = 34) {
    const wrapper = document.getElementById(wrapperId);
    const track = document.getElementById(trackId);
    if (!wrapper || !track) return;

    let isDown = false;
    let hasMoved = false;
    let startX = 0;
    let startScrollLeft = 0;
    let isHovered = false;
    let resumeTimeout = null;
    let loopDist = 0;
    let currentScroll = wrapper.scrollLeft || 0;
    let lastTime = null;

    const updateLoopDistance = () => {
      const items = track.children;
      if (items.length > itemCountInOneSet && items[itemCountInOneSet]) {
        const dist = items[itemCountInOneSet].offsetLeft - items[0].offsetLeft;
        if (dist > 50) {
          loopDist = dist;
        }
      }
      if (!loopDist || loopDist <= 0) {
        loopDist = track.scrollWidth / 4;
      }
    };

    updateLoopDistance();
    window.addEventListener('resize', updateLoopDistance);
    window.addEventListener('load', updateLoopDistance);
    setTimeout(updateLoopDistance, 300);
    setTimeout(updateLoopDistance, 1200);

    // Continuous smooth animation loop using timestamp delta for consistency
    function step(currentTime) {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05); // cap at 50ms to prevent jumps
      lastTime = currentTime;

      if (!isDown && !isHovered && !prefersReducedMotion) {
        currentScroll += speedInPxPerSec * deltaTime;
        if (loopDist > 0 && currentScroll >= loopDist) {
          currentScroll -= loopDist;
        }
        wrapper.scrollLeft = currentScroll;
      } else if (!isDown) {
        // Keep in sync with user scrolling or external adjustments
        currentScroll = wrapper.scrollLeft;
      }

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    // Hover state management: pause when cursor enters, resume when cursor leaves
    wrapper.addEventListener('mouseenter', () => {
      isHovered = true;
      clearTimeout(resumeTimeout);
    });

    wrapper.addEventListener('mouseleave', () => {
      if (!isDown) {
        isHovered = false;
      }
    });

    wrapper.addEventListener('mousemove', () => {
      if (!isHovered && !isDown) {
        isHovered = true;
      }
    });

    // Keyboard accessibility focus
    wrapper.addEventListener('focusin', () => {
      isHovered = true;
      clearTimeout(resumeTimeout);
    });

    wrapper.addEventListener('focusout', () => {
      if (!wrapper.matches(':hover')) {
        isHovered = false;
      }
    });

    // Mouse drag scrolling
    wrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      hasMoved = false;
      isHovered = true;
      clearTimeout(resumeTimeout);
      wrapper.classList.add('grabbing');
      startX = e.pageX - wrapper.offsetLeft;
      startScrollLeft = wrapper.scrollLeft;
    });

    window.addEventListener('mouseup', (e) => {
      if (isDown) {
        isDown = false;
        wrapper.classList.remove('grabbing');
        currentScroll = wrapper.scrollLeft;
        // If mouse is no longer over the wrapper, resume moving
        if (!wrapper.contains(e.target)) {
          isHovered = false;
        }
      }
    });

    wrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - wrapper.offsetLeft;
      const diff = Math.abs(x - startX);
      if (diff > 4) {
        hasMoved = true;
        e.preventDefault();
        const walk = (x - startX) * 1.5;
        let newScroll = startScrollLeft - walk;
        if (loopDist > 0) {
          while (newScroll < 0) newScroll += loopDist;
          while (newScroll >= loopDist) newScroll -= loopDist;
        }
        wrapper.scrollLeft = newScroll;
        currentScroll = newScroll;
      }
    });

    // Prevent accidental click when dragging
    wrapper.addEventListener('click', (e) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        hasMoved = false;
      }
    }, true);

    // Trackpad / mouse wheel horizontal scrolling
    wrapper.addEventListener('wheel', (e) => {
      isHovered = true;
      clearTimeout(resumeTimeout);
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      currentScroll += delta * 0.8;
      if (loopDist > 0) {
        while (currentScroll >= loopDist) currentScroll -= loopDist;
        while (currentScroll < 0) currentScroll += loopDist;
      }
      wrapper.scrollLeft = currentScroll;
      resumeTimeout = setTimeout(() => {
        if (!wrapper.matches(':hover')) {
          isHovered = false;
        }
      }, 600);
    }, { passive: true });

    // Touch events for mobile/tablet swipe
    wrapper.addEventListener('touchstart', () => {
      isHovered = true;
      currentScroll = wrapper.scrollLeft;
      clearTimeout(resumeTimeout);
    }, { passive: true });

    wrapper.addEventListener('touchmove', () => {
      currentScroll = wrapper.scrollLeft;
    }, { passive: true });

    wrapper.addEventListener('touchend', () => {
      currentScroll = wrapper.scrollLeft;
      resumeTimeout = setTimeout(() => {
        isHovered = false;
      }, 1000);
    }, { passive: true });
  }

  // Initialize for both Technologies (4 items/set) and Projects (4 items/set)
  initInteractiveRowScroll('tech-scroll-wrapper', 'tech-scroll-track', 4, 30);
  initInteractiveRowScroll('projects-scroll-wrapper', 'projects-scroll-track', 4, 28);

  /* --- 9. QUICK JUMP PORTFOLIO SEARCH MODAL --- */
  const searchDialog = document.getElementById('portfolio-search-dialog');
  const searchInput = document.getElementById('portfolio-search-input');
  const searchResults = document.getElementById('portfolio-search-results');
  const searchEmpty = document.getElementById('portfolio-search-empty');
  const searchBtn = document.querySelector('.nav-search-btn');

  if (searchDialog && searchInput && searchResults && searchEmpty) {
    const quickItems = [
      { label: 'About Me — BCA Student (2024–2027)', tag: 'Section', href: '#about' },
      { label: 'Technical Skills — Python, SQL, HTML, CSS', tag: 'Section', href: '#skills' },
      { label: 'AdaptIQ — Adaptive Learning Platform', tag: 'Project', href: '#projects' },
      { label: 'CyberOptimus — AI-Assisted Web Security', tag: 'Project', href: '#projects' },
      { label: 'Tech Manthan — Event Web Portal', tag: 'Project', href: '#projects' },
      { label: 'Quiz Master — Interactive Quiz Web App', tag: 'Project', href: '#projects' },
      { label: 'Web Developer Intern — InAmigos Foundation', tag: 'Experience', href: '#experience' },
      { label: 'AI Fundamentals — IBM SkillsBuild', tag: 'Credential', href: '#certifications' },
      { label: 'Introduction to Cloud Computing — Infosys', tag: 'Credential', href: '#certifications' },
      { label: 'Python for Data Science — SWAYAM NPTEL', tag: 'Credential', href: '#certifications' },
      { label: 'Education — BCA, PUC, SSLC', tag: 'Section', href: '#education' },
      { label: 'Contact & Send Message', tag: 'Section', href: '#contact' }
    ];

    const renderSearchResults = (query) => {
      const q = query.trim().toLowerCase();
      const filtered = q
        ? quickItems.filter(item => `${item.label} ${item.tag}`.toLowerCase().includes(q))
        : quickItems;

      searchResults.replaceChildren();
      searchEmpty.hidden = filtered.length > 0;

      filtered.forEach(item => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'search-result-link';
        link.href = item.href;

        const textSpan = document.createElement('span');
        textSpan.textContent = item.label;

        const tagSpan = document.createElement('span');
        tagSpan.className = 'search-result-tag';
        tagSpan.textContent = item.tag;

        link.append(textSpan, tagSpan);
        link.addEventListener('click', () => searchDialog.close());
        li.appendChild(link);
        searchResults.appendChild(li);
      });
    };

    renderSearchResults('');
    searchInput.addEventListener('input', () => renderSearchResults(searchInput.value));

    if (searchBtn && !('commandForElement' in HTMLButtonElement.prototype)) {
      searchBtn.addEventListener('click', () => {
        if (!searchDialog.open) searchDialog.showModal();
      });
      const closeBtn = searchDialog.querySelector('.search-dialog-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => searchDialog.close());
      }
    }

    searchDialog.addEventListener('close', () => {
      searchInput.value = '';
      renderSearchResults('');
    });
  }

});