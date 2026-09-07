
// === NAV ===
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 40);
});

// === MOBILE MENU ===
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

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

// === HERO TERMINAL ===
const typewriterMessages = [
  'aguardando aventuras...',
  'ou bugs em produção',
  'às 2h da manhã...'
];

const typewriterEl = document.getElementById('typewriterText');
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
    delay = 1800; // pause at the end of the sentence, before deleting
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    messageIndex = (messageIndex + 1) % typewriterMessages.length;
    delay = isLastMessage ? 15000 : 400; // pause before starting the next one
  }

  setTimeout(typeLoop, delay);
}

typeLoop();

// === SCROLL REVEAL ===
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// === PROJECTS CAROUSEL ===
const track = document.getElementById('projectsTrack');
const prevBtn = document.getElementById('prevProject');
const nextBtn = document.getElementById('nextProject');

function scrollByCard(direction) {
  const card = track.querySelector('.project-card');
  if (!card) return;
  const cardWidth = card.getBoundingClientRect().width + 24; // 24px = gap
  track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
}

prevBtn.addEventListener('click', () => scrollByCard(-1));
nextBtn.addEventListener('click', () => scrollByCard(1));

function updateCarouselButtons() {
  const maxScroll = track.scrollWidth - track.clientWidth - 2;
  prevBtn.disabled = track.scrollLeft <= 0;
  nextBtn.disabled = track.scrollLeft >= maxScroll;
}
track.addEventListener('scroll', updateCarouselButtons, { passive: true });
window.addEventListener('load', updateCarouselButtons);
window.addEventListener('resize', updateCarouselButtons);

// === ANIMATED COUNTER (STATS) ===
const statNumbers = document.querySelectorAll('.stat__number');

function animatedCount(el){
  const target = el.getAttribute('data-count');
  const isNumeric = /^\d+$/.test(target);
  if(!isNumeric){
    el.textContent = target;
    return;
  }

  const targetNum = parseInt(target, 10);
  const duration = 1200;
  const startTime = performance.now();

  function step(now){
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * targetNum);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = targetNum;
  }
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) =>{
  entries.forEach(entry =>{
    if(entry.isIntersecting){
      animatedCount(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5});
statNumbers.forEach(el => statsObserver.observe(el));

// === PROJECT MODALS ===
const projectData = {
  'gyro': {
    title: 'Gyro Serviços',
    tags: ['Flask', 'PostgreSQL', 'Docker', 'JS vanilla'],
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sistema de
      gestão de manutenção de frota construído para um cliente real, substituindo
      controle manual em planilhas. Sed do eiusmod tempor incididunt ut labore.`,
    images: [] // adicionar caminhos de imagens reais aqui quando tiver
  },
  'csvWriter': {
    title: 'csvWriter — Conversor de arquivos',
    tags: ['Java'],
    description: `Lorem ipsum dolor sit amet, reconstrução do zero em Java com Spring
      Boot, corrigindo limitações conhecidas da versão original: PINs em texto
      plano, consultas N+1 e ausência de rate limiting.`,
    images: []
  }
};

const modal = document.getElementById('projectModal');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModal');

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
modal.addEventListener('click', (e) =>{
  const rect = modalContent.getBoundingClientRect();
  const clickedOutside = 
    e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
  if(clickedOutside) modal.close();
});

// === TECH MARQUEE (infinite, hover to slow) ===
const marquee = document.getElementById('techMarquee');
const marqueeTrack = document.getElementById('techMarqueeTrack');

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

// === CONTACT FORM (formspree) ===
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', async (e) =>{
  e.preventDefault();
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";
  formStatus.textContent = '';

  try{
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: {'Accept': 'application/json'}
    });

    if (response.ok){
      formStatus.textContent = 'Mensagem enviada! Retorno em breve.';
      contactForm.reset();
    } else{
      formStatus.textContent = 'Algo deu errado. Tenta de novo ou usa o e-mail direto.';
    }
  } catch (err){
    formStatus.textContent = 'Sem conexão com o servidor de envio no momento.'
  } finally{
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar mensagem';
  }
});

// === YEAR ON FOOTER ===
document.getElementById('year').textContent = new Date().getFullYear();