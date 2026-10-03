import { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { animate } from 'animejs';
import { CTA, ContactDialog, Footer, Header } from './components/Chrome';
import Home from './components/Home';
import { CaseStudy, ClientsPage, Inspiration, NotFound, Philosophy, ProcessPage } from './components/Pages';
import { titles } from './content';
import { reducedMotion, usePageMotion } from './lib/motion';

export default function App() {
  const location = useLocation();
  const [contact, setContact] = useState(false);
  const curtain = useRef<HTMLDivElement>(null);
  const openContact = () => setContact(true);
  usePageMotion(location.pathname);

  useEffect(() => {
    setContact(false);
    document.title = `La Revuelta · ${titles[location.pathname] ?? 'Página no encontrada'}`;
    if (location.hash) {
      const timeout = setTimeout(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'instant' }), 100);
      return () => clearTimeout(timeout);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  // Cortina amarilla que se levanta en cada cambio de página.
  useEffect(() => {
    if (reducedMotion()) return;
    const wipe = animate(curtain.current!, { y: ['0%', '-101%'], duration: 900, ease: 'inOutExpo' });
    return () => {
      wipe.revert();
    };
  }, [location.pathname]);

  return (
    <>
      <Header contact={openContact} />
      <main id="main" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home contact={openContact} />} />
          <Route path="/que-nos-inspira" element={<Inspiration />} />
          <Route path="/proceso-transformacion" element={<ProcessPage />} />
          <Route path="/nuestra-filosofia" element={<Philosophy />} />
          <Route path="/clientes" element={<ClientsPage />} />
          <Route path="/clientes/ipc" element={<CaseStudy slug="ipc" />} />
          <Route path="/clientes/nutriterra" element={<CaseStudy slug="nutriterra" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CTA contact={openContact} />
      </main>
      <Footer contact={openContact} />
      <ContactDialog open={contact} close={() => setContact(false)} />
      <div className="curtain" ref={curtain} aria-hidden="true" />
    </>
  );
}
