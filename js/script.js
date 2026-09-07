'use strict';

/*
 * Every feature lives in its own init function with a guard clause at the
 * top: if a required element is missing, it warns and returns instead of
 * throwing. One absent node can no longer abort the whole script (which
 * used to leave the scroll-reveal content permanently hidden).
 */
(function () {

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
      nav.classList.toggle('nav--scrolled', window.scrollY > 40);
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

      let delay = isDeleting ? 60 : 100;

      if (!isDeleting && charIndex === currentMessage.length) {
        // fully typed: hold longer on the last message, with it still on screen
        delay = isLastMessage ? 15000 : 1800;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        messageIndex = (messageIndex + 1) % typewriterMessages.length;
        delay = 400; // short gap before the next message starts
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
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

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
      const cardWidth = card.getBoundingClientRect().width + 24; // 24px = gap
      track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
    }

    function updateCarouselButtons() {
      const maxScroll = track.scrollWidth - track.clientWidth - 2;
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
      const duration = 1200;
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
    }, { threshold: 0.5 });

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

      // repeatedly doubles until the track is at 2.5x wider than the visible screen
      while (marqueeTrack.scrollWidth < marquee.clientWidth * 2.5) {
        marqueeTrack.innerHTML += originalTrackHTML;
      }
    }

    fillTrack();

    let position = 0;
    const normalSpeed = 0.4;
    const slowSpeed = 0.08;
    let currentSpeed = normalSpeed;
    let targetSpeed = normalSpeed;

    marquee.addEventListener('mouseenter', () => { targetSpeed = slowSpeed; });
    marquee.addEventListener('mouseleave', () => { targetSpeed = normalSpeed; });

    function animateMarquee() {
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;
      position -= currentSpeed;

      // It resets after traveling the width of ONE original set (not the entire track).
      const singleSetWidth = marqueeTrack.scrollWidth / (marqueeTrack.children.length / 8); // 8 = number of original icons
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
