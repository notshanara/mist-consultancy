// Runs before the page paints, so animated content starts hidden rather than flashing into view.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  // Review aid, in the development server only: ?motion=on shows the animation for this tab on a device set to reduce motion.
  var forced = false;
  if (root.hasAttribute('data-review')) {
    try {
      if (/[?&]motion=on\b/.test(location.search)) sessionStorage.setItem('mist-motion', 'on');
      forced = sessionStorage.getItem('mist-motion') === 'on';
    } catch (error) {}
  }
  if (forced || window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    root.classList.add('motion');
    // If the motion script never runs, nothing should stay hidden waiting for it.
    setTimeout(function () {
      if (!root.hasAttribute('data-motion-ready')) root.classList.remove('motion');
    }, 3000);
  }
})();
