let allEvents = [];
let currentPage = 0;
let totalPages = 0;
let isAnimating = false;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('photos.json?t=' + Date.now());
    const data = await res.json();
    allEvents = data.events || [];

    renderStats(data);
    buildPages(allEvents);
    setupNavigation();
    setupKeyboard();
    setupSwipe();
    goToPage(0);
  } catch (err) {
    console.error('Error:', err);
  }
});

function renderStats(data) {
  const total = data.total_photos || 0;
  const events = data.events?.length || 0;
  const days = data.total_days || 0;
  document.getElementById('cover-stats').textContent =
    `${total} 張照片 · ${events} 個回憶 · 在一起 ${days} 天`;
  document.getElementById('back-date').textContent = `記錄到 ${data.generated_at?.split('T')[0] || ''}`;
}

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
      return `<div class="photo-cell" data-event-idx="${i}" data-photo-idx="${idx}" style="position:relative">
        <img src="${p.url}" alt="" loading="lazy">
        ${extra}
      </div>`;
    }).join('');

    page.innerHTML = `
      <div class="page-content">
        <div class="page-date">${formatDate(event.date)}</div>
        <div class="page-title">${event.title}</div>
        <div class="page-divider"></div>
        <div class="page-photos ${gridClass}">${photosHTML}</div>
        <div class="page-number">${i + 1}</div>
      </div>
    `;

    container.appendChild(page);
  });

  totalPages = events.length + 2; // cover + events + back cover
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[0]} 年 ${parseInt(parts[1])} 月 ${parseInt(parts[2])} 日`;
  }
  return dateStr;
}

function goToPage(page) {
  if (isAnimating) return;
  if (page < 0 || page >= totalPages) return;

  isAnimating = true;
  currentPage = page;

  const cover = document.getElementById('cover');
  const pages = document.querySelectorAll('#pages-container .page');
  const backCover = document.querySelector('.back-cover');

  // Reset all
  cover.classList.remove('flipped', 'active', 'behind');
  pages.forEach(p => p.classList.remove('flipped', 'active', 'behind', 'peeking'));
  backCover.classList.remove('flipped', 'active', 'behind');

  // Cover is page 0
  if (page === 0) {
    cover.classList.add('active');
    // Show next page peeking
    if (pages[0]) pages[0].classList.add('peeking');
  } else {
    cover.classList.add('flipped');

    // Event pages (page 1 to N)
    for (let i = 0; i < pages.length; i++) {
      const eventPage = i + 1; // page index in totalPages
      if (eventPage < page) {
        pages[i].classList.add('flipped');
      } else if (eventPage === page) {
        pages[i].classList.add('active');
        // Show next page peeking
        if (pages[i + 1]) pages[i + 1].classList.add('peeking');
      } else {
        pages[i].classList.add('behind');
      }
    }

    // Back cover
    if (page === totalPages - 1) {
      backCover.classList.add('active');
    }
  }

  // Update UI
  updateControls();

  setTimeout(() => { isAnimating = false; }, 600);
}

function updateControls() {
  const prev = document.getElementById('prev-btn');
  const next = document.getElementById('next-btn');
  const indicator = document.getElementById('page-indicator');
  const hint = document.getElementById('hint');

  prev.disabled = currentPage === 0;
  next.disabled = currentPage >= totalPages - 1;

  indicator.textContent = `${currentPage + 1} / ${totalPages}`;

  if (currentPage > 0 && hint) {
    hint.style.opacity = '0';
  }
}

function setupNavigation() {
  document.getElementById('prev-btn').addEventListener('click', () => {
    goToPage(currentPage - 1);
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    goToPage(currentPage + 1);
  });
}

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      goToPage(currentPage + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      goToPage(currentPage - 1);
    } else if (e.key === 'Escape') {
      closeLightbox();
    }
  });
}

function setupSwipe() {
  let startX = 0;
  let startY = 0;

  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) {
        goToPage(currentPage + 1);
      } else {
        goToPage(currentPage - 1);
      }
    }
  }, { passive: true });

  // Click on left/right half of book to flip
  document.querySelector('.book-scene').addEventListener('click', (e) => {
    if (e.target.closest('.nav-btn') || e.target.closest('.lightbox') || e.target.closest('.page-photos img')) return;
    const rect = document.querySelector('.book').getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) {
      goToPage(currentPage + 1);
    } else {
      goToPage(currentPage - 1);
    }
  });
}

/* ===== Lightbox ===== */
function openLightbox(eventIdx, photoIdx) {
  const event = allEvents[eventIdx];
  if (!event) return;

  const lightbox = document.getElementById('lightbox') || createLightbox();
  const img = lightbox.querySelector('img');

  img.src = event.photos[photoIdx].url;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function createLightbox() {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.id = 'lightbox';
  lb.innerHTML = `
    <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
    <img src="" alt="">
  `;
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });
  document.body.appendChild(lb);
  return lb;
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Delegate click on photos
document.addEventListener('click', (e) => {
  const cell = e.target.closest('.photo-cell');
  if (cell) {
    const eventIdx = parseInt(cell.dataset.eventIdx);
    const photoIdx = parseInt(cell.dataset.photoIdx);
    openLightbox(eventIdx, photoIdx);
  }
});
