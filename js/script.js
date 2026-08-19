const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 40);
});

// ===================== MENU MOBILE =====================
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

// ===CAROUSEL PROJECTS===
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

// ===PROJECT MODALS===
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