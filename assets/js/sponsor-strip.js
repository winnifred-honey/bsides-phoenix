/* Pause button for the scrolling sponsor strip (WCAG 2.2.2 Pause, Stop, Hide).
   Without JavaScript the strip still pauses on hover and keyboard focus. When the
   device asks for reduced motion the strip doesn't move, so the button stays hidden. */
(function () {
  var strip = document.querySelector('.sponsor-strip');
  if (!strip) return;
  var btn = strip.querySelector('.sponsor-strip__pause');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!btn || (reduce && reduce.matches)) return;
  btn.hidden = false;
  btn.addEventListener('click', function () {
    var paused = strip.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(paused));
    btn.textContent = paused ? 'Play' : 'Pause';
  });
})();
