let allEvents = [];
let sheets = [];
let current = 0;
let total = 0;
let flipping = false;
let dayNumbers = {};
const ANNIVERSARY = new Date('2024-11-14');

function daysTogether() {
  const today = new Date();
  const start = new Date(ANNIVERSARY.getTime());
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.floor((today - start) / 86400000) + 1;
}

let lbPhotos = [];
let lbIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('photos.json?t=' + Date.now());
    const data = await res.json();
    allEvents = data.events || [];

    computeDayNumbers();
    buildSheets(data);
    setupParticles();
    launchConfetti();
    setupNavigation();
    setupKeyboard();
    setupSwipe();
    setupLightbox();
    updateUI();
  } catch (err) {
    console.error('Error:', err);
  }
});

function computeDayNumbers() {
  const startDate = ANNIVERSARY;
  allEvents.forEach(e => {
    if (e.date) {
      const d = new Date(e.date);
      dayNumbers[e.id] = Math.floor((d - startDate) / 86400000) + 1;
    }
  });
}

/* ===== Cute characters (cutekiwi_0803 style) ===== */
function svgKiwiTan() {
  return `<svg class="kiwi-char" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 104" width="74" height="77" aria-label="奇異鳥">
    <ellipse cx="50" cy="60" rx="37" ry="35" fill="#BFAF9F"/>
    <ellipse cx="50" cy="76" rx="15" ry="10" fill="#D8CBB8" opacity="0.8"/>
    <path d="M36 90 v7 M36 90 l-5 4 M36 90 l5 4" stroke="#8A7F70" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M64 90 v7 M64 90 l-5 4 M64 90 l5 4" stroke="#8A7F70" stroke-width="3" stroke-linecap="round" fill="none"/>
    <ellipse cx="50" cy="29" rx="27" ry="20" fill="#59524C"/>
    <path d="M50 9 q-2 -9 7 -10 q-5 3 -2 10" fill="#59524C"/>
    <circle cx="41" cy="25" r="3.6" fill="#fff"/>
    <circle cx="42.1" cy="23.9" r="1.3" fill="#3A332E"/>
    <circle cx="59" cy="25" r="3.6" fill="#fff"/>
    <circle cx="60.1" cy="23.9" r="1.3" fill="#3A332E"/>
    <ellipse cx="34" cy="52" rx="5" ry="3.5" fill="#E8B3A6" opacity="0.7"/>
    <ellipse cx="66" cy="52" rx="5" ry="3.5" fill="#E8B3A6" opacity="0.7"/>
    <path d="M47 39 C43 46 44 54 50 58 C56 54 56 46 53 39 Z" fill="#D3A86B"/>
  </svg>`;
}

function svgKoala() {
  return `<svg class="koala-char" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 116" width="78" height="82" aria-label="無尾熊">
    <ellipse cx="26" cy="21" rx="17" ry="16" fill="#5A5148"/>
    <ellipse cx="26" cy="21" rx="9" ry="8" fill="#A99B88"/>
    <ellipse cx="84" cy="21" rx="17" ry="16" fill="#5A5148"/>
    <ellipse cx="84" cy="21" rx="9" ry="8" fill="#A99B88"/>
    <path d="M13 72 Q3 80 9 90 Q14 94 22 88 Q20 80 22 72 Z" fill="#BDB09F"/>
    <path d="M97 72 Q107 80 101 90 Q96 94 88 88 Q90 80 88 72 Z" fill="#BDB09F"/>
    <ellipse cx="55" cy="64" rx="42" ry="45" fill="#BDB09F"/>
    <ellipse cx="55" cy="92" rx="20" ry="13" fill="#D8CBB8"/>
    <ellipse cx="55" cy="53" rx="10" ry="8" fill="#4A4038"/>
    <circle cx="36" cy="45" r="4" fill="#3A332E"/>
    <circle cx="37.4" cy="43.6" r="1.4" fill="#fff"/>
    <circle cx="74" cy="45" r="4" fill="#3A332E"/>
    <circle cx="75.4" cy="43.6" r="1.4" fill="#fff"/>
    <ellipse cx="25" cy="61" rx="6" ry="4" fill="#E8B3A6" opacity="0.7"/>
    <ellipse cx="85" cy="61" rx="6" ry="4" fill="#E8B3A6" opacity="0.7"/>
    <path d="M50 61 Q55 65 60 61" stroke="#7A6A58" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <ellipse cx="39" cy="107" rx="10" ry="6" fill="#8A7F70"/>
    <ellipse cx="71" cy="107" rx="10" ry="6" fill="#8A7F70"/>
  </svg>`;
}

