(function () {
  var openBtn = document.querySelector('.mobile-menu-open');
  var menu = document.getElementById('site-mobile-menu');
  var closeBtn = document.querySelector('.mobile-menu-close');

  if (!openBtn || !menu || !closeBtn) {
    return;
  }

  var anchorLinks = menu.querySelectorAll('.mobile-menu-nav a[href^="#"]');

  function openMenu() {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-menu-open');
    closeBtn.focus();
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-menu-open');
    openBtn.focus();
  }

  openBtn.addEventListener('click', openMenu);

  closeBtn.addEventListener('click', closeMenu);

  var cta = menu.querySelector('.mobile-menu-cta');
  if (cta) {
    cta.addEventListener('click', closeMenu);
  }

  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();
