// public/sylva.js
// Production Lightweight Script for Urban Vibes Interior Design & Decor

(function () {
  'use strict';

  function initApp() {
    document.body.classList.add('js', 'is-ready', 'intro-done');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
