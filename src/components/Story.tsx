import { useEffect, useRef, useState } from 'react';
import { createTimeline, createTimer, onScroll } from 'animejs';
import { chapters } from '../content';
import { reducedMotion } from '../lib/motion';

const TAU = Math.PI * 2;
const YELLOW = '252,245,50';
const NEEDS = ['Conectar', 'Aprender', 'Disfrutar', 'Crecer', 'Crear', 'Cuidar', 'Pertenecer', 'Descubrir'];
const STORE_COUNT = 5;
const GROUND = 0.5; // achatamiento vertical del plano del piso
const FEET = 17; // distancia del centro del personaje a sus pies, en unidades de escena

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const seg = (v: number, from: number, to: number) => clamp((v - from) / (to - from));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const outBack = (t: number) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Point = { x: number; y: number };
type NetNode = Point & { kind: 'person' | 'store'; parent: Point; delay: number; phase: number };

// Posiciones en el plano del piso, con el personaje en el origen.
const stores: Point[] = Array.from({ length: STORE_COUNT }, (_, i) => {
  const angle = -Math.PI / 2 + TAU / 10 + (i * TAU) / STORE_COUNT;
  return { x: Math.cos(angle) * 74, y: Math.sin(angle) * 74 };
});

function buildNetwork() {
  const random = seeded(7);
  const rings = [
    { radius: 122, count: 9, kind: 'person' as const },
    { radius: 172, count: 12, kind: 'store' as const },
    { radius: 228, count: 16, kind: 'person' as const },
    { radius: 290, count: 20, kind: 'store' as const },
  ];
  const nodes: NetNode[] = [];
  let previous: Point[] = stores;
  rings.forEach((ring, r) => {
    const current: NetNode[] = [];
    for (let i = 0; i < ring.count; i++) {
      const angle = ((i + random() * 0.5) / ring.count) * TAU + r;
      const radius = ring.radius + (random() - 0.5) * 22;
      const point = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
      const parent = previous.reduce((best, p) =>
        Math.hypot(p.x - point.x, p.y - point.y) < Math.hypot(best.x - point.x, best.y - point.y) ? p : best,
      );
      current.push({ ...point, kind: ring.kind, parent, delay: r * 0.19 + random() * 0.14, phase: random() });
    }
    nodes.push(...current);
    previous = current;
  });
  return nodes;
}

const network = buildNetwork();
const dust = (() => {
  const random = seeded(21);
  return Array.from({ length: 90 }, () => ({
    x: (random() - 0.5) * 520,
    y: (random() - 0.5) * 380,
    depth: 0.25 + random() * 0.75,
    phase: random() * TAU,
  }));
})();

function loadImage(src: string) {
  const image = new Image();
  image.src = src;
  return image;
}

/** Versión apagada de un sprite: desaturada y oscura. */
function dimmed(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) * 0.34 + 14;
    d[i] = lum * 1.04;
    d[i + 1] = lum * 1.04;
    d[i + 2] = lum;
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

