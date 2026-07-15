let allEvents = [];
let currentPage = 0;
let totalPages = 0;
let isAnimating = false;
let dayNumbers = {};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('photos.json?t=' + Date.now());
    const data = await res.json();
    allEvents = data.events || [];

    computeDayNumbers();
    renderStats(data);
    buildPages(allEvents);
    buildTOC(allEvents);
    setupParticles();
    launchConfetti();
    setupNavigation();
    setupKeyboard();
    setupSwipe();
    goToPage(0);
  } catch (err) {
    console.error('Error:', err);
  }
});

/* ===== Day Numbers ===== */
function computeDayNumbers() {
  const startDate = new Date('2024-11-14');
  allEvents.forEach(e => {
    if (e.date) {
      const d = new Date(e.date);
      dayNumbers[e.id] = Math.floor((d - startDate) / 86400000) + 1;
    }
  });
}

/* ===== Stats ===== */
function renderStats(data) {
  const total = data.total_photos || 0;
  const events = data.events?.length || 0;
  const days = data.total_days || 0;
  document.getElementById('cover-stats').textContent =
    `${total} 張照片 · ${events} 個回憶 · 在一起 ${days} 天`;
  document.getElementById('back-stats').textContent =
    `${total} 張照片 · ${events} 個回憶 · ${days} 天`;
}

