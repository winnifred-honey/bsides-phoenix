/* Site menu: phone "Menu" button and the About / Events dropdowns.
   Without JavaScript the menu still works: on phones it shows fully
   expanded, and the dropdowns open and close as <details> elements. */
(function () {
  var root = document.documentElement;
  root.classList.add('js-nav');

  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
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
