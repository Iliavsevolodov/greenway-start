const resetBtn = document.getElementById('resetBtn');
const toast = document.getElementById('toast');
const loader = document.getElementById('loader');
const loaderPercent = document.getElementById('loaderPercent');
const confettiLayer = document.getElementById('confettiLayer');
const chatJoinedBtn = document.getElementById('chatJoinedBtn');
const progressBar = document.getElementById('progressBar');
const screens = Array.from(document.querySelectorAll('.flow-screen'));
const goButtons = Array.from(document.querySelectorAll('[data-go]'));
const copyButtons = Array.from(document.querySelectorAll('[data-copy-target]'));
const videoButtons = Array.from(document.querySelectorAll('[data-video-play]'));

const order = ['welcome', 'step1', 'step2', 'step3', 'step4', 'step5'];
const STORAGE_SCREEN_KEY = 'greenwayStartCurrentScreen';
const STORAGE_CHAT_KEY = 'greenwayStartChatJoined';

function saveScreen(name) {
  try {
    localStorage.setItem(STORAGE_SCREEN_KEY, name);
  } catch (error) {}
}

function saveChatJoined(value) {
  try {
    localStorage.setItem(STORAGE_CHAT_KEY, value ? '1' : '0');
  } catch (error) {}
}

function getSavedScreen() {
  try {
    return localStorage.getItem(STORAGE_SCREEN_KEY) || 'welcome';
  } catch (error) {
    return 'welcome';
  }
}

function getSavedChatJoined() {
  try {
    return localStorage.getItem(STORAGE_CHAT_KEY) === '1';
  } catch (error) {
    return false;
  }
}

function updateProgress(name) {
  if (!progressBar) return;
  const idx = order.indexOf(name);
  const percent = idx < 0 ? 0 : (idx / (order.length - 1)) * 100;
  progressBar.style.width = percent + '%';
}

function showToast(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1600);
}

function softHaptic(duration = 12) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(duration);
  } catch (error) {}
}

function applyScreen(name, shouldSave = true) {
  const next = document.querySelector(`[data-screen="${name}"]`);
  const safeName = next ? name : 'welcome';
  const safeNext = document.querySelector(`[data-screen="${safeName}"]`);

  screens.forEach(screen => screen.classList.remove('active'));
  if (safeNext) safeNext.classList.add('active');
  if (shouldSave) saveScreen(safeName);

  updateProgress(safeName);
  requestAnimationFrame(() => refreshRevealItems(safeNext));
}

function showScreen(name) {
  const current = document.querySelector('.flow-screen.active');
  const next = document.querySelector(`[data-screen="${name}"]`);
  if (!next || next === current) return;

  document.body.classList.add('screen-leave');
  softHaptic(10);

  setTimeout(() => {
    applyScreen(name, true);
    document.body.classList.remove('screen-leave');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 260);
}

function restoreProgress() {
  const savedScreen = getSavedScreen();
  const chatJoined = getSavedChatJoined();

  applyScreen(savedScreen, false);

  if (chatJoined && chatJoinedBtn) {
    chatJoinedBtn.classList.add('checked');
  }
}

function runLoader() {
  document.body.classList.add('loaded');

  if (!loader || !loaderPercent) return;

  loaderPercent.textContent = '100%';
  setTimeout(() => {
    loader.classList.add('hide');
  }, 180);
}

function fireConfetti() {
  if (!confettiLayer) return;

  const colors = ['#f6c400', '#17130c', '#2f7d4a', '#ffffff', '#202247'];
  const count = 64;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--x', (Math.random() * 180 - 90) + 'px');
    piece.style.animationDelay = Math.random() * 0.25 + 's';
    piece.style.animationDuration = 0.9 + Math.random() * 0.65 + 's';
    confettiLayer.appendChild(piece);

    setTimeout(() => piece.remove(), 1900);
  }
}

function legacyCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.width = '1px';
  textarea.style.height = '1px';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  textarea.style.fontSize = '16px';
  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    textarea.remove();
  }

  if (!copied) {
    throw new Error('copy_failed');
  }
}

async function copyTextFromElement(targetId, button) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const text = target.textContent.trim();
  const originalText = button.textContent;
  let copied = false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch (error) {
    copied = false;
  }

  if (!copied) {
    try {
      legacyCopy(text);
      copied = true;
    } catch (error) {
      copied = false;
    }
  }

  if (copied) {
    const card = button.closest('.copy-card');
    if (card) card.classList.add('copied');
    button.textContent = '✅ Скопировано';
    showToast('Сообщение скопировано');
    softHaptic(18);

    setTimeout(() => {
      button.textContent = originalText;
      if (card) card.classList.remove('copied');
    }, 1800);
  } else {
    showToast('Зажми текст и скопируй вручную');
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });

    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function startVideo(button) {
  const card = button.closest('[data-video-card]');
  if (!card) return;

  const iframe = card.querySelector('iframe');
  if (!iframe) return;

  const src = iframe.dataset.src;
  if (src && !iframe.src) {
    iframe.src = src;
  }

  card.classList.add('is-playing');
  showToast('Запускаю видео');
  softHaptic(18);
}

function setupRevealItems() {
  const items = document.querySelectorAll('.step-content > *, .hero-content > *');
  items.forEach((item, index) => {
    item.classList.add('reveal-item');
    item.style.transitionDelay = Math.min(index * 42, 260) + 'ms';
  });

  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  items.forEach(item => observer.observe(item));
}

function refreshRevealItems(scope) {
  if (!scope) return;
  const items = scope.querySelectorAll('.reveal-item');
  items.forEach((item, index) => {
    item.classList.remove('is-visible');
    item.style.transitionDelay = Math.min(index * 42, 260) + 'ms';
    setTimeout(() => item.classList.add('is-visible'), 60 + index * 32);
  });
}

function setupSpotlight() {
  const cards = document.querySelectorAll('.welcome-card, .step-card');
  cards.forEach(card => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--spot-x', x + '%');
      card.style.setProperty('--spot-y', y + '%');
    });
  });
}

function setupTapFeeling() {
  const activeTargets = document.querySelectorAll('button, a, .app-shot, .product-line, .metric-card, .social-card, .app-feature, .benefit-item');
  activeTargets.forEach(target => {
    target.addEventListener('pointerdown', () => {
      document.body.classList.add('is-tapping');
    });
    target.addEventListener('pointerup', () => {
      setTimeout(() => document.body.classList.remove('is-tapping'), 120);
    });
    target.addEventListener('pointercancel', () => document.body.classList.remove('is-tapping'));
  });
}

setupRevealItems();
setupSpotlight();
setupTapFeeling();
restoreProgress();

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (chatJoinedBtn) chatJoinedBtn.classList.remove('checked');
    saveChatJoined(false);
    showScreen('welcome');
    showToast('Начинаем заново');
    softHaptic(14);
  });
}

goButtons.forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.go;
    showScreen(target);
  });
});

copyButtons.forEach(button => {
  button.addEventListener('click', () => {
    copyTextFromElement(button.dataset.copyTarget, button);
  });
});

videoButtons.forEach(button => {
  button.addEventListener('click', () => {
    startVideo(button);
  });
});

if (chatJoinedBtn) {
  chatJoinedBtn.addEventListener('click', () => {
    if (chatJoinedBtn.classList.contains('checked')) {
      showScreen('step2');
      return;
    }

    chatJoinedBtn.classList.add('checked');
    saveChatJoined(true);
    fireConfetti();
    showToast('Отлично! Шаг выполнен');
    softHaptic(24);

    setTimeout(() => {
      showScreen('step2');
    }, 900);
  });
}

runLoader();