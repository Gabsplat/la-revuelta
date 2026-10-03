import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { animate, onScroll, splitText, utils } from 'animejs';
import { Lines, Stamp, Tape } from './Chrome';
import { ClientCards } from './Pages';
import Story from './Story';
import { phases } from '../content';
import { reducedMotion } from '../lib/motion';

function Hero({ contact }: { contact: () => void }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const el = root.current!;
    const leaving = () => onScroll({ target: el, enter: 'top top', leave: 'top bottom', sync: 0.3 });
    // "Rompemos estructuras": al bajar, la palabra se desarma letra por letra.
    const split = splitText(el.querySelector<HTMLElement>('.hero-break')!, { chars: true });
    const live = [
      animate(split.chars, {
        y: () => utils.random(60, 420),
        x: () => utils.random(-60, 60),
        rotate: () => utils.random(-80, 80),
        ease: 'inQuad',
        autoplay: leaving(),
      }),
      animate(el.querySelector('.hero-image')!, { scale: [1, 1.5], ease: 'linear', autoplay: leaving() }),
      animate(el.querySelector('.hero-foot')!, { opacity: [1, 0], duration: 400, ease: 'linear', autoplay: leaving() }),
    ];
    return () => {
      live.forEach(a => a.revert());
      split.revert();
    };
  }, []);

  return (
    <section className="hero" ref={root}>
      <div className="hero-image" role="img" aria-label="Una oficina iluminada en amarillo entre los edificios de una ciudad" />
      <div className="hero-shade" />
      <div className="hero-body">
        <h1 className="display">
          <Lines delay={250}>
            {[
              'Rompemos',
              <span className="hero-break">estructuras,</span>,
              'redefinimos',
              <em>estándares.</em>,
            ]}
          </Lines>
        </h1>
      </div>
      <div className="hero-foot">
        <p data-reveal data-delay="600">
          Buscamos ayudar con <strong>marketing</strong> a los que apuestan a la creación de <strong>un mundo mejor.</strong>
        </p>
        <button className="btn btn-yellow" onClick={contact} data-reveal data-delay="700">
          Hagamos una revuelta <ArrowUpRight size={18} />
        </button>
        <a href="#manifiesto" className="hero-scroll" data-reveal data-delay="800">
          <ArrowDown size={16} /> Bajá
        </a>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="manifesto" id="manifiesto">
      <div className="manifesto-text">
        <span className="kicker" data-reveal>
          Nuestra forma de ver
        </span>
        <p className="manifesto-fill" data-fill>
          Nos obsesionamos con entender tu negocio. Comprendemos tu sueño y, a través del marketing, buscamos que tu
          empresa aporte cada vez más valor al mundo.
        </p>
        <Link to="/que-nos-inspira" className="link" data-reveal>
          Conocé lo que nos inspira <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="manifesto-world">
        <div className="world-disc" />
        <img className="world" src="/images/comprendemos/world.webp" alt="El mundo, visto desde otra perspectiva" loading="lazy" data-spin="50" />
        <img className="cloud cloud-a" src="/images/comprendemos/white_cloud.webp" alt="" loading="lazy" data-parallax="-70" />
        <img className="cloud cloud-b" src="/images/comprendemos/white_cloud_2.webp" alt="" loading="lazy" data-parallax="90" />
        <Stamp text="COMPRENDEMOS TU SUEÑO · COMPRENDEMOS TU SUEÑO · ">✺</Stamp>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="process" id="proceso">
      <header className="section-head">
        <h2 className="display">
          <Lines>{['Nuestro proceso de', <><em>transformación</em> de tu empresa</>]}</Lines>
        </h2>
        <Link to="/proceso-transformacion" className="link" data-reveal>
          Ver el proceso completo <ArrowUpRight size={18} />
        </Link>
      </header>
      <div className="stack">
        {phases.map((phase, i) => (
          <Link
            to={`/proceso-transformacion#fase-${i + 1}`}
            className={`stack-card tone-${i % 2 ? 'yellow' : 'ink'}`}
            style={{ '--i': i } as React.CSSProperties}
            key={phase.name}
          >
            <div className="stack-head">
              <span className="stack-number">{i + 1}</span>
              <h3 className="display">{phase.name}</h3>
              <span className="stack-duration">{phase.duration}</span>
              <span className="round">
                <ArrowUpRight />
              </span>
            </div>
            <div className="stack-body">
              <div>
                <h4>{phase.title}</h4>
                <p>{phase.description}</p>
                <ul>
                  {phase.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="stack-art">
                <img src={`/images/transformation/${phase.image}.webp`} alt="" loading="lazy" data-spin={i === 0 ? 120 : i === 1 ? 0 : -14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home({ contact }: { contact: () => void }) {
  return (
    <>
      <Hero contact={contact} />
      <div className="tapes">
        <Tape words={['Menos de lo mismo', 'Más de lo que importa']} tilt={-2.5} />
        <Tape words={['Rompemos estructuras', 'Redefinimos estándares']} tilt={2} reverse tone="ink" />
      </div>
      <Manifesto />
      <Process />
      <div className="story-intro">
        <span className="kicker" data-reveal>
          Conocé nuestra filosofía
        </span>
        <h2 className="display">
          <Lines>{['Por qué hacemos', <em>lo que hacemos.</em>]}</Lines>
        </h2>
      </div>
      <Story />
      <ClientCards home />
    </>
  );
}
