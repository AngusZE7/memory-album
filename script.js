let allPhotos = [];
let currentPhotoIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('photos.json');
    const data = await res.json();
    allPhotos = data.events || [];
    renderStats(data);
    renderTimeline(allPhotos);
    initLightbox();
    initScrollAnimation();
  } catch (err) {
    document.getElementById('timeline').innerHTML =
      '<p style="text-align:center;color:#999;padding:40px;">尚無照片資料，請先執行 generate_manifest.py</p>';
  }
});

function renderStats(data) {
  const total = data.total_photos || 0;
  const events = data.events?.length || 0;
  const days = data.total_days || 0;
  document.getElementById('stats').innerHTML =
    `${total} 張照片 · ${events} 個回憶 · 在一起 ${days} 天`;
}

function renderTimeline(events) {
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '';

  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'event-card';

    const dateStr = formatDate(event.date);
    const photos = event.photos || [];
    const isSingle = photos.length === 1;

    let photosHTML = '';
    if (isSingle) {
      photosHTML = `
        <div class="event-photos single">
          <div class="photo-wrapper" data-index="0" data-event-id="${event.id}">
            <img src="${photos[0].url}" alt="${event.title}" loading="lazy">
          </div>
        </div>`;
    } else {
      const firstPhoto = photos[0];
      photosHTML = `
        <div class="event-photos">
          <div class="photo-wrapper" data-index="0" data-event-id="${event.id}">
            <img src="${firstPhoto.url}" alt="${event.title}" loading="lazy">
            ${photos.length > 1 ? `<span class="photo-count">${photos.length} 張</span>` : ''}
          </div>
        </div>`;
    }

    card.innerHTML = `
      <div class="event-date">${dateStr}</div>
      <div class="event-title">${event.title}</div>
      ${photosHTML}
    `;

    card.querySelector('.photo-wrapper').addEventListener('click', () => {
      openLightbox(event.id, 0);
    });

    timeline.appendChild(card);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[0]} 年 ${parseInt(parts[1])} 月 ${parseInt(parts[2])} 日`;
  }
  if (parts.length === 2) {
    return `${parts[0]} 年 ${parseInt(parts[1])} 月`;
  }
  return dateStr;
}

function openLightbox(eventId, startIndex) {
  const event = allPhotos.find(e => e.id === eventId);
  if (!event) return;

  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');

  currentPhotoIndex = startIndex;
  img.src = event.photos[currentPhotoIndex].url;
  caption.textContent = `${event.title} (${currentPhotoIndex + 1}/${event.photos.length})`;

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  lightbox.onclick = (e) => {
    if (e.target === lightbox || e.target.id === 'lightbox-content') {
      closeLightbox();
    }
  };
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

function initLightbox() {
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('lightbox').classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
  });
}

function initScrollAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.event-card').forEach(card => {
    observer.observe(card);
  });
}
