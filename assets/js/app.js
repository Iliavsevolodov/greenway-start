try {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
} catch (error) {}

(function loadRatingStyles() {
  const href = 'assets/css/rating-step.css?v=30';
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
})();

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

const order = ['welcome', 'step1', 'step2', 'step3', 'step4', 'step5', 'step6'];
const STORAGE_SCREEN_KEY = 'greenwayStartCurrentScreen';
const STORAGE_CHAT_KEY = 'greenwayStartChatJoined';
const STORAGE_RATING_KEY = 'greenwayStartStageRating';

function ensureRatingStep() {
  if (document.querySelector('[data-screen="step6"]')) return;

  const app = document.querySelector('.app');
  if (!app) return;

  const section = document.createElement('section');
  section.className = 'step-card flow-screen';
  section.dataset.screen = 'step6';
  section.innerHTML = `
    <div class="shine"></div>
    <div class="watermark">DONE</div>
    <div class="step-content">
      <div class="step-label">🎉 первый этап завершён</div>
      <h2 class="step-title">Первый этап пройден</h2>
      <div class="rating-summary">
        <b>Ты зарегистрирован, познакомился с компанией и нашей командой, и уже начал погружаться в суть бизнеса.</b>
        <p>Теперь пора перейти к действиям, с которых начинается рост в сетевом бизнесе.</p>
      </div>
      <div class="rating-box">
        <div class="rating-question">Оцени, как тебе информация. 5 звёзд - максимально понятно и интересно.</div>
        <div class="star-rating" role="radiogroup" aria-label="Оценка информации">
          <button class="rating-star" type="button" data-rating="1" aria-label="1 звезда"></button>
          <button class="rating-star" type="button" data-rating="2" aria-label="2 звезды"></button>
          <button class="rating-star" type="button" data-rating="3" aria-label="3 звезды"></button>
          <button class="rating-star" type="button" data-rating="4" aria-label="4 звезды"></button>
          <button class="rating-star" type="button" data-rating="5" aria-label="5 звёзд"></button>
        </div>
        <div class="rating-result" id="ratingResult">Нажми на звёздочки, чтобы поставить оценку</div>
        <div class="rating-sparks" id="ratingSparks"></div>
        <button class="next-step-btn rating-next" type="button" id="ratingNextBtn">Двигаемся дальше</button>
      </div>
      <div class="nav-row one-col">
        <button class="secondary-btn" type="button" data-go="step5">← Назад</button>
      </div>
    </div>
  `;

  app.appendChild(section);

  const appNextButton = document.querySelector('[data-screen="step5"] .next-step-btn');
  if (appNextButton) {
    appNextButton.dataset.go = 'step6';
    appNextButton.textContent = 'Дальше →';
  }
}

function refreshCollections() {
  return {
    screens: Array.from(document.querySelectorAll('.flow-screen')),
    goButtons: Array.from(document.querySelectorAll('[data-go]')),
    copyButtons: Array.from(document.querySelectorAll('[data-copy-target]')),
    videoButtons: Array.from(document.querySelectorAll('[data-video-play]'))
  };
}

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

