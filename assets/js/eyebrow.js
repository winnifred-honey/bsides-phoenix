/* Even spacing for eyebrows (DotGothic16).
   The font's letters have different widths, so tracking leaves uneven gaps
   around narrow letters like "I". This puts each letter in an equal-width
   cell. Screen readers get the original text; the cells are hidden from them.
   Write eyebrows as plain text: <p class="eyebrow">Key dates</p> */
(function () {
  var items = document.querySelectorAll('.eyebrow');
  Array.prototype.forEach.call(items, function (el) {
    if (el.classList.contains('eyebrow--cells') || el.children.length) return;
    var text = el.textContent.trim();
    if (!text) return;
    var label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = text;
    var cells = document.createElement('span');
    cells.setAttribute('aria-hidden', 'true');
    text.split(/\s+/).forEach(function (word, i) {
      if (i) cells.appendChild(document.createTextNode(' '));
      var w = document.createElement('span');
      w.className = 'eyebrow__word';
      Array.prototype.forEach.call(word, function (ch) {
        var c = document.createElement('span');
        c.className = 'eyebrow__cell';
        c.textContent = ch;
        w.appendChild(c);
      });
      cells.appendChild(w);
    });
    el.textContent = '';
    el.appendChild(label);
    el.appendChild(cells);
    el.classList.add('eyebrow--cells');
  });
})();
