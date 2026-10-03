import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { navigation } from '../content';
import { reducedMotion } from '../lib/motion';

/** Título por renglones: cada renglón sube desde abajo de su propia máscara. */
export function Lines({ children, delay }: { children: React.ReactNode[]; delay?: number }) {
  return (
    <span data-lines data-delay={delay}>
      {children.map((line, i) => (
        <span className="line" key={i}>
          <span className="line-in">{line}</span>
        </span>
      ))}
    </span>
  );
}

/** Sello circular con texto que gira. */
export function Stamp({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <span className="stamp" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <path id="stamp-circle" d="M100 100 m-78 0 a78 78 0 1 1 156 0 a78 78 0 1 1 -156 0" />
        </defs>
        <text>
          <textPath href="#stamp-circle" textLength="482">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="stamp-core">{children ? <span>{children}</span> : <ArrowUpRight />}</span>
    </span>
  );
}

export function Tape({ words, tilt = -2, reverse = false, tone = 'yellow' }: { words: string[]; tilt?: number; reverse?: boolean; tone?: 'yellow' | 'ink' }) {
  const run = [...words, ...words, ...words, ...words];
  return (
    <div className={`tape tape-${tone}`} style={{ rotate: `${tilt}deg` }} aria-hidden="true">
      <div className={`tape-track ${reverse ? 'is-reverse' : ''}`}>
        {[0, 1].map(copy => (
          <div className="tape-run" key={copy}>
            {run.map((word, i) => (
              <span key={i}>
                {word} <i>✺</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Header({ contact }: { contact: () => void }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const root = menu.current!;
    document.body.style.overflow = 'hidden';
    const intro = reducedMotion()
      ? null
      : animate(root.querySelectorAll('.menu-link span'), {
          y: ['110%', '0%'],
          rotate: [6, 0],
          delay: stagger(60, { start: 120 }),
          duration: 800,
          ease: 'outExpo',
        });
    const keys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === 'Tab') {
        const nodes = [toggle.current!, ...root.querySelectorAll<HTMLElement>('a,button')];
        const index = nodes.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && index <= 0) {
          e.preventDefault();
          nodes.at(-1)?.focus();
        } else if (!e.shiftKey && index === nodes.length - 1) {
          e.preventDefault();
          nodes[0].focus();
        }
      }
    };
    document.addEventListener('keydown', keys);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', keys);
      intro?.revert();
    };
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <header className={`nav ${open ? 'is-open' : ''}`}>
        <Link to="/" className="nav-logo" aria-label="La Revuelta, inicio">
          <img src="/logo.png" alt="La Revuelta" width="258" height="57" />
        </Link>
        <nav className="nav-links" aria-label="Navegación principal">
          {navigation.map(item => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn btn-yellow nav-cta" onClick={contact}>
          Hablemos <ArrowUpRight size={18} />
        </button>
        <button
          ref={toggle}
          className="nav-burger"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="menu"
        >
          <i />
          <i />
        </button>
      </header>
      {open && (
        <div id="menu" className="menu" ref={menu} role="dialog" aria-modal="true" aria-label="Navegación">
          <nav>
            {[{ to: '/', label: 'Inicio' }, ...navigation].map((item, i) => (
              <Link className="menu-link" to={item.to} key={item.to} onClick={() => setOpen(false)}>
                <small>0{i + 1}</small>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <button
            className="btn btn-ink"
            onClick={() => {
              setOpen(false);
              contact();
            }}
          >
            Hagamos una revuelta <ArrowUpRight size={18} />
          </button>
        </div>
      )}
    </>
  );
}

export function CTA({ contact }: { contact: () => void }) {
  return (
    <section className="cta">
      <Tape words={['Hagamos una revuelta', 'Vamos posta']} tilt={0} tone="ink" />
      <div className="cta-body">
        <h2 className="display">
          <Lines>
            {[
              'Llevemos tu',
              'empresa al',
              <>
                <em>siguiente nivel.</em>
              </>,
            ]}
          </Lines>
        </h2>
        <div className="cta-side" data-reveal>
          <p>Tenés un sueño. Nosotros, la obsesión por hacerlo crecer.</p>
          <button className="cta-button" onClick={contact} aria-label="Contactar con La Revuelta">
            <Stamp text="HABLEMOS HOY · HABLEMOS HOY · HABLEMOS HOY · " />
          </button>
        </div>
        <img className="cta-character" src="/images/generated/character.webp" alt="" loading="lazy" data-parallax="-40" />
      </div>
    </section>
  );
}

export function Footer({ contact }: { contact: () => void }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <p>
          Marketing para los que apuestan
          <br />a la creación de un mundo mejor.
        </p>
        <nav aria-label="Navegación del pie">
          {navigation.map(item => (
            <Link to={item.to} key={item.to}>
              {item.label}
            </Link>
          ))}
          <button onClick={contact}>Contacto</button>
        </nav>
      </div>
      <Link to="/" className="footer-word" aria-label="La Revuelta, inicio">
        <span>la</span>
        <span>re</span>
        <span className="footer-flip">vuelta</span>
      </Link>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} La Revuelta. Todos los derechos reservados.</span>
        <a href="https://www.aftercode.dev/" target="_blank" rel="noreferrer">
          Sitio original por Aftercode ↗
        </a>
      </div>
    </footer>
  );
}

export function ContactDialog({ open, close }: { open: boolean; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const email = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? 'hola@larevuelta.example';
  const phone = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined) ?? '5491100000000';

  useEffect(() => {
    const d = dialog.current!;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    setCopied(false);
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="contact"
      onClose={close}
      onClick={e => e.target === dialog.current && close()}
    >
      <button onClick={close} className="contact-close" aria-label="Cerrar contacto">
        <X />
      </button>
      <span className="kicker">Hagamos que pase</span>
      <h2 className="display">
        ¿Cuál es tu
        <br />
        <em>próxima revuelta?</em>
      </h2>
      <p>Contanos sobre tu empresa y lo que querés transformar.</p>
      <a className="btn btn-ink" href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
        Escribinos por WhatsApp <ArrowUpRight size={18} />
      </a>
      <div className="contact-email">
        <a href={`mailto:${email}`}>{email}</a>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(email);
            setCopied(true);
          }}
        >
          {copied ? <Check size={16} /> : 'Copiar'}
        </button>
      </div>
    </dialog>
  );
}