function saveRating(value) {
  try {
    localStorage.setItem(STORAGE_RATING_KEY, String(value));
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

function getSavedRating() {
  try {
    return Number(localStorage.getItem(STORAGE_RATING_KEY) || '0');
  } catch (error) {
    return 0;
  }
}

function goTop() {
  try {
    window.scrollTo(0, 0);
  } catch (error) {}
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
  const currentScreens = Array.from(document.querySelectorAll('.flow-screen'));
  const next = document.querySelector(`[data-screen="${name}"]`);
  const safeName = next ? name : 'welcome';
  const safeNext = document.querySelector(`[data-screen="${safeName}"]`);

  currentScreens.forEach(screen => screen.classList.remove('active'));
  if (safeNext) safeNext.classList.add('active');
  if (shouldSave) saveScreen(safeName);

  updateProgress(safeName);
}

function showScreen(name) {
  const current = document.querySelector('.flow-screen.active');
  const next = document.querySelector(`[data-screen="${name}"]`);
  if (!next || next === current) return;

  applyScreen(name, true);
  goTop();
  softHaptic(10);
}

function restoreProgress() {
  const savedScreen = getSavedScreen();
  const chatJoined = getSavedChatJoined();
  const savedRating = getSavedRating();

  applyScreen(savedScreen, false);

  if (chatJoined && chatJoinedBtn) {
    chatJoinedBtn.classList.add('checked');
  }

  if (savedRating > 0) {
    setRating(savedRating, false);
  }

  setTimeout(goTop, 80);
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
  const count = 56;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--x', (Math.random() * 160 - 80) + 'px');
    piece.style.animationDelay = Math.random() * 0.25 + 's';
    piece.style.animationDuration = 0.9 + Math.random() * 0.55 + 's';
    confettiLayer.appendChild(piece);

    setTimeout(() => piece.remove(), 1800);
  }
}

function fireRatingSparks() {
  const sparks = document.getElementById('ratingSparks');
  if (!sparks) return;

  for (let i = 0; i < 14; i++) {
    const spark = document.createElement('span');
    spark.style.setProperty('--x', (Math.random() * 160 - 80) + 'px');
    spark.style.setProperty('--y', (-18 - Math.random() * 60) + 'px');
    spark.style.animationDelay = Math.random() * 0.12 + 's';
    sparks.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
  }
}

function setRating(value, animate = true) {
  const stars = Array.from(document.querySelectorAll('.rating-star'));
  const result = document.getElementById('ratingResult');
  const nextBtn = document.getElementById('ratingNextBtn');

  stars.forEach(star => {
    const starValue = Number(star.dataset.rating);
    star.classList.toggle('is-active', starValue <= value);
  });

  if (result) {
    result.textContent = value === 5
      ? 'Класс! Значит, первый этап зашёл максимально понятно 🚀'
      : `Спасибо! Твоя оценка: ${value} из 5`;
  }

  if (nextBtn) {
    nextBtn.classList.add('is-visible');
  }

  saveRating(value);

  if (animate) {
    fireRatingSparks();
    softHaptic(20);
    showToast('Оценка сохранена');
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

function bindDynamicEvents() {
  document.querySelectorAll('[data-go]').forEach(button => {
    if (button.dataset.boundGo === '1') return;
    button.dataset.boundGo = '1';
    button.addEventListener('click', () => {
      const target = button.dataset.go;
      showScreen(target);
    });
  });

  document.querySelectorAll('[data-copy-target]').forEach(button => {
    if (button.dataset.boundCopy === '1') return;
    button.dataset.boundCopy = '1';
    button.addEventListener('click', () => {
      copyTextFromElement(button.dataset.copyTarget, button);
    });
  });

  document.querySelectorAll('[data-video-play]').forEach(button => {
    if (button.dataset.boundVideo === '1') return;
    button.dataset.boundVideo = '1';
    button.addEventListener('click', () => {
      startVideo(button);
    });
  });

  document.querySelectorAll('.rating-star').forEach(button => {
    if (button.dataset.boundRating === '1') return;
    button.dataset.boundRating = '1';
    button.addEventListener('click', () => {
      setRating(Number(button.dataset.rating || '0'));
    });
  });

  const ratingNextBtn = document.getElementById('ratingNextBtn');
  if (ratingNextBtn && ratingNextBtn.dataset.boundNext !== '1') {
    ratingNextBtn.dataset.boundNext = '1';
    ratingNextBtn.addEventListener('click', () => {
      showToast('Скоро откроем следующий этап');
      softHaptic(16);
    });
  }
}

ensureRatingStep();
bindDynamicEvents();
restoreProgress();
window.addEventListener('load', () => setTimeout(goTop, 80), { once: true });

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (chatJoinedBtn) chatJoinedBtn.classList.remove('checked');
    saveChatJoined(false);
    saveRating(0);
    showScreen('welcome');
    showToast('Начинаем заново');
    softHaptic(14);
  });
}

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