function svgPaleKiwi() {
  return `<svg class="pale-kiwi-char" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 110" width="72" height="82" aria-label="小奇異鳥">
    <ellipse cx="44" cy="60" rx="27" ry="31" fill="#F2F1EF" stroke="#C9C6C1" stroke-width="2.5"/>
    <path d="M30 88 v7 M30 88 l-5 4 M30 88 l5 4" stroke="#A99B88" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M52 88 v7 M52 88 l-5 4 M52 88 l5 4" stroke="#A99B88" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M34 28 q-1 -11 8 -13 q-6 3 -3 13" fill="#F2F1EF" stroke="#C9C6C1" stroke-width="2" stroke-linejoin="round"/>
    <path d="M62 42 C78 45 87 56 92 74 C85 73 75 66 67 53 C63 47 62 44 62 42 Z" fill="#D3A86B"/>
    <path d="M62 48 C70 55 78 61 84 68" stroke="#C89A62" stroke-width="1.2" fill="none"/>
    <circle cx="53" cy="44" r="3.6" fill="#4A4038"/>
    <circle cx="54.2" cy="42.8" r="1.3" fill="#fff"/>
    <ellipse cx="48" cy="56" rx="5" ry="3.5" fill="#E8B3A6" opacity="0.7"/>
  </svg>`;
}

/* ===== Sheet structure =====
 * Each event spans a full spread (left + right pages).
 *  sheet 0:       front = cover,        back = intro LEFT
 *  sheet 1:       front = intro RIGHT,  back = event 1 LEFT
 *  sheet j (2..N+1): front = event (j-1) RIGHT, back = event j LEFT
 *  sheet N+2:     front = back cover,   back = blank
 *  current = 0: cover; current = 1: intro spread;
 *  current = i+2 (0..N-1): left shows event i LEFT, right shows event i RIGHT
 */
function buildSheets(data) {
  const container = document.getElementById('sheets-container');
  container.innerHTML = '';
  sheets = [];

  const N = allEvents.length;
  const INNER = `<div class="sheet-back inner-cover"><span class="inner-text">&#10047; 未來還有好多寶寶日！ &#10047;</span></div>`;

  // Sheet 0: cover
  const coverSheet = document.createElement('div');
  coverSheet.className = 'sheet';
  coverSheet.innerHTML = `
    <div class="sheet-front cover-front">
      <div class="cover-deco-top">&#10047; &#10047; &#10047;</div>
      <div class="cover-frame">
        <h1 class="cover-title">奇異鳥和<br>無尾熊的<br>奇幻冒險</h1>
        <div class="cover-line"></div>
        <p class="cover-subtitle">
          <svg class="kiwi-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="30" height="30" aria-label="奇異鳥">
            <path d="M26 54 l-4 3 M26 54 l0 5 M26 54 l4 3" stroke="#C98D4B" stroke-width="2.6" stroke-linecap="round" fill="none"/>
            <path d="M37 55 l-4 3 M37 55 l0 5 M37 55 l4 3" stroke="#C98D4B" stroke-width="2.6" stroke-linecap="round" fill="none"/>
            <path d="M44 19 C55 24 57 35 54 43 C51 52 42 58 33 58 C24 58 18 50 17 39 C16 28 25 18 44 19 Z" fill="#8A6A44"/>
            <circle cx="37" cy="28" r="1.2" fill="#6E5233"/>
            <circle cx="44" cy="38" r="1.2" fill="#6E5233"/>
            <circle cx="30" cy="40" r="1.2" fill="#6E5233"/>
            <circle cx="48" cy="47" r="1.2" fill="#6E5233"/>
            <circle cx="37" cy="50" r="1.2" fill="#6E5233"/>
            <path d="M25 26 C16 28 8 34 4 45 C9 47 16 44 23 36 C25 33 25 29 25 26 Z" fill="#E8C58A"/>
            <circle cx="35" cy="27" r="2.2" fill="#2B2118"/>
            <circle cx="35.9" cy="26.2" r="0.8" fill="#fff"/>
          </svg>
          <span class="cover-sub-koala">🐨 回憶錄</span>
        </p>
        <div class="cover-chars">${svgKiwiTan()}${svgKoala()}</div>
        <div class="cover-stats" id="cover-stats"></div>
      </div>
      <div class="cover-deco-bottom"><span>&#10084;</span></div>
      <div class="confetti-container" id="confetti"></div>
    </div>
    ${buildIntroLeft()}
  `;
  container.appendChild(coverSheet);
  sheets.push(coverSheet);

  // Sheets 1..N+1: intro-right + events
  for (let j = 1; j <= N + 1; j++) {
    const sheet = document.createElement('div');
    sheet.className = 'sheet';

    const front = j === 1
      ? buildIntroRight()
      : buildRight(allEvents[j - 2], j - 2);

    const back = j === N + 1
      ? buildLastLeft()
      : buildLeft(allEvents[j - 1], j - 1);

    sheet.innerHTML = `
      <div class="sheet-front event-page">${front}</div>
      ${back}
    `;
    container.appendChild(sheet);
    sheets.push(sheet);
  }

  // Back cover sheet
  const backSheet = document.createElement('div');
  backSheet.className = 'sheet';
  backSheet.innerHTML = `
    <div class="sheet-front back-cover-front">
      <div class="back-chars">${svgPaleKiwi()}</div>
      <div class="back-deco">&#10047;</div>
      <p class="back-text">未完待續....</p>
      <p class="back-sub">還要和寶寶創造更多更多的回憶</p>
      <div class="back-stats" id="back-stats"></div>
      <div class="back-hearts"><span>&#10084;</span><span>&#10084;</span><span>&#10084;</span></div>
    </div>
    ${INNER}
  `;
  container.appendChild(backSheet);
  sheets.push(backSheet);

  total = sheets.length;

  const stats = `${data.total_photos || 0} 張照片 · ${allEvents.length} 個回憶 · ${daysTogether()} 天`;
  document.getElementById('cover-stats').textContent = stats;
  document.getElementById('back-stats').textContent = stats;

  buildTOC(allEvents);

  sheets.forEach((s, i) => { s.style.zIndex = 10; });
  sheets[0].style.zIndex = 30;
}

