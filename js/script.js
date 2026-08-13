/* ==========================================================================
   SCRIPT.JS - Vishwas J Minimal & Honest Portfolio Interactivity
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --- 1. Sticky Header & Section Highlight --- */
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  const handleScroll = () => {

    if (header) {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 130;
      const sectionHeight = section.offsetHeight;

      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {
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
  const onScroll = () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        isTicking = false;
      });
      isTicking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once when page loads
  handleScroll();


  /* --- 2. Mobile Navigation Hamburger Menu --- */
  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('nav-links');

  if (hamburger && navLinksContainer) {

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('active');
      });
    });
  }


  /* --- 3. Theme Toggle (Dark / Light Theme) --- */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  const savedTheme =
    localStorage.getItem('vishwas-portfolio-theme') || 'dark';

  htmlElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {

    themeToggleBtn.addEventListener('click', () => {

      const currentTheme =
        htmlElement.getAttribute('data-theme');

      const newTheme =
        currentTheme === 'dark' ? 'light' : 'dark';

      htmlElement.setAttribute('data-theme', newTheme);

      localStorage.setItem(
        'vishwas-portfolio-theme',
        newTheme
      );

      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {

    if (!themeToggleBtn) return;

    const icon = themeToggleBtn.querySelector('i');

    if (!icon) return;

    if (theme === 'light') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  }


  /* --- 4. Subtitle Typing Effect --- */
  const typingText = document.getElementById('typing-text');

  if (typingText) {

    const titles = [
      'BCA Student',
      'Aspiring Software Developer',
      'Cybersecurity Enthusiast'
    ];

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    const typeTitle = () => {

      const currentTitle = titles[titleIndex];

      if (isDeleting) {

        typingText.textContent =
          currentTitle.substring(0, charIndex - 1);

        charIndex--;
        typeSpeed = 40;

      } else {

        typingText.textContent =
          currentTitle.substring(0, charIndex + 1);

        charIndex++;
        typeSpeed = 90;
      }

      if (
        !isDeleting &&
        charIndex === currentTitle.length
      ) {

        typeSpeed = 2000;
        isDeleting = true;

      } else if (
        isDeleting &&
        charIndex === 0
      ) {

        isDeleting = false;

        titleIndex =
          (titleIndex + 1) % titles.length;

        typeSpeed = 400;
      }

      setTimeout(typeTitle, typeSpeed);
    };

    typeTitle();
  }


  /* --- 5. Scroll Reveal Observer --- */
  const revealElements =
    document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {

    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add('active');

              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12
        }
      );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

  } else {

    // Fallback for browsers without IntersectionObserver
    revealElements.forEach(element => {
      element.classList.add('active');
    });
  }


  /* --- 6. Contact Form Submission --- */

  const contactForm =
    document.getElementById('contact-form');

  const toast =
    document.getElementById('toast');

  const toastMessage =
    document.getElementById('toast-message');


  if (contactForm) {

    contactForm.addEventListener('submit', () => {

      /*
        IMPORTANT:
        We intentionally DO NOT use e.preventDefault() here.

        The form must be allowed to submit normally to Formspree
        using the action and method attributes in the HTML.
      */

      showToast('Sending your message...');
    });
  }


  function showToast(message) {

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }


  /* --- 7. Back-To-Top Button --- */
  const backToTopBtn =
    document.getElementById('back-to-top');

  if (backToTopBtn) {

    backToTopBtn.addEventListener('click', () => {

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    });
  }

});