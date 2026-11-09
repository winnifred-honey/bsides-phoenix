/* Site menu: phone "Menu" button and the About / Events dropdowns.
   Without JavaScript the menu still works: on phones it shows fully
   expanded, and the dropdowns open and close as <details> elements. */
(function () {
  var root = document.documentElement;
  root.classList.add('js-nav');

  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var header = document.querySelector('.site-header--nav');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (header) header.classList.toggle('menu-open', open);
  }
  if (toggle && nav) {
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    /* On phones, close the menu after choosing a link so the page isn't hidden behind it */
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
  }

  /* Sticky menu: compact once the page has scrolled, and tell the CSS how tall the
     header is so in-page links (like #registration) stop just below it. */
  if (header) {
    var ticking = false;
    var update = function () {
      ticking = false;
      header.classList.toggle('is-stuck', window.scrollY > 24);
      if (header.classList.contains('is-stuck') && !header.classList.contains('menu-open')) {
        root.style.setProperty('--header-h', header.offsetHeight + 'px');
      }
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  var menus = Array.prototype.slice.call(document.querySelectorAll('.site-nav__dd'));
  menus.forEach(function (menu) {
    menu.addEventListener('toggle', function () {
      if (menu.open) menus.forEach(function (other) { if (other !== menu) other.open = false; });
    });
  });
  document.addEventListener('click', function (e) {
    menus.forEach(function (menu) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    menus.forEach(function (menu) {
      if (menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
    });
  });
})();
