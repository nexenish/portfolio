document.addEventListener('DOMContentLoaded', function () {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
});

const scrollElements = document.querySelectorAll('.scroll-animate');

if ('IntersectionObserver' in window) {
  const observerOptions = {
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  scrollElements.forEach(el => observer.observe(el));
} else {
  // Фолбек: если IntersectionObserver не поддерживается,
  // просто сразу показываем элементы
  scrollElements.forEach(el => el.classList.add('in-view'));
}


window.addEventListener('load', function () {
  // Скрываем прелоадер
  const preloader = document.getElementById('preloader');
  const content = document.getElementById('main');

  setTimeout(() => {
    preloader.classList.add('hide');
    content.classList.add('visible');
  }, 500); // небольшая задержка для плавности
});