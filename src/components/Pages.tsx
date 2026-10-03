import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Lines, Tape } from './Chrome';
import Story from './Story';
import { cases, inspirations, phases, type Block } from '../content';

export function PageHero({ index, title, accent, description, image }: { index: string; title: string; accent: string; description: string; image: string }) {
  return (
    <section className="page-hero">
      <div className="page-hero-head">
        <span className="kicker" data-reveal>
          {index}
        </span>
        <h1 className="display">
          <Lines delay={200}>{[title, <em>{accent}</em>]}</Lines>
        </h1>
        <p data-reveal data-delay="500">
          {description}
        </p>
      </div>
      <div className="page-hero-band" data-reveal data-delay="350">
        <img src={image} alt="" data-parallax="-50" />
      </div>
    </section>
  );
}

export function ClientCards({ home = false }: { home?: boolean }) {
  return (
    <section className="clients" id="contenido">
      <header className="section-head">
        <h2 className="display">
          <Lines>{['Ideas que mueven.', <em>Resultados que se ven.</em>]}</Lines>
        </h2>
        {home && (
          <Link className="link" to="/clientes" data-reveal>
            Todos los clientes <ArrowUpRight size={18} />
          </Link>
        )}
      </header>
      <div className="client-grid">
        {cases.map((c, i) => (
          <Link to={`/clientes/${c.slug}`} key={c.slug} className="client-card" data-reveal data-delay={i * 120}>
            <div className="client-picture">
              <img src={`/images/clientes/${c.slug}-banner.webp`} alt={c.alt} loading="lazy" />
              <img src={`/images/clientes/${c.slug}-logo.svg`} className="client-logo" alt="" />
              <span className="round">
                <ArrowUpRight />
              </span>
            </div>
            <div className="client-info">
              <div>
                <span className="kicker">{c.category}</span>
                <h3 className="display">{c.name}</h3>
                <span className="client-period">{c.period}</span>
              </div>
              <div className="client-stat">
                <strong data-count={c.stats[1][0]}>{c.stats[1][0]}</strong>
                <span>{c.stats[1][1]}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const isHeading = (b: Block) =>
  b.tag.startsWith('H') ||
  b.text === 'Entregables' ||
  b.text.startsWith('Etapa ') ||
  b.text === 'Desarrollo de Plan de acción inmediato' ||
  b.text.startsWith('Redefine tus');
const isNote = (b: Block) =>
  b.text.startsWith('En esta etapa') || b.text.startsWith('El único límite') || b.text === b.text.toUpperCase();

function ContentBlocks({ blocks }: { blocks: Block[] }) {
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.tag === 'LI') {
      const items = [b.text];
      while (blocks[i + 1]?.tag === 'LI') items.push(blocks[++i].text);
      nodes.push(
        <ul key={i} className="prose-list">
          {items.map(text => (
            <li key={text}>{text}</li>
          ))}
        </ul>,
      );
    } else if (isHeading(b)) {
      nodes.push(
        <h3 key={i} className={b.text === 'Entregables' ? 'prose-tag' : ''}>
          {b.text}
        </h3>,
      );
    } else {
      nodes.push(
        <p key={i} className={isNote(b) ? 'prose-note' : ''}>
          {b.text}
        </p>,
      );
    }
  }
  return <div className="prose">{nodes}</div>;
}

export function Inspiration() {
  return (
    <>
      <PageHero
        index="01 — Qué nos inspira"
        title="Los que rompen"
        accent="el molde."
        description="Desde los rebeldes del deporte hasta los visionarios de la música y el arte, nos inspiran quienes rompen moldes, cambian las reglas y transforman lo cotidiano en algo extraordinario."
        image="/hero/inspiracion.webp"
      />
      <section className="muses" id="contenido">
        {inspirations.map((muse, i) => (
          <article className={`muse muse-${i + 1}`} key={muse.name}>
            <div className="muse-media" data-reveal>
              <img className="muse-image" src={`/images/que-nos-inspira/${muse.image}.webp`} alt={muse.alt} loading="lazy" />
              {i === 1 && <img className="muse-vinyl" src="/images/que-nos-inspira/vinyl.webp" alt="Disco de vinilo de The Beatles" loading="lazy" data-spin="300" />}
            </div>
            <div className="muse-text">
              <span className="muse-number" data-reveal>
                0{i + 1}
              </span>
              <span className="kicker" data-reveal>
                {muse.tag}
              </span>
              <h2 className="display">
                <Lines>{[muse.name]}</Lines>
              </h2>
              <p data-reveal>{muse.text}</p>
            </div>
          </article>
        ))}
      </section>
      <div className="tapes tapes-single">
        <Tape words={['Cambiar las reglas', 'Crear un movimiento', 'Darle voz a una generación']} tilt={-1.5} />
      </div>
    </>
  );
}

export function ProcessPage() {
  return (
    <>
      <PageHero
        index="02 — Proceso de transformación"
        title="Entender, potenciar,"
        accent="ir más allá."
        description="Conocé cómo llevamos a tu empresa al siguiente nivel. Desde un diagnóstico profundo hasta la creación de estrategias innovadoras, te acompañamos en cada etapa para alcanzar el éxito y más allá."
        image="/hero/transformacion.webp"
      />
      <div className="phases" id="contenido">
        <nav className="phase-nav" aria-label="Etapas del proceso" data-reveal>
          {phases.map((phase, i) => (
            <a key={phase.name} href={`#fase-${i + 1}`}>
              <span>{i + 1}</span>
              {phase.name}
            </a>
          ))}
        </nav>
        {phases.map((phase, i) => (
          <section className="phase" id={`fase-${i + 1}`} key={phase.name}>
            <header className={`phase-head tone-${i % 2 ? 'yellow' : 'ink'}`}>
              <div>
                <span className="stack-number">{i + 1}</span>
                <h2 className="display">
                  <Lines>{[phase.name]}</Lines>
                </h2>
                <p>
                  <strong>Duración:</strong> {phase.duration}
                  <br />
                  {phase.title}
                </p>
              </div>
              <img src={`/images/transformation/${phase.image}.webp`} alt="" loading="lazy" data-spin={i === 0 ? 140 : i === 1 ? 0 : -14} />
            </header>
            <div className="phase-body" data-reveal>
              <p className="phase-lead">{phase.description}</p>
              <ContentBlocks blocks={phase.blocks} />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export function Philosophy() {
  return (
    <>
      <PageHero
        index="03 — Nuestra filosofía"
        title="Más valor,"
        accent="un mundo mejor."
        description="Conocé nuestra filosofía y los valores que nos impulsan a ofrecer lo mejor."
        image="/hero/filosofia.webp"
      />
      <div id="contenido">
        <Story />
      </div>
    </>
  );
}

export function ClientsPage() {
  return (
    <>
      <PageHero
        index="04 — Clientes"
        title="Cada empresa,"
        accent="una revuelta."
        description="Desde un diagnóstico profundo hasta la ejecución de estrategias innovadoras, nuestros clientes alcanzaron sus objetivos y superaron sus expectativas. Ahora es tu turno."
        image="/hero/clientes.webp"
      />
      <ClientCards />
    </>
  );
}

export function CaseStudy({ slug }: { slug: string }) {
  const c = cases.find(item => item.slug === slug)!;
  const other = cases.find(item => item.slug !== slug)!;
  const sections: { heading: string; blocks: Block[] }[] = [];
  c.data.blocks.forEach(b => {
    if (b.tag === 'H2') sections.push({ heading: b.text, blocks: [] });
    else sections.at(-1)?.blocks.push(b);
  });

  return (
    <article className="case" id="contenido">
      <header className="case-head">
        <Link to="/clientes" className="link" data-reveal>
          <ArrowLeft size={16} /> Todos los clientes
        </Link>
        <span className="kicker" data-reveal>
          {c.category} · {c.period}
        </span>
        <h1 className="display">
          <Lines delay={150}>{[c.name]}</Lines>
        </h1>
        <p data-reveal data-delay="350">
          {c.data.intro}
        </p>
      </header>
      <div className="case-banner" data-reveal>
        <img src={`/images/clientes/${c.slug}-banner.webp`} alt={c.alt} data-parallax="-40" />
        <img src={`/images/clientes/${c.slug}-logo.svg`} alt="" className="case-logo" />
      </div>
      <div className="case-stats">
        {c.stats.map(([value, label], i) => (
          <div key={value} data-reveal data-delay={i * 100}>
            <strong className="display" data-count={value}>
              {value}
            </strong>
            <p>{label}</p>
          </div>
        ))}
      </div>
      {sections.map((section, i) => (
        <section key={section.heading} className="case-section">
          <div className="case-aside">
            <span className="kicker">{i === 0 ? 'El desafío' : `Etapa ${i}`}</span>
            <h2 className="display">
              <Lines>{[section.heading.replace(/^Etapa \d /, '')]}</Lines>
            </h2>
          </div>
          <div data-reveal>
            <ContentBlocks blocks={section.blocks} />
            {i === 1 && (
              <div className="share">
                <div className="share-donut" style={{ '--share': `${c.share}%` } as React.CSSProperties}>
                  <span>
                    <strong data-count={`${c.share}%`}>{c.share}%</strong>
                    <small>{c.shareLabel}</small>
                  </span>
                </div>
                <p>
                  <i /> {c.name}
                  <br />
                  <i className="is-rest" /> Resto del mercado
                </p>
              </div>
            )}
            {i === 2 && c.slug === 'ipc' && (
              <img className="case-image" src="/images/clientes/ipc/diadepileta.webp" alt="Campaña del Día de la Pileta de IPC Pools" loading="lazy" />
            )}
            {i === 2 && c.slug === 'nutriterra' && (
              <div className="case-gallery">
                <img src="/images/clientes/nutriterra/bannerlimon.webp" alt="Campaña de Nutriterra para productores de limón" loading="lazy" />
                <img src="/images/clientes/nutriterra/portalnutriterra.webp" alt="Portal de contenidos de Nutriterra" loading="lazy" />
              </div>
            )}
          </div>
        </section>
      ))}
      <Link to={`/clientes/${other.slug}`} className="case-next">
        <span className="kicker">Siguiente revuelta</span>
        <strong className="display">{other.name}</strong>
        <span className="round">
          <ArrowUpRight />
        </span>
      </Link>
    </article>
  );
}

export function NotFound() {
  return (
    <section className="not-found">
      <span className="kicker">404 — Por acá todavía no</span>
      <h1 className="display">
        Volvamos a<br />
        <em>dar la vuelta.</em>
      </h1>
      <Link to="/" className="btn btn-yellow">
        Ir al inicio <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
