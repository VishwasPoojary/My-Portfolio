/**
 * EFFECTS.JS - Advanced Visual Effects & Cinematic Interaction Layer
 * Vishwas J Portfolio
 * Includes: Particle Canvas, Smooth Custom Cursor, 3D Card Tilt, Magnetic Physics, Cyber HUD
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ==========================================================================
     1. PAGE LOAD STAGGER ENTRANCE
     ========================================================================== */
  function initPageEntrance() {
    if (prefersReducedMotion) return;
    const markLoaded = () => document.body.classList.add('page-loaded');
    if (document.readyState === 'complete') {
      markLoaded();
    } else {
      window.addEventListener('load', markLoaded);
      setTimeout(markLoaded, 1200); // Fallback
    }
  }

  /* ==========================================================================
     2. INTERACTIVE BACKGROUND PARTICLE CANVAS
     ========================================================================== */
  function initParticleNetworkCanvas() {
    if (prefersReducedMotion) return;

    const canvas = document.getElementById('bg-network-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId = null;
    let isTabVisible = true;

    // Particle pool
    const particles = [];
    const maxParticles = window.innerWidth < 768 ? 22 : (window.innerWidth < 1200 ? 40 : 55);
    const maxDistance = 125;
    const mouseRadius = 140;

    const mouse = {
      x: null,
      y: null,
      isActive: false
    };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.scale(dpr, dpr);
    }

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : (Math.random() > 0.5 ? -10 : height + 10);
        this.vx = (Math.random() - 0.5) * 0.55;
        this.vy = (Math.random() - 0.5) * 0.55;
        this.radius = Math.random() * 1.8 + 1.1;
        this.alpha = Math.random() * 0.45 + 0.2;
        // Alternate purple and cyan cyber palette
        this.isCyan = Math.random() > 0.55;
      }

      update() {
        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges softly
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;

        // Interactive mouse repulsion
        if (mouse.isActive && mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius && dist > 0) {
            const force = (mouseRadius - dist) / mouseRadius;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 2.2;
            this.y += Math.sin(angle) * force * 2.2;
          }
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.isCyan) {
          ctx.fillStyle = `rgba(56, 189, 248, ${this.alpha})`;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
        } else {
          ctx.fillStyle = `rgba(168, 85, 247, ${this.alpha})`;
          ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
        }
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }
    }

    // Populate particles
    resize();
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    // Connect proximity lines
    function drawConnections() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const baseLineAlpha = isLight ? 0.08 : 0.12;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * baseLineAlpha;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.isCyan
              ? `rgba(56, 189, 248, ${alpha})`
              : `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }
    }

    // Render loop
    function render() {
      if (!isTabVisible) return;

      ctx.clearRect(0, 0, width, height);

      drawConnections();

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    // Window events
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
      }, 150);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isActive = true;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      mouse.isActive = false;
      mouse.x = null;
      mouse.y = null;
    });

    // Pause canvas calculation when tab is hidden to preserve battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isTabVisible = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        isTabVisible = true;
        render();
      }
    });

    render();
  }

  /* ==========================================================================
     3. 3D CARD TILT & SPECULAR GLARE
     ========================================================================== */
  function init3DCardTilt() {
    if (prefersReducedMotion || isTouchDevice) return;

    // Select stationary cards and project cards
    const cards = document.querySelectorAll(
      '.about-card-unified, .experience-card, .cert-card, .edu-card, .contact-item-card, .contact-form-card'
    );

    cards.forEach((card) => {
      card.classList.add('tilt-card');

      // Inject specular glare element if not already present
      if (!card.querySelector('.specular-glare')) {
        const glare = document.createElement('div');
        glare.className = 'specular-glare';
        glare.setAttribute('aria-hidden', 'true');
        card.appendChild(glare);
      }

      let tiltRaf = null;

      const handleMouseMove = (e) => {
        if (tiltRaf) cancelAnimationFrame(tiltRaf);

        tiltRaf = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Subtle angles (max 6deg)
          const rotateY = ((x / rect.width) - 0.5) * 8;
          const rotateX = ((y / rect.height) - 0.5) * -8;

          card.style.setProperty('--glare-x', `${x}px`);
          card.style.setProperty('--glare-y', `${y}px`);
          card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
        });
      };

      const handleMouseLeave = () => {
        if (tiltRaf) cancelAnimationFrame(tiltRaf);
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      };

      card.addEventListener('mousemove', handleMouseMove, { passive: true });
      card.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  /* ==========================================================================
     5. MAGNETIC BUTTON PHYSICS
     ========================================================================== */
  function initMagneticElements() {
    if (prefersReducedMotion || isTouchDevice) return;

    const magneticElements = document.querySelectorAll(
      '.btn-primary, .btn-secondary, .hero-social-btn, .social-pill, .hero-social-pill, .theme-toggle, .back-to-top'
    );

    magneticElements.forEach((el) => {
      el.classList.add('magnetic-btn');

      const handleMouseMove = (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.28;
        const deltaY = (e.clientY - centerY) * 0.28;

        el.style.transform = `translate3d(${deltaX.toFixed(1)}px, ${deltaY.toFixed(1)}px, 0)`;
      };

      const handleMouseLeave = () => {
        el.style.transform = 'translate3d(0, 0, 0)';
      };

      el.addEventListener('mousemove', handleMouseMove, { passive: true });
      el.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  /* ==========================================================================
     6. CYBER EASTER EGG HUD
     ========================================================================== */
  function initCyberEasterEgg() {
    let hud = document.getElementById('cyber-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'cyber-hud';
      hud.className = 'cyber-hud-badge';
      hud.setAttribute('aria-hidden', 'true');
      hud.innerHTML = `
        <span class="cyber-hud-dot"></span>
        <span id="cyber-hud-text">SYS_STATUS: OPTIMAL // DEV: VISHWAS J</span>
      `;
      document.body.appendChild(hud);
    }

    let hideTimer = null;
    const triggerHud = (message) => {
      if (message) {
        const textEl = document.getElementById('cyber-hud-text');
        if (textEl) textEl.textContent = message;
      }
      hud.classList.add('hud-active');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        hud.classList.remove('hud-active');
      }, 3500);
    };

    // Double click logo trigger
    const logo = document.querySelector('.site-logo, .nav-logo');
    if (logo) {
      logo.addEventListener('dblclick', (e) => {
        e.preventDefault();
        triggerHud('ENCRYPTION: ACTIVE // CYBER PROTOCOLS VERIFIED');
      });
    }

    // Press ~ (Tilde) key trigger
    window.addEventListener('keydown', (e) => {
      if (e.key === '`' || e.key === '~') {
        // Do not trigger if typing in form inputs
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        triggerHud('TERMINAL LINK INITIALIZED // VISHWAS J ONLINE');
      }
    });
  }

  /* ==========================================================================
     INITIALIZATION ORCHESTRATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initPageEntrance();
    initParticleNetworkCanvas();
    init3DCardTilt();
    initMagneticElements();
    initCyberEasterEgg();
  });

})();
