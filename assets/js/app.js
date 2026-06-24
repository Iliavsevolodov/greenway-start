const resetBtn = document.getElementById('resetBtn');
const startBtn = document.getElementById('startBtn');
const toast = document.getElementById('toast');

function showToast(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1600);
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Начинаем заново');
  });
}

if (startBtn) {
  startBtn.addEventListener('click', () => {
    showToast('Скоро добавим шаг 1');
  });
}
