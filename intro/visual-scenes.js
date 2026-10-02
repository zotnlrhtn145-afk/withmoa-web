(() => {
  const figures = [...document.querySelectorAll('.product-visual')];
  if (!figures.length) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const play = figure => {
    if (preference.matches) return;
    figure.classList.remove('is-playing');
    requestAnimationFrame(() => requestAnimationFrame(() => figure.classList.add('is-playing')));
  };
  figures.forEach(figure => figure.querySelector('.visual-replay')?.addEventListener('click', () => play(figure)));
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
      target.classList.toggle('visual-on-screen', isIntersecting);
      if (isIntersecting && !target.classList.contains('is-playing')) play(target);
    }), { threshold: .2 });
    figures.forEach(figure => observer.observe(figure));
  } else figures.forEach(figure => figure.classList.add('visual-on-screen'));
  preference.addEventListener('change', event => {
    if (event.matches) figures.forEach(figure => figure.classList.remove('is-playing'));
    else figures.filter(figure => figure.classList.contains('visual-on-screen')).forEach(play);
  });
})();
