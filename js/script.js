/* ==========================================================================
   SCRIPT.JS - Vishwas J Portfolio
   Interactive Engine: Floating Nav, Scroll Reveals, Continuous Rows & Contact Form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* --- 2. FLOATING GLASS HEADER & SCROLL TRACKING --- */
  const headerWrapper = document.getElementById('header-wrapper');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const handleScroll = () => {
    const scrollY = window.scrollY;

    if (headerWrapper) {
      if (scrollY > 40) {
        headerWrapper.classList.add('header-scrolled');
      } else {
        headerWrapper.classList.remove('header-scrolled');
      }
    }

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
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


  /* --- 3. MOBILE HAMBURGER NAVIGATION DRAWER --- */
  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('nav-links');

  if (hamburger && navLinksContainer) {
    const toggleMenu = () => {
      hamburger.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
      document.body.style.overflow = navLinksContainer.classList.contains('active') ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close when tapping outside on mobile
    document.addEventListener('click', (e) => {
      if (
        navLinksContainer.classList.contains('active') &&
        !navLinksContainer.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }


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

});