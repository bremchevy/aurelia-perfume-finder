/* A decorative film must never get in the way of finding a fragrance. */
(function () {
  'use strict';
  var hero = document.getElementById('aureliaHero');
  var film = document.getElementById('heroFilm');
  var toggle = document.getElementById('heroMotion');
  var label = document.getElementById('heroMotionLabel');
  var progress = document.getElementById('heroFilmProgress');
  if (!hero || !film || !toggle) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var connection = navigator.connection;
  var userPaused = false;
  var inView = true;
  var loaded = false;
  var failed = false;
  var explicitlyPlaying = false;

  function updateControl() {
    var playing = !film.paused && !film.ended;
    hero.classList.toggle('is-playing', playing);
    label.textContent = playing ? 'Pause atmosphere' : 'Play atmosphere';
    toggle.setAttribute('aria-label', playing ? 'Pause decorative fragrance film' : 'Play decorative fragrance film');
  }

  function play() {
    if (failed || userPaused || !inView || document.hidden) return;
    if (!explicitlyPlaying && (reducedMotion.matches || (connection && connection.saveData))) return;
    if (!loaded) {
      film.src = film.dataset.src;
      film.load();
      loaded = true;
    }
    var attempt = film.play();
    if (attempt) attempt.catch(function () { updateControl(); });
  }

  toggle.hidden = false;
  toggle.addEventListener('click', function () {
    if (!film.paused) {
      userPaused = true;
      film.pause();
    } else {
      userPaused = false;
      explicitlyPlaying = true;
      play();
    }
  });
  film.addEventListener('playing', function () {
    hero.classList.add('has-film');
    updateControl();
  });
  film.addEventListener('pause', updateControl);
  film.addEventListener('error', function () {
    failed = true;
    hero.classList.remove('is-playing', 'has-film');
    toggle.hidden = true;
    progress.style.transform = 'scaleX(0)';
  });
  film.addEventListener('timeupdate', function () {
    if (Number.isFinite(film.duration) && film.duration > 0) {
      progress.style.transform = 'scaleX(' + film.currentTime / film.duration + ')';
    }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) film.pause();
    else play();
  });
  reducedMotion.addEventListener('change', function () {
    explicitlyPlaying = false;
    if (reducedMotion.matches) film.pause();
    else play();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) play();
      else film.pause();
    }, { threshold: 0.05 }).observe(hero);
  }
  play();
})();