function buildLastLeft() {
  const now = new Date();
  return `
    <div class="sheet-back last-left">
      <div class="last-deco">&#10084;</div>
      <div class="last-chars">${svgKiwiTan()}${svgKoala()}</div>
      <p class="last-label">今天</p>
      <p class="last-date">${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日</p>
      <div class="last-divider"></div>
      <p class="last-label">是我們交往的第</p>
      <p class="last-days">${daysTogether()} 天</p>
      <p class="last-sub">膜膜也想要有更多回憶！</p>
    </div>
  `;
}

function buildIntroLeft() {
  return `
    <div class="sheet-back intro-left">
      <div class="intro-left-deco">&#10047;</div>
      <h2 class="intro-title">回憶錄使用說明</h2>
      <div class="intro-line"></div>
      <p class="intro-sub">膜膜來教學了！</p>
    </div>
  `;
}

function buildIntroRight() {
  return `
    <div class="intro-right">
      <h2 class="intro-title">我們來把下面四顆奇異果一一看過去吧！</h2>
      <div class="intro-sections">
        <div class="intro-section">
          <div class="intro-num">1</div>
          <div class="intro-body">
            <h3>翻頁</h3>
            <p>可以點擊書本左右側，或是按下鍵盤的⭠ ⭢ ，就可以翻閱此書。</p>
          </div>
        </div>
        <div class="intro-section">
          <div class="intro-num">2</div>
          <div class="intro-body">
            <h3>目錄跳轉</h3>
            <p>點右上角的 ☰「目錄」，可以快速跳到任何一段回憶，也可以用關鍵字搜尋。</p>
          </div>
        </div>
        <div class="intro-section">
          <div class="intro-num">3</div>
          <div class="intro-body">
            <h3>放大照片</h3>
            <p>點一下照片會放大顯示，再用 ← → 鍵或畫面上的箭頭，瀏覽同一天的其他照片。</p>
          </div>
        </div>
        <div class="intro-section">
          <div class="intro-num">4</div>
          <div class="intro-body">
            <h3>貼心小統計</h3>
            <p>封面和封底都有紀錄我們蒐集的照片總數、還有我們交往的天數！</p>
          </div>
        </div>
      </div>
      <div class="intro-foot">膜膜太期待了！趕快翻閱回憶錄吧！</div>
    </div>
  `;
}

