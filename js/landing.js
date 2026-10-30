/* Marketing page motion: one move, applied once per section on arrival.
   Transform and opacity only, so it never triggers layout. Anyone with
   reduced motion turned on gets the finished state immediately. */
(function () {
  'use strict';

  // Nothing above the fold gets an entrance: an element that is already on
  // screen when the page opens would simply start invisible.
  var targets = document.querySelectorAll('.statement, .step, .audience, .closer, .band');
  if (!targets.length) return;

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) return;   // leave them as-is

  // Only now does the CSS get permission to hide anything. If this script
  // never runs, every section stays visible instead of going blank.
  document.documentElement.classList.add('js-motion');
  for (var i = 0; i < targets.length; i++) targets[i].classList.add('rise');

  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      seen.unobserve(entry.target);           // one entrance each, not a loop
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  for (var j = 0; j < targets.length; j++) {
    // Anything already on screen is shown at once; an entrance is for things
    // the reader scrolls to, never for what is in front of them already.
    var box = targets[j].getBoundingClientRect();
    if (box.top < window.innerHeight) targets[j].classList.add('is-in');
    else seen.observe(targets[j]);
  }
})();
