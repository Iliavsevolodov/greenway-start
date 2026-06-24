const resetBtn = document.getElementById('resetBtn');
const toast = document.getElementById('toast');
const loader = document.getElementById('loader');
const loaderPercent = document.getElementById('loaderPercent');
const confettiLayer = document.getElementById('confettiLayer');
const chatJoinedBtn = document.getElementById('chatJoinedBtn');
const screens = Array.from(document.querySelectorAll('.flow-screen'));
const goButtons = Array.from(document.querySelectorAll('[data-go]'));

function showToast(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1600);
}

function showScreen(name) {
  const current = document.querySelector('.flow-screen.active');
  const next = document.querySelector(`[data-screen="${name}"]`);
  if (!next || next === current) return;

  document.body.classList.add('screen-leave');

  setTimeout(() => {
    screens.forEach(screen => screen.classList.remove('active'));
    document.body.classList.remove('screen-leave');
    next.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 260);
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

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (chatJoinedBtn) chatJoinedBtn.classList.remove('checked');
    showScreen('welcome');
    showToast('Начинаем заново');
  });
}

goButtons.forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.go;
    showScreen(target);
  });
});

if (chatJoinedBtn) {
  chatJoinedBtn.addEventListener('click', () => {
    if (chatJoinedBtn.classList.contains('checked')) return;

    chatJoinedBtn.classList.add('checked');
    fireConfetti();
    showToast('Отлично! Шаг выполнен');

    setTimeout(() => {
      showScreen('step2');
    }, 900);
  });
}

runLoader();
