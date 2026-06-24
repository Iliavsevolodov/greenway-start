const resetBtn = document.getElementById('resetBtn');
const toast = document.getElementById('toast');
const loader = document.getElementById('loader');
const loaderPercent = document.getElementById('loaderPercent');
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
  if (!loader || !loaderPercent) {
    document.body.classList.add('loaded');
    return;
  }

  let progress = 0;
  const timer = setInterval(() => {
    progress += Math.floor(Math.random() * 12) + 8;
    if (progress >= 100) progress = 100;
    loaderPercent.textContent = progress + '%';

    if (progress === 100) {
      clearInterval(timer);
      setTimeout(() => {
        loader.classList.add('hide');
        document.body.classList.add('loaded');
      }, 180);
    }
  }, 55);
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
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

window.addEventListener('load', runLoader);
