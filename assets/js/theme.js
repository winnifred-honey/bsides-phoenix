/* Light / dark switch.
   The site follows the visitor's device setting until they press the switch.
   Their choice is saved on this device (localStorage "bsp-theme"). Choosing the
   same mode as the device setting clears the saved choice, so the site goes
   back to following the device. The <head> of each page has a one-line script
   that applies a saved choice before the page is drawn, so there's no flash. */
(function () {
  var KEY = 'bsp-theme';
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function device() { return media && media.matches ? 'dark' : 'light'; }
  function current() { return root.getAttribute('data-theme') || device(); }
  function save(value) { try { value ? localStorage.setItem(KEY, value) : localStorage.removeItem(KEY); } catch (e) {} }

  var buttons = Array.prototype.slice.call(document.querySelectorAll('.theme-toggle'));
  function render() {
    var now = current();
    var next = now === 'dark' ? 'light' : 'dark';
    buttons.forEach(function (b) {
      b.hidden = false;
      b.setAttribute('data-current', now);
      b.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      b.title = 'Switch to ' + next + ' mode';
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      if (next === device()) { root.removeAttribute('data-theme'); save(null); }
      else { root.setAttribute('data-theme', next); save(next); }
      render();
    });
  });
  if (media && media.addEventListener) media.addEventListener('change', render);
  render();
})();