function buildLeft(event, i) {
  const dayBadge = dayNumbers[event.id] ? `<span class="event-day-badge">Day ${dayNumbers[event.id]}</span>` : '';
  const photos = event.photos || [];

  return `
    <div class="sheet-back event-left">
      <div class="event-left-deco">&#10047;</div>
      <div class="event-date">${formatDate(event.date)}</div>
      ${dayBadge}
      <div class="event-left-count">共 ${photos.length} 張照片</div>
    </div>
  `;
}

function buildRight(event, i) {
  const photos = event.photos || [];
  const gridClass = photos.length <= 1 ? 'photo-grid-1'
    : photos.length <= 2 ? 'photo-grid-2'
    : photos.length <= 3 ? 'photo-grid-3'
    : photos.length <= 4 ? 'photo-grid-4'
    : 'photo-grid-more';

  const photosHTML = photos.map((p, idx) => {
    return `<div class="photo-cell" data-event-idx="${i}" data-photo-idx="${idx}">
      <div class="photo-ph"></div>
    </div>`;
  }).join('');

  const dayBadge = dayNumbers[event.id] ? `<span class="event-day-badge">Day ${dayNumbers[event.id]}</span>` : '';

  return `
    <div class="event-header">
      <div class="event-date">${formatDate(event.date)}</div>
      ${dayBadge}
    </div>
    <div class="event-title">${getTitle(event)}</div>
    <div class="event-divider"><span>&#10047;</span></div>
    <div class="event-photos ${gridClass}">${photosHTML}</div>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[0]} 年 ${parseInt(parts[1])} 月 ${parseInt(parts[2])} 日`;
  return dateStr;
}

function getTitle(event) {
  let t = (event.title || '').trim();
  if (!t || /^\d{4}-\d{2}-\d{2}$/.test(t)) return '【無題】';
  const m = t.match(/^\d{6,8}[-_](.+)$/);
  if (m && m[1]) t = m[1].trim();
  if (!t) return '【無題】';
  return t;
}

/* ===== Photo virtualization =====
 * 只載入目前書頁附近的照片，其餘用佔位，減少卡頓
 */
function syncImages() {
  document.querySelectorAll('.sheet').forEach((sheet, idx) => {
    const near = Math.abs(idx - current) <= 1;
    const cells = sheet.querySelectorAll('.photo-cell');
    cells.forEach(cell => {
      if (near) {
        if (!cell.querySelector('img')) {
          const ev = allEvents[cell.dataset.eventIdx];
          const ph = ev && ev.photos[cell.dataset.photoIdx];
          if (ph) cell.innerHTML = `<img src="${ph.url}" alt="" loading="lazy" decoding="async">`;
        }
      } else {
        const img = cell.querySelector('img');
        if (img) cell.innerHTML = '';
      }
    });
  });
}

/* ===== Flip Navigation ===== */
function flipForward() {
  if (flipping || current >= total - 1) return;
  flipping = true;

  const sheet = sheets[current];
  sheet.style.zIndex = 40;
  sheet.classList.add('flipped');

  sheets[current + 1].style.zIndex = 30;

  sheet.addEventListener('transitionend', function handler(e) {
    if (e.propertyName !== 'transform') return;
    sheet.removeEventListener('transitionend', handler);
    sheet.style.zIndex = 20;
    flipping = false;
  });

  current++;
  updateUI();
}

function flipBack() {
  if (flipping || current <= 0) return;
  flipping = true;

  const prev = current - 1;
  const sheet = sheets[prev];
  sheet.style.zIndex = 40;
  sheet.classList.remove('flipped');

  sheets[current].style.zIndex = 20;

  sheet.addEventListener('transitionend', function handler(e) {
    if (e.propertyName !== 'transform') return;
    sheet.removeEventListener('transitionend', handler);
    sheet.style.zIndex = 30;
    flipping = false;
  });

  current = prev;
  updateUI();
}

function jumpTo(target) {
  if (target < 0 || target >= total) return;
  if (flipping) return;

  sheets.forEach(s => s.style.transition = 'none');
  for (let i = 0; i < total; i++) {
    if (i < target) sheets[i].classList.add('flipped');
    else sheets[i].classList.remove('flipped');
  }
  current = target;

  sheets.forEach((s, i) => {
    if (i === target) s.style.zIndex = 30;
    else if (i === target - 1) s.style.zIndex = 20;
    else s.style.zIndex = 10;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sheets.forEach(s => s.style.transition = '');
    });
  });

  updateUI();
}