/* ===== Build Pages ===== */
function buildPages(events) {
  const container = document.getElementById('pages-container');
  container.innerHTML = '';

  events.forEach((event, i) => {
    const page = document.createElement('div');
    page.className = 'page';
    page.dataset.index = i;

    const photos = event.photos || [];
    const gridClass = photos.length <= 1 ? 'photo-grid-1'
      : photos.length <= 2 ? 'photo-grid-2'
      : photos.length <= 3 ? 'photo-grid-3'
      : photos.length <= 4 ? 'photo-grid-4'
      : 'photo-grid-more';

    const displayPhotos = photos.slice(0, photos.length > 4 ? 4 : photos.length);
    const hasMore = photos.length > 4;

    const photosHTML = displayPhotos.map((p, idx) => {
      const extra = (idx === displayPhotos.length - 1 && hasMore)
        ? `<div class="photo-more-overlay">+${photos.length - 4}</div>` : '';
      return `<div class="photo-cell" data-event-idx="${i}" data-photo-idx="${idx}">
        <img src="${p.url}" alt="" loading="lazy">
        ${extra}
      </div>`;
    }).join('');

    const dayNum = dayNumbers[event.id];
    const dayBadge = dayNum ? `<span class="page-day-badge">Day ${dayNum}</span>` : '';

    page.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div class="page-date">${formatDate(event.date)}</div>
          ${dayBadge}
        </div>
        <div class="page-title">${event.title}</div>
        <div class="page-divider"><span>&#10047;</span></div>
        <div class="page-photos ${gridClass}">${photosHTML}</div>
        <div class="page-number">${i + 1}</div>
      </div>
    `;
    container.appendChild(page);
  });

  totalPages = events.length + 2;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[0]} 年 ${parseInt(parts[1])} 月 ${parseInt(parts[2])} 日`;
  return dateStr;
}

/* ===== Page Navigation ===== */
function goToPage(page) {
  if (isAnimating) return;
  if (page < 0 || page >= totalPages) return;

  isAnimating = true;
  currentPage = page;

  const cover = document.getElementById('cover');
  const pages = document.querySelectorAll('#pages-container .page');
  const backCover = document.querySelector('.back-cover');

  cover.classList.remove('flipped', 'active', 'behind', 'peeking');
  pages.forEach(p => p.classList.remove('flipped', 'active', 'behind', 'peeking'));
  backCover.classList.remove('flipped', 'active', 'behind');

  if (page === 0) {
    cover.classList.add('active');
    if (pages[0]) pages[0].classList.add('peeking');
  } else {
    cover.classList.add('flipped');
    for (let i = 0; i < pages.length; i++) {
      const ep = i + 1;
      if (ep < page) pages[i].classList.add('flipped');
      else if (ep === page) {
        pages[i].classList.add('active');
        if (pages[i + 1]) pages[i + 1].classList.add('peeking');
      } else pages[i].classList.add('behind');
    }
    if (page === totalPages - 1) backCover.classList.add('active');
  }

  updateControls();
  updateTOCActive();
  setTimeout(() => { isAnimating = false; }, 650);
}

function updateControls() {
  document.getElementById('prev-btn').disabled = currentPage === 0;
  document.getElementById('next-btn').disabled = currentPage >= totalPages - 1;
  document.getElementById('page-indicator').textContent = `${currentPage + 1} / ${totalPages}`;
  document.getElementById('progress-bar').style.width =
    `${(currentPage / (totalPages - 1)) * 100}%`;

  const hint = document.getElementById('hint');
  if (currentPage > 0 && hint) hint.style.opacity = '0';
}

/* ===== Table of Contents ===== */
function buildTOC(events) {
  const list = document.getElementById('toc-list');
  list.innerHTML = '';
  let currentYear = '';

  events.forEach((event, i) => {
    const year = event.date ? event.date.split('-')[0] : '';
    if (year && year !== currentYear) {
      currentYear = year;
      const yearEl = document.createElement('div');
      yearEl.className = 'toc-year';
      yearEl.textContent = year;
      list.appendChild(yearEl);
    }

    const item = document.createElement('div');
    item.className = 'toc-item';
    item.dataset.page = i + 1;

    const dayNum = dayNumbers[event.id];
    const dayLabel = dayNum ? `Day ${dayNum}` : '';

    item.innerHTML = `
      <div class="toc-dot"></div>
      <div class="toc-item-text">
        <div class="toc-item-date">${formatDate(event.date)} ${dayLabel}</div>
        <div class="toc-item-title">${event.title}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      goToPage(i + 1);
      closeTOC();
    });

    list.appendChild(item);
  });
}

function updateTOCActive() {
  document.querySelectorAll('.toc-item').forEach(item => {
    const p = parseInt(item.dataset.page);
    item.classList.toggle('active', p === currentPage);
  });
  // Scroll active into view
  const active = document.querySelector('.toc-item.active');
  if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function setupTOC() {
  document.getElementById('toc-toggle').addEventListener('click', openTOC);
  document.getElementById('toc-close').addEventListener('click', closeTOC);
  document.getElementById('toc-overlay').addEventListener('click', closeTOC);

  document.getElementById('toc-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.toc-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? '' : 'none';
    });
    // Show/hide year headers
    document.querySelectorAll('.toc-year').forEach(y => {
      let next = y.nextElementSibling;
      let hasVisible = false;
      while (next && !next.classList.contains('toc-year')) {
        if (next.style.display !== 'none') hasVisible = true;
        next = next.nextElementSibling;
      }
      y.style.display = hasVisible ? '' : 'none';
    });
  });
}

function openTOC() {
  document.getElementById('toc').classList.add('active');
  document.getElementById('toc-overlay').classList.add('active');
  updateTOCActive();
}

function closeTOC() {
  document.getElementById('toc').classList.remove('active');
  document.getElementById('toc-overlay').classList.remove('active');
}

/* ===== Particles ===== */
function setupParticles() {
  const container = document.getElementById('particles');
  const symbols = ['&#10047;', '&#10048;', '&#10049;', '&#10084;', '&#9830;', '&#8226;'];

  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (12 + Math.random() * 18) + 's';
    p.style.animationDelay = (Math.random() * 15) + 's';
    p.style.fontSize = (10 + Math.random() * 10) + 'px';
    container.appendChild(p);
  }
}

/* ===== Confetti ===== */
function launchConfetti() {
  const container = document.getElementById('confetti');
  if (!container) return;
  const colors = ['#c8856a', '#b8976a', '#e8a090', '#d4a574', '#f0c8a0', '#a07858'];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (4 + Math.random() * 6) + 'px';
    piece.style.height = (4 + Math.random() * 6) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animation = `confettiFall ${2 + Math.random() * 3}s ${Math.random() * 2}s ease-out forwards`;
    container.appendChild(piece);
  }
}

/* ===== Navigation ===== */
function setupNavigation() {
  document.getElementById('prev-btn').addEventListener('click', () => goToPage(currentPage - 1));
  document.getElementById('next-btn').addEventListener('click', () => goToPage(currentPage + 1));
  setupTOC();
}

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('lightbox').classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      return;
    }
    if (document.getElementById('toc').classList.contains('active')) {
      if (e.key === 'Escape') closeTOC();
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(currentPage + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPage(currentPage - 1);
  });
}

function setupSwipe() {
  let sx = 0;
  document.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) {
      dx < 0 ? goToPage(currentPage + 1) : goToPage(currentPage - 1);
    }
  }, { passive: true });

  document.querySelector('.book-scene').addEventListener('click', (e) => {
    if (e.target.closest('.nav-btn') || e.target.closest('.lightbox') || e.target.closest('.toc') || e.target.closest('.toc-toggle')) return;
    const rect = document.querySelector('.book').getBoundingClientRect();
    const x = e.clientX - rect.left;
    x > rect.width / 2 ? goToPage(currentPage + 1) : goToPage(currentPage - 1);
  });
}

/* ===== Lightbox ===== */
document.addEventListener('click', (e) => {
  const cell = e.target.closest('.photo-cell');
  if (cell) {
    const ei = parseInt(cell.dataset.eventIdx);
    const pi = parseInt(cell.dataset.photoIdx);
    openLightbox(ei, pi);
  }
});

function openLightbox(ei, pi) {
  const event = allEvents[ei];
  if (!event) return;
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = event.photos[pi].url;
  document.getElementById('lightbox-caption').textContent =
    `${event.title} — ${pi + 1} / ${event.photos.length}`;
  lb.classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

document.getElementById('lightbox').addEventListener('click', (e) => {
  if (e.target.id === 'lightbox' || e.target.id === 'lightbox-content') closeLightbox();
});

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