export default function Story() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const panels = [...el.querySelectorAll<HTMLElement>('.story-panel')];
    const bar = el.querySelector<HTMLElement>('.story-bar i')!;
    const hint = el.querySelector<HTMLElement>('.story-hint')!;
    const scrim = el.querySelector<HTMLElement>('.story-scrim')!;
    const still = reducedMotion();

    const character = loadImage('/images/generated/character.webp');
    const bulb = loadImage('/images/generated/idea.webp');
    const storeOn = loadImage('/images/generated/business.webp');
    let storeOff: HTMLCanvasElement | undefined;
    storeOn.decode().then(() => (storeOff = dimmed(storeOn)), () => {});

    // Estado de la escena. El scroll lo mueve a través de la timeline.
    const s = { p: 0, needs: 0, cam: 1.22, stores: 0, deliver: 0, back: 0, net: 0, inf: 0 };
    const timeline = createTimeline({
      defaults: { ease: 'inOutSine' },
      autoplay: onScroll({ target: el, enter: 'top top', leave: 'bottom bottom', sync: still ? true : 0.18 }),
    })
      .add(s, { p: 1, duration: 1000, ease: 'linear' }, 0)
      .add(s, { needs: 1, duration: 170, ease: 'linear' }, 10)
      .add(s, { cam: 0.66, duration: 170 }, 195)
      .add(s, { stores: 1, duration: 170, ease: 'linear' }, 225)
      .add(s, { deliver: 1, duration: 170, ease: 'linear' }, 425)
      .add(s, { back: 1, duration: 120, ease: 'linear' }, 570)
      .add(s, { cam: 0.31, duration: 210 }, 690)
      .add(s, { net: 1, duration: 200, ease: 'linear' }, 695)
      .add(s, { inf: 1, duration: 105, ease: 'linear' }, 890);

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const move = (e: PointerEvent) => {
      pointer.tx = e.clientX / innerWidth - 0.5;
      pointer.ty = e.clientY / innerHeight - 0.5;
    };
    el.addEventListener('pointermove', move);

    let chapter = 0;

    const draw = (time: number) => {
      const wide = width > 900;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const cx = width * (wide ? 0.66 : 0.5) - pointer.x * 26;
      const cy = height * (wide ? 0.5 : 0.34) - pointer.y * 18;
      const base = (wide ? Math.min(width * 0.56, height) : Math.min(width * 1.15, height * 0.6)) / 100;
      // En pantallas angostas la escena se comprime a lo ancho para que entre completa.
      const squeeze = wide ? 1 : 0.72;
      const flat = wide ? GROUND : 0.64;
      const U = base * s.cam;
      const groundY = cy + FEET * U;
      const ground = (p: Point): Point => ({ x: cx + p.x * U * squeeze, y: groundY + p.y * U * flat });
      const ready = (image: HTMLImageElement) => image.complete && image.naturalWidth > 0;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingQuality = 'high';

      const sprite = (image: CanvasImageSource & { width: number; height: number }, x: number, bottom: number, w: number, alpha = 1) => {
        if (alpha <= 0.01 || w < 0.5) return;
        const h = (w * image.height) / image.width;
        ctx.globalAlpha = clamp(alpha);
        ctx.drawImage(image, x - w / 2, bottom - h, w, h);
        ctx.globalAlpha = 1;
      };
      const glow = (x: number, y: number, radius: number, alpha: number) => {
        if (alpha <= 0.005 || radius <= 0) return;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${YELLOW},${alpha})`);
        gradient.addColorStop(1, `rgba(${YELLOW},0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      };
      const shadow = (x: number, y: number, radius: number, alpha: number) => {
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius * 0.28, 0, 0, TAU);
        ctx.fill();
      };

      // Fondo: luz general y polvo con profundidad.
      const litAll = seg(s.deliver, 0.4, 1);
      glow(cx, cy, 70 * base, 0.07 + 0.05 * litAll + 0.05 * s.net);
      dust.forEach(d => {
        const x = cx + d.x * base * (0.4 + s.cam * d.depth * 0.6);
        const y = cy + d.y * base * (0.4 + s.cam * d.depth * 0.6);
        const twinkle = 0.5 + 0.5 * Math.sin(time * 1.3 + d.phase);
        ctx.fillStyle = `rgba(${YELLOW},${0.1 + 0.3 * twinkle * d.depth})`;
        ctx.fillRect(x, y, 1 + d.depth * 1.6, 1 + d.depth * 1.6);
      });

      // Aros en el piso que laten desde el personaje.
      for (let ring = 0; ring < 3; ring++) {
        const wave = (time * 0.12 + ring / 3) % 1;
        const radius = (20 + wave * 90) * U;
        ctx.strokeStyle = `rgba(${YELLOW},${(1 - wave) * (0.1 + 0.16 * s.back)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, groundY, radius * squeeze, radius * flat, 0, 0, TAU);
        ctx.stroke();
      }

      const queue: { depth: number; paint: () => void }[] = [];

      // Red: personas y empresas que se suman en oleadas.
      if (s.net > 0) {
        ctx.lineWidth = Math.max(1, 0.22 * U);
        network.forEach(node => {
          const grow = seg(s.net, node.delay, node.delay + 0.22);
          if (grow <= 0) return;
          const from = ground(node.parent);
          const to = ground(node);
          const link = outCubic(grow);
          const end = { x: lerp(from.x, to.x, link), y: lerp(from.y, to.y, link) };
          ctx.strokeStyle = `rgba(${YELLOW},${0.3 * grow})`;
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          if (grow === 1) {
            const f = (time * 0.35 + node.phase) % 1;
            const travel = node.kind === 'store' ? f : 1 - f;
            ctx.fillStyle = `rgba(${YELLOW},.9)`;
            ctx.beginPath();
            ctx.arc(lerp(from.x, to.x, travel), lerp(from.y, to.y, travel), Math.max(1.5, 0.5 * U), 0, TAU);
            ctx.fill();
          }
          const pop = outBack(seg(grow, 0.45, 1));
          if (pop <= 0) return;
          queue.push({
            depth: to.y,
            paint: () => {
              const bob = Math.sin(time * 1.8 + node.phase * TAU) * 0.5 * U;
              if (node.kind === 'store') {
                glow(to.x, to.y - 6 * U, 20 * U, 0.2);
                if (ready(storeOn)) sprite(storeOn, to.x, to.y, 19 * U * pop);
              } else {
                shadow(to.x, to.y, 5 * U * pop, 0.4);
                if (ready(character)) sprite(character, to.x, to.y + bob, 12 * U * pop);
              }
            },
          });
        });
      }

      // Empresas: aparecen apagadas y se encienden cuando les llega una necesidad.
      const storeTop: Point[] = [];
      stores.forEach((store, j) => {
        const pos = ground(store);
        const appear = seg(s.stores, j * 0.13, j * 0.13 + 0.4);
        const litRaw = seg(s.deliver, j * 0.07 + 0.4, j * 0.07 + 0.52);
        const lit = inOut(litRaw);
        const w = 21 * U * outBack(appear) * (1 + 0.14 * Math.sin(Math.PI * litRaw));
        const y = pos.y - (1 - outCubic(appear)) * 14 * U;
        storeTop.push({ x: pos.x, y: y - w * 0.95 });
        if (appear <= 0) return;
        queue.push({
          depth: pos.y,
          paint: () => {
            shadow(pos.x, pos.y, 11 * U * appear, 0.45 * appear);
            glow(pos.x, y - w * 0.4, w * (1.1 + 0.08 * Math.sin(time * 2 + j)), 0.34 * lit);
            if (litRaw > 0 && litRaw < 1) {
              ctx.strokeStyle = `rgba(${YELLOW},${Math.sin(Math.PI * litRaw) * 0.9})`;
              ctx.lineWidth = Math.max(1, 0.4 * U);
              ctx.beginPath();
              ctx.arc(pos.x, y - w * 0.4, w * (0.4 + litRaw * 0.55), 0, TAU);
              ctx.stroke();
            }
            if (storeOff) sprite(storeOff, pos.x, y, w, appear * (1 - lit));
            if (ready(storeOn)) sprite(storeOn, pos.x, y, w, storeOff ? lit * appear : appear * (0.25 + 0.75 * lit));
          },
        });
      });

      // El valor vuelve: de cada empresa encendida al personaje.
      const chest = { x: cx, y: cy - 2 * U };
      if (s.back > 0) {
        stores.forEach((_, j) => {
          const progress = inOut(seg(s.back, j * 0.09, j * 0.09 + 0.55));
          if (progress <= 0) return;
          const from = storeTop[j];
          const mid = { x: (from.x + chest.x) / 2, y: Math.min(from.y, chest.y) - 16 * U };
          const at = (t: number): Point => ({
            x: (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * mid.x + t * t * chest.x,
            y: (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * mid.y + t * t * chest.y,
          });
          const fade = 1 - 0.6 * s.net;
          ctx.strokeStyle = `rgba(${YELLOW},${0.55 * fade})`;
          ctx.lineWidth = Math.max(1.2, 0.3 * U);
          ctx.setLineDash([1.4 * U, 1.6 * U]);
          ctx.lineDashOffset = time * 14 * U * 0.2;
          ctx.beginPath();
          for (let step = 0; step <= 28; step++) {
            const point = at((step / 28) * progress);
            if (step) ctx.lineTo(point.x, point.y);
            else ctx.moveTo(point.x, point.y);
          }
          ctx.stroke();
          ctx.setLineDash([]);
          for (let k = 0; k < 3; k++) {
            const f = (time * 0.42 + k / 3 + j * 0.17) % 1;
            if (f > progress) continue;
            const point = at(f);
            glow(point.x, point.y, 3.4 * U, 0.55 * fade);
            ctx.fillStyle = `rgba(255,253,210,${fade})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, Math.max(1.6, 0.7 * U), 0, TAU);
            ctx.fill();
          }
        });
      }

      // Personaje.
      const joy = inOut(s.back);
      const jump = Math.sin(Math.PI * seg(s.back, 0.25, 0.9)) * 5 * U;
      const breath = Math.sin(time * 1.7);
      queue.push({
        depth: groundY,
        paint: () => {
          shadow(cx, groundY, (9 - jump / U / 2) * U, 0.5);
          glow(cx, cy - 4 * U, (26 + 16 * joy + breath) * U, 0.16 + 0.24 * joy);
          if (!ready(character)) return;
          const h = 34 * U * (1 + 0.07 * joy) * (1 + 0.012 * breath);
          const w = (h * character.naturalWidth) / character.naturalHeight;
          ctx.save();
          ctx.translate(cx, groundY - jump);
          ctx.rotate(Math.sin(time * 0.9) * 0.025 + pointer.x * 0.08);
          ctx.drawImage(character, -w / 2, -h, w, h);
          ctx.restore();
        },
      });

      // Necesidades: salen de la cabeza, orbitan y viajan hasta su empresa.
      const orbitAlpha = seg(s.needs, 0.3, 0.8) * (1 - seg(s.deliver, 0, 0.5));
      [0, 1].forEach(o => {
        ctx.save();
        ctx.translate(cx, cy - 3 * U);
        ctx.rotate(o ? -0.33 : 0.28);
        ctx.strokeStyle = `rgba(${YELLOW},${0.2 * orbitAlpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 7]);
        ctx.beginPath();
        ctx.ellipse(0, 0, (o ? 40 : 30) * U * squeeze, (o ? 40 : 30) * U * 0.34, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      });
      ctx.setLineDash([]);

      NEEDS.forEach((label, i) => {
        const o = i % 2;
        const emerge = seg(s.needs, i * 0.075, i * 0.075 + 0.42);
        if (emerge <= 0) return;
        const theta = (i / NEEDS.length) * TAU + time * (o ? 0.34 : -0.46) + s.p * 5;
        const radius = (o ? 40 : 30) * U;
        const tilt = o ? -0.33 : 0.28;
        const ex = Math.cos(theta) * radius * squeeze;
        const ey = Math.sin(theta) * radius * 0.34;
        const z = Math.sin(theta);
        const orbit = {
          x: cx + ex * Math.cos(tilt) - ey * Math.sin(tilt),
          y: cy - 3 * U + ex * Math.sin(tilt) + ey * Math.cos(tilt),
        };
        const head = { x: cx + 1.5 * U, y: cy - 11 * U };
        const out = outBack(emerge);
        let x = lerp(head.x, orbit.x, out);
        let y = lerp(head.y, orbit.y, out);
        let size = (8.6 + 2.4 * z) * U * clamp(out, 0, 1.15);

        const travel = inOut(seg(s.deliver, i * 0.06, i * 0.06 + 0.42));
        const target = storeTop[i % STORE_COUNT];
        x = lerp(x, target.x, travel);
        y = lerp(y, target.y + 5 * U, travel) - Math.sin(Math.PI * travel) * 13 * U;
        size *= 1 - seg(travel, 0.72, 1);
        if (size < 0.5) return;

        const bob = Math.sin(time * 2.1 + i) * 0.7 * U * (1 - travel);
        queue.push({
          depth: travel > 0.05 ? groundY + 400 : groundY + z,
          paint: () => {
            glow(x, y + bob, size * 1.15, 0.26);
            if (ready(bulb)) {
              ctx.save();
              ctx.translate(x, y + bob);
              ctx.rotate(Math.sin(time * 1.4 + i * 1.7) * 0.16 + Math.sin(Math.PI * travel) * (i % 2 ? 0.5 : -0.5));
              const h = (size * bulb.naturalHeight) / bulb.naturalWidth;
              ctx.drawImage(bulb, -size / 2, -h / 2, size, h);
              ctx.restore();
            }
            const text = seg(emerge, 0.8, 1) * (1 - seg(travel, 0, 0.2)) * (0.55 + 0.45 * z);
            if (text > 0.02) {
              ctx.font = `600 ${Math.max(10, 1.75 * U)}px "Bricolage Grotesque Variable", sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillStyle = `rgba(241,237,226,${text})`;
              ctx.fillText(label, x, y + bob + size * 0.78);
            }
          },
        });
      });

      queue.sort((a, b) => a.depth - b.depth).forEach(item => item.paint());

      // Cierre: todo se atenúa y aparece el infinito.
      if (s.inf > 0) {
        const drawn = inOut(seg(s.inf, 0.05, 0.9));
        ctx.fillStyle = `rgba(11,11,9,${0.62 * seg(s.inf, 0, 0.5)})`;
        ctx.fillRect(0, 0, width, height);
        const a = (wide ? 40 : 44) * base;
        const at = (t: number): Point => {
          const angle = t * TAU - Math.PI / 2;
          const scale = a / (1 + Math.sin(angle) ** 2);
          return { x: cx + scale * Math.cos(angle), y: cy + scale * Math.sin(angle) * Math.cos(angle) };
        };
        const trace = (lineWidth: number, style: string, blur: number) => {
          ctx.strokeStyle = style;
          ctx.lineWidth = lineWidth;
          ctx.shadowColor = `rgb(${YELLOW})`;
          ctx.shadowBlur = blur;
          ctx.lineCap = 'round';
          ctx.beginPath();
          for (let step = 0; step <= 180; step++) {
            const point = at((step / 180) * drawn);
            if (step) ctx.lineTo(point.x, point.y);
            else ctx.moveTo(point.x, point.y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        };
        trace(2.4 * base, `rgb(${YELLOW})`, 4 * base);
        trace(0.5 * base, 'rgba(255,255,235,.9)', 0);
        for (let k = 0; k < 6; k++) {
          const f = (time * 0.11 + k / 6) % 1;
          if (f > drawn) continue;
          const point = at(f);
          glow(point.x, point.y, 5 * base, 0.8);
          if (ready(bulb)) sprite(bulb, point.x, point.y + 2.6 * base, 5.2 * base);
        }
      }

      // Textos y progreso.
      const next = chapters.findIndex(c => s.p < c.to || c.to === 1);
      if (next !== chapter) {
        chapter = next;
        setActive(next);
      }
      panels.forEach((panel, i) => {
        const c = chapters[i];
        const fadeIn = i === 0 ? 1 : seg(s.p, c.from - 0.012, c.from + 0.03);
        const fadeOut = i === chapters.length - 1 ? 0 : seg(s.p, c.to - 0.035, c.to - 0.005);
        const opacity = fadeIn * (1 - fadeOut);
        panel.style.opacity = String(opacity);
        panel.style.transform = `translateY(${(1 - fadeIn) * 46 - fadeOut * 46}px)`;
        panel.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
      });
      bar.style.transform = `scaleX(${s.p})`;
      scrim.style.opacity = String(s.net);
      hint.style.opacity = String(1 - seg(s.p, 0.01, 0.05));
    };

    const timer = createTimer({ onUpdate: self => draw(still ? 0 : self.currentTime / 1000) });
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? timer.resume() : timer.pause()));
    visibility.observe(el);

    return () => {
      visibility.disconnect();
      window.removeEventListener('resize', resize);
      el.removeEventListener('pointermove', move);
      timer.revert();
      timeline.revert();
    };
  }, []);

  const goTo = (index: number) => {
    const el = root.current!;
    const c = chapters[index];
    const at = c.from + (c.to - c.from) * 0.62;
    window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top + (el.offsetHeight - innerHeight) * at,
      behavior: reducedMotion() ? 'instant' : 'smooth',
    });
  };

  return (
    <section className="story" ref={root} id="filosofia" aria-label="Nuestra filosofía, en cinco capítulos">
      <div className="story-pin">
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="story-scrim" />
        <div className="story-copy">
          {chapters.map((c, i) => (
            <article className="story-panel" key={c.label}>
              <span className="kicker">
                0{i + 1} — {c.label}
              </span>
              <h2 className="display">
                {c.title[0]}
                <br />
                <em>{c.title[1]}</em>
              </h2>
              <p>{c.text}</p>
            </article>
          ))}
        </div>
        <div className="story-hint" aria-hidden="true">
          Seguí bajando <span>↓</span>
        </div>
        <nav className="story-rail" aria-label="Capítulos">
          <div className="story-bar">
            <i />
          </div>
          {chapters.map((c, i) => (
            <button key={c.label} onClick={() => goTo(i)} className={active === i ? 'is-active' : ''} aria-current={active === i ? 'step' : undefined}>
              <span>0{i + 1}</span>
              {c.label}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
