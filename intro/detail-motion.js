/* Editorial motion for the five product detail pages. */
(() => {
  if (!document.body.classList.contains('detail-page')) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (matchMedia('(max-width: 760px)').matches || preference.matches || !('IntersectionObserver' in window)) return;
  const body = document.body;
  const clamp = value => Math.max(0, Math.min(1, value));
  const scenes = [...document.querySelectorAll('main > section')];
  const active = new Set();
  let frame = 0;
  let stopped = false;

  // Existing copy tokens retain their accessible text and natural wrapping.
  document.querySelectorAll('.feature-panel h2,.faq h2').forEach(heading => {
    if (heading.hasAttribute('data-animate')) return;
    heading.setAttribute('data-animate', '');
    let index = 0;
    const wrap = node => [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        for (const token of child.textContent.match(/\S+\s*|\s+/g) || []) {
          const word = document.createElement('span');
          word.className = 'copy-token';
          word.style.setProperty('--i', index++);
          word.textContent = token;
          fragment.append(word);
        }
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') wrap(child);
    });
    wrap(heading);
  });

  const reveals = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('motion-visible');
      if (target.hasAttribute('data-animate')) target.classList.add('in-view');
      reveals.unobserve(target);
    });
  }, { threshold: .16, rootMargin: '0px 0px -5% 0px' });

  const groups = '.reading-order,.service-steps,.api-catalog,.api-destinations,.download-grid,.language-art,.check-list';
  document.querySelectorAll(groups).forEach(group => {
    [...group.children].forEach((item, index) => {
      item.classList.add('motion-item');
      item.style.setProperty('--delay', `${index * 130}ms`);
      reveals.observe(item);
    });
  });
  document.querySelectorAll('[data-animate],.page-lead,.page-intro>.text-link,.art-caption,.editorial-body>p,.spread-columns>*').forEach(element => {
    element.classList.add('motion-copy');
    reveals.observe(element);
  });

  scenes.forEach((scene, index) => {
    scene.classList.add('motion-scene');
    scene.style.setProperty('--chapter', index);
    // Avoid hiding a tall section until an unreachable intersection threshold.
    scene.removeAttribute('data-reveal');
  });
  const paint = () => {
    frame = 0;
    if (stopped) return;
    const height = innerHeight;
    const measurements = [...active].map(scene => [scene, scene.getBoundingClientRect()]);
    measurements.forEach(([scene, rect]) => {
      const enter = clamp((height - rect.top) / (height * .78));
      const travel = clamp((height - rect.top) / (height + rect.height));
      scene.style.setProperty('--enter', enter.toFixed(4));
      scene.style.setProperty('--travel', travel.toFixed(4));
      scene.style.setProperty('--lift', `${((.5 - travel) * 64).toFixed(2)}px`);
      scene.style.setProperty('--drift', `${((.5 - travel) * 25).toFixed(2)}px`);
      scene.style.setProperty('--turn', `${((.5 - travel) * 5).toFixed(2)}deg`);
      scene.style.setProperty('--paper-scale', (.94 + enter * .06).toFixed(4));
      scene.classList.toggle('chapter-arrived', enter > .3);
      const steps = [...scene.querySelectorAll('.service-steps li')];
      steps.forEach(step => {
        const bounds = step.getBoundingClientRect();
        step.classList.toggle('step-current', bounds.top < height * .72 && bounds.bottom > height * .24);
      });
    });
  };
  const schedule = () => { if (!frame && !stopped) frame = requestAnimationFrame(paint); };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) active.add(target); else active.delete(target);
    });
    schedule();
  }, { rootMargin: '160px 0px' });
  scenes.forEach(scene => observer.observe(scene));
  body.classList.add('detail-motion');
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });

  // User-triggered transitions: the actual app preview stays intact.
  const animatePanel = panel => {
    if (stopped || panel.hidden) return;
    const heading = panel.querySelector('h2');
    heading?.classList.add('in-view');
    const items = [...panel.querySelectorAll('.copy-token,.check-list li,.panel-image')];
    items.forEach((element, index) => {
      element.getAnimations().forEach(animation => animation.cancel());
      element.animate([
        { opacity: .12, translate: '0 24px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 760, delay: Math.min(index * 60, 360), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      element.classList.add('motion-visible');
    });
    const emphasis = heading?.querySelector('em');
    emphasis?.animate([{ backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%' }], { duration: 850, delay: 220, fill: 'backwards', easing: 'cubic-bezier(.22,1,.36,1)' });
  };
  const panelObserver = new MutationObserver(records => records.forEach(record => {
    if (!record.target.hidden) animatePanel(record.target);
  }));
  document.querySelectorAll('.feature-panel').forEach(panel => panelObserver.observe(panel, { attributes: true, attributeFilter: ['hidden'] }));
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    if (stopped) return;
    document.querySelectorAll('.language-paper h3,.language-paper p,.paper-foot').forEach((element, index) => {
      element.getAnimations().forEach(animation => animation.cancel());
      element.animate([{ opacity: 0, translate: '20px 0' }, { opacity: 1, translate: '0 0' }], { duration: 650, delay: index * 100, fill: 'backwards', easing: 'cubic-bezier(.16,1,.3,1)' });
    });
  }));
  document.querySelectorAll('.faq details').forEach(details => details.addEventListener('toggle', () => {
    if (details.open && !stopped) details.querySelector('p')?.animate([{ opacity: 0, translate: '0 -8px' }, { opacity: 1, translate: '0 0' }], { duration: 320, easing: 'ease-out' });
  }));
  preference.addEventListener('change', event => {
    if (!event.matches) return;
    stopped = true;
    body.classList.remove('detail-motion');
    observer.disconnect(); reveals.disconnect(); panelObserver.disconnect();
    cancelAnimationFrame(frame);
    document.querySelectorAll('main *').forEach(element => element.getAnimations().forEach(animation => animation.cancel()));
  });
  schedule();
})();
