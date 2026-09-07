'use strict';

/*
 * Every feature lives in its own init function with a guard clause at the
 * top: if a required element is missing, it warns and returns instead of
 * throwing. One absent node can no longer abort the whole script (which
 * used to leave the scroll-reveal content permanently hidden).
 */
(function () {

  // --- Tuning constants ----------------------------------------------------
  // Contracts with other files — must be kept in sync:
  const CARD_GAP_PX = 24;          // matches `gap` on .projects-track in style.css
  const MARQUEE_ICON_COUNT = 8;    // matches the number of .tech-icon nodes in index.html

  const NAV_SHRINK_SCROLL_PX = 40; // scroll distance before the nav pill shrinks

  const TYPE_CHAR_MS = 100;        // per character while typing
  const TYPE_DELETE_MS = 60;       // per character while deleting
  const TYPE_SENTENCE_HOLD_MS = 1800;  // hold a finished sentence before deleting
  const TYPE_LAST_HOLD_MS = 15000; // longer hold on the final message
  const TYPE_NEXT_GAP_MS = 400;    // gap before the next message starts

  const REVEAL_THRESHOLD = 0.15;
  const REVEAL_ROOT_MARGIN = '0px 0px -40px 0px';

  const COUNTER_DURATION_MS = 1200;
  const COUNTER_VISIBLE_RATIO = 0.5;   // fraction of a stat visible before it counts up

  const MARQUEE_FILL_VIEWPORT_MULT = 2.5; // fill the track to this multiple of the viewport
  const MARQUEE_SPEED_NORMAL = 0.4;    // px per frame
  const MARQUEE_SPEED_SLOW = 0.08;     // px per frame while hovered
  const MARQUEE_SPEED_EASING = 0.05;   // lerp factor toward the target speed
  const SCROLL_END_SLACK_PX = 2;       // tolerance when deciding "scrolled to the end"
  // -----------------------------------------------------------------------

  function init() {
    initNav();
    initMobileMenu();
    initHeroTerminal();
    initScrollReveal();
    initProjectsCarousel();
    initAnimatedCounters();
    initProjectModals();
    initTechMarquee();
    initContactForm();
    initFooterYear();
  }

  // === NAV ===
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return console.warn('[nav] .nav not found');

    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > NAV_SHRINK_SCROLL_PX);
    });
  }

  // === MOBILE MENU ===
  function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (!navToggle || !navLinks) return console.warn('[mobile menu] toggle or links not found');

    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // === HERO TERMINAL ===
  function initHeroTerminal() {
    const typewriterEl = document.getElementById('typewriterText');
    if (!typewriterEl) return console.warn('[hero terminal] #typewriterText not found');

    const typewriterMessages = [
      'aguardando aventuras...',
      'ou bugs em produção',
      'às 2h da manhã...'
    ];

    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeLoop() {
      const currentMessage = typewriterMessages[messageIndex];
      const isLastMessage = messageIndex === typewriterMessages.length - 1;

      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      typewriterEl.textContent = currentMessage.substring(0, charIndex);

      let delay = isDeleting ? TYPE_DELETE_MS : TYPE_CHAR_MS;

      if (!isDeleting && charIndex === currentMessage.length) {
        // fully typed: hold longer on the last message, with it still on screen
        delay = isLastMessage ? TYPE_LAST_HOLD_MS : TYPE_SENTENCE_HOLD_MS;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        messageIndex = (messageIndex + 1) % typewriterMessages.length;
        delay = TYPE_NEXT_GAP_MS; // short gap before the next message starts
      }

      setTimeout(typeLoop, delay);
    }

    typeLoop();
  }

  // === SCROLL REVEAL ===
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // === PROJECTS CAROUSEL ===
  function initProjectsCarousel() {
    const track = document.getElementById('projectsTrack');
    const prevBtn = document.getElementById('prevProject');
    const nextBtn = document.getElementById('nextProject');
    if (!track || !prevBtn || !nextBtn) return console.warn('[carousel] track or buttons not found');

    function scrollByCard(direction) {
      const card = track.querySelector('.project-card');
      if (!card) return;
      const cardWidth = card.getBoundingClientRect().width + CARD_GAP_PX;
      track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
    }

    function updateCarouselButtons() {
      const maxScroll = track.scrollWidth - track.clientWidth - SCROLL_END_SLACK_PX;
      prevBtn.disabled = track.scrollLeft <= 0;
      nextBtn.disabled = track.scrollLeft >= maxScroll;
    }

    prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn.addEventListener('click', () => scrollByCard(1));
    track.addEventListener('scroll', updateCarouselButtons, { passive: true });
    window.addEventListener('load', updateCarouselButtons);
    window.addEventListener('resize', updateCarouselButtons);
  }

  // === ANIMATED COUNTER (STATS) ===
  function initAnimatedCounters() {
    const statNumbers = document.querySelectorAll('.stat__number');
    if (!statNumbers.length) return;

    function animatedCount(el) {
      const target = el.getAttribute('data-count');
      const isNumeric = /^\d+$/.test(target);
      if (!isNumeric) {
        el.textContent = target;
        return;
      }

      const targetNum = parseInt(target, 10);
      const duration = COUNTER_DURATION_MS;
      const startTime = performance.now();

      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * targetNum);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = targetNum;
      }
      requestAnimationFrame(step);
    }

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animatedCount(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: COUNTER_VISIBLE_RATIO });

    statNumbers.forEach(el => statsObserver.observe(el));
  }

  // === PROJECT MODALS ===
  // NOTE: each card's <h3> and <ul class="project-card__tags"> in index.html
  // must mirror the title/tags here until the cards are rendered from this data.
  const projectData = {
    'gyro': {
      title: 'Gyro Serviços',
      tags: ['Flask', 'PostgreSQL', 'Docker', 'JS vanilla'],
      description: `Sistema web interno para controlar as manutenções preventivas da frota (troca de óleo, filtros, etc.) com base na quilometragem de cada caminhão. Cada serviço tem um intervalo de KM por categoria de veículo; o sistema calcula o que está vencido / vencendo / em dia e mostra num painel.`,
      images: ['assets/projects/gyro01.png'] // adicionar caminhos de imagens reais aqui quando tiver
    }
  };

  function initProjectModals() {
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    const closeModalBtn = document.getElementById('closeModal');
    if (!modal || !modalContent || !closeModalBtn) return console.warn('[modal] dialog, content or close button not found');

    function openProjectModal(key) {
      const data = projectData[key];
      if (!data) return;

      const galleryHtml = data.images.length
        ? `<div class="modal-gallery">${data.images.map(src => `<img src="${src}" alt="${data.title}">`).join('')}</div>`
        : `<div class="modal-gallery"><div class="modal-gallery--placeholder">imagens em breve</div></div>`;

      modalContent.innerHTML = `
        <h3>${data.title}</h3>
        ${galleryHtml}
        <p>${data.description}</p>
        <ul class="project-card__tags">
          ${data.tags.map(tag => `<li>${tag}</li>`).join('')}
        </ul>
      `;

      modal.showModal();
    }

    document.querySelectorAll('[data-open-project]').forEach(btn => {
      btn.addEventListener('click', () => openProjectModal(btn.getAttribute('data-open-project')));
    });

    closeModalBtn.addEventListener('click', () => modal.close());

    // Close by clicking outside the content
    modal.addEventListener('click', (e) => {
      const rect = modalContent.getBoundingClientRect();
      const clickedOutside =
        e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
      if (clickedOutside) modal.close();
    });
  }

  // === TECH MARQUEE (infinite, hover to slow) ===
  function initTechMarquee() {
    const marquee = document.getElementById('techMarquee');
    const marqueeTrack = document.getElementById('techMarqueeTrack');
    if (!marquee || !marqueeTrack) return console.warn('[marquee] container or track not found');

    // saves the original HTML (a single set) before duplicating
    const originalTrackHTML = marqueeTrack.innerHTML;

    function fillTrack() {
      marqueeTrack.innerHTML = originalTrackHTML;

      // repeatedly doubles until the track is wide enough to loop seamlessly
      while (marqueeTrack.scrollWidth < marquee.clientWidth * MARQUEE_FILL_VIEWPORT_MULT) {
        marqueeTrack.innerHTML += originalTrackHTML;
      }
    }

    fillTrack();

    let position = 0;
    let currentSpeed = MARQUEE_SPEED_NORMAL;
    let targetSpeed = MARQUEE_SPEED_NORMAL;

    marquee.addEventListener('mouseenter', () => { targetSpeed = MARQUEE_SPEED_SLOW; });
    marquee.addEventListener('mouseleave', () => { targetSpeed = MARQUEE_SPEED_NORMAL; });

    function animateMarquee() {
      currentSpeed += (targetSpeed - currentSpeed) * MARQUEE_SPEED_EASING;
      position -= currentSpeed;

      // It resets after traveling the width of ONE original set (not the entire track).
      const singleSetWidth = marqueeTrack.scrollWidth / (marqueeTrack.children.length / MARQUEE_ICON_COUNT);
      if (position <= -singleSetWidth) {
        position += singleSetWidth;
      }

      marqueeTrack.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(animateMarquee);
    }

    animateMarquee();

    // reconstruct the number of copies if the screen is resized
    window.addEventListener('resize', fillTrack);
  }

  // === CONTACT FORM (formspree) ===
  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    if (!contactForm || !formStatus) return console.warn('[contact form] form or status element not found');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      formStatus.textContent = '';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formStatus.textContent = 'Mensagem enviada! Retorno em breve.';
          contactForm.reset();
        } else {
          formStatus.textContent = 'Algo deu errado. Tenta de novo ou usa o e-mail direto.';
        }
      } catch (err) {
        formStatus.textContent = 'Sem conexão com o servidor de envio no momento.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensagem';
      }
    });
  }

  // === YEAR ON FOOTER ===
  function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (!yearEl) return;
    yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
