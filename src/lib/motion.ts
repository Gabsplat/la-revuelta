import { useEffect } from 'react';
import { animate, onScroll, splitText, stagger } from 'animejs';

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

type Revertible = { revert: () => unknown };

/** Animaciones comunes a todas las páginas. Se declaran con atributos data-* en el markup. */
export function usePageMotion(key: string) {
  useEffect(() => {
    if (reducedMotion()) return;
    const live: Revertible[] = [];
    const all = <T extends HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];

    const enter: Record<string, (el: HTMLElement) => void> = {
      lines: el => {
        const lines = el.querySelectorAll<HTMLElement>('.line-in');
        live.push(
          animate(lines, {
            y: ['110%', '0%'],
            rotate: [4, 0],
            duration: 1100,
            delay: stagger(90, { start: Number(el.dataset.delay ?? 0) }),
            ease: 'outExpo',
            onComplete: () => lines.forEach(l => l.parentElement!.style.overflow = 'visible'),
          }),
        );
      },
      reveal: el => {
        live.push(
          animate(el, {
            opacity: [0, 1],
            y: [36, 0],
            duration: 900,
            delay: Number(el.dataset.delay ?? 0),
            ease: 'outQuart',
          }),
        );
      },
      count: el => {
        const [, prefix, digits, suffix] = el.dataset.count!.match(/^(\D*)([\d.]+)(.*)$/)!;
        const decimals = digits.split('.')[1]?.length ?? 0;
        const counter = { value: 0 };
        live.push(
          animate(counter, {
            value: Number(digits),
            duration: 1600,
            ease: 'outExpo',
            onUpdate: () => (el.textContent = `${prefix}${counter.value.toFixed(decimals)}${suffix}`),
          }),
        );
      },
    };

    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          Object.keys(enter).forEach(name => name in el.dataset && enter[name](el));
        }),
      { rootMargin: '0px 0px -8% 0px' },
    );
    all('[data-lines],[data-reveal],[data-count]').forEach(el => observer.observe(el));

    all('[data-parallax]').forEach(el => {
      const amount = Number(el.dataset.parallax);
      live.push(
        animate(el, {
          y: [`${-amount}px`, `${amount}px`],
          ease: 'linear',
          autoplay: onScroll({ target: el.parentElement!, sync: true }),
        }),
      );
    });

    all('[data-spin]').forEach(el => {
      live.push(
        animate(el, {
          rotate: [0, Number(el.dataset.spin)],
          ease: 'linear',
          autoplay: onScroll({ target: el.parentElement!, sync: 0.25 }),
        }),
      );
    });

    all('[data-fill]').forEach(el => {
      const split = splitText(el, { words: true });
      live.push(
        split,
        animate(split.words, {
          opacity: [0.13, 1],
          duration: 300,
          delay: stagger(110),
          ease: 'linear',
          autoplay: onScroll({ target: el, enter: 'bottom-=12% top', leave: 'center bottom', sync: 0.35 }),
        }),
      );
    });

    return () => {
      observer.disconnect();
      live.forEach(item => item.revert());
    };
  }, [key]);
}