function updateUI() {
  document.getElementById('prev-btn').disabled = current === 0;
  document.getElementById('next-btn').disabled = current >= total - 1;
  document.getElementById('page-indicator').textContent = `${current + 1} / ${total}`;
  document.getElementById('progress-bar').style.width =
    `${(current / (total - 1)) * 100}%`;

  const hint = document.getElementById('hint');
  if (current > 0 && hint) hint.style.opacity = '0';

  syncImages();
  updateTOCActive();
}

/* ===== TOC ===== */
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
    item.dataset.sheet = i + 2;

    const dayNum = dayNumbers[event.id];
    const dayLabel = dayNum ? `Day ${dayNum}` : '';
    const photoCount = event.photos ? event.photos.length : 0;
    const photoLabel = photoCount > 1 ? ` · ${photoCount} 張` : '';

    item.innerHTML = `
      <div class="toc-dot"></div>
      <div class="toc-item-text">
        <div class="toc-item-date">${formatDate(event.date)} ${dayLabel}</div>
        <div class="toc-item-title">${getTitle(event)}${photoLabel}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      jumpTo(i + 2);
      closeTOC();
    });

    list.appendChild(item);
  });
}

function updateTOCActive() {
  document.querySelectorAll('.toc-item').forEach(item => {
    const s = parseInt(item.dataset.sheet);
    item.classList.toggle('active', s === current);
  });
  const active = document.querySelector('.toc-item.active');
  if (active && document.getElementById('toc').classList.contains('active')) {
    active.scrollIntoView({ block: 'nearest' });
  }
}

function setupTOC() {
  document.getElementById('toc-toggle').addEventListener('click', openTOC);
  document.getElementById('toc-close').addEventListener('click', closeTOC);
  document.getElementById('toc-overlay').addEventListener('click', closeTOC);

  document.getElementById('toc-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.toc-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
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

/* ===== Particles & Confetti ===== */
function setupParticles() {
  const container = document.getElementById('particles');
  const symbols = ['&#10047;', '&#10048;', '&#10084;', '&#9830;', '&#8226;'];
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

/* ===== Navigation setup ===== */
function setupNavigation() {
  document.getElementById('prev-btn').addEventListener('click', flipBack);
  document.getElementById('next-btn').addEventListener('click', flipForward);
  setupTOC();
}

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('lightbox').classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') lbNext();
      else if (e.key === 'ArrowLeft') lbPrev();
      return;
    }
    if (document.getElementById('toc').classList.contains('active')) {
      if (e.key === 'Escape') closeTOC();
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') flipForward();
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') flipBack();
  });
}

function setupSwipe() {
  let sx = 0;
  document.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) {
      dx < 0 ? flipForward() : flipBack();
    }
  }, { passive: true });

  document.querySelector('.book-scene').addEventListener('click', (e) => {
    if (e.target.closest('.nav-btn') || e.target.closest('.lightbox') ||
        e.target.closest('.toc') || e.target.closest('.toc-toggle') || e.target.closest('.photo-cell')) return;
    const rect = document.querySelector('.book').getBoundingClientRect();
    const x = e.clientX - rect.left;
    x > rect.width / 2 ? flipForward() : flipBack();
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
  lbPhotos = event.photos.map((p, i) => ({
    url: p.url,
    label: `${getTitle(event)} — ${i + 1} / ${event.photos.length}`
  }));
  lbIndex = Math.min(pi, lbPhotos.length - 1);
  showLightbox();
}

function showLightbox() {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = lbPhotos[lbIndex].url;
  document.getElementById('lightbox-caption').textContent = lbPhotos[lbIndex].label;

  const hasNav = lbPhotos.length > 1;
  document.getElementById('lb-prev').style.display = hasNav ? 'flex' : 'none';
  document.getElementById('lb-next').style.display = hasNav ? 'flex' : 'none';

  lb.classList.add('active');
}

function lbPrev() {
  if (lbPhotos.length <= 1) return;
  lbIndex = (lbIndex - 1 + lbPhotos.length) % lbPhotos.length;
  showLightbox();
}
function lbNext() {
  if (lbPhotos.length <= 1) return;
  lbIndex = (lbIndex + 1) % lbPhotos.length;
  showLightbox();
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

function setupLightbox() {
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox' || e.target.id === 'lightbox-content') closeLightbox();
  });
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', (e) => { e.stopPropagation(); lbPrev(); });
  document.getElementById('lb-next').addEventListener('click', (e) => { e.stopPropagation(); lbNext(); });
}
