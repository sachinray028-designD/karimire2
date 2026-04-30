import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';
import { useT } from '../lib/content';
import { BookConsultationButton } from './ConsultationModal';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const t = useT();
  const NAV = [
    { to: '/', label: t('global.nav.home') },
    { to: '/properties', label: t('global.nav.properties') },
    { to: '/developers', label: t('global.nav.developers') },
    { to: '/insights', label: t('global.nav.insights') },
    { to: '/about', label: t('global.nav.about') },
    { to: '/contact', label: t('global.nav.contact') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const solid = scrolled || !isHome || open;

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block bg-navy-800 text-white/70 text-xs fixed top-0 inset-x-0 z-[60]">
        <div className="container-px h-9 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-crimson"/>{t('global.topbar.address')}</span>
            <span className="flex items-center gap-1.5"><Mail size={12} className="text-crimson"/>{t('global.topbar.email')}</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="tracking-[0.2em] uppercase text-[10px] text-crimson-200">{t('global.topbar.rera')}</span>
            <a href={`tel:${t('global.topbar.phone').replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-white"><Phone size={12}/>{t('global.topbar.phone')}</a>
          </div>
        </div>
      </div>

      <header
        className={`fixed md:top-9 top-0 inset-x-0 z-50 transition-all duration-500 ${
          solid ? 'bg-navy/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container-px flex items-center justify-between h-20">
          <Logo variant="light" />
          <nav className="hidden lg:flex items-center gap-9">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `text-[13px] tracking-[0.2em] uppercase font-medium transition-colors duration-300 relative ${
                    isActive ? 'text-crimson' : 'text-white/90 hover:text-crimson'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <BookConsultationButton source="Header" className="btn-primary !py-2.5 !px-5 text-xs">{t('global.nav.cta')}</BookConsultationButton>
          </div>
          <button className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden bg-navy border-t border-white/10 animate-fade-in">
            <div className="container-px py-6 flex flex-col gap-5">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="text-white text-lg font-display tracking-wide">{n.label}</Link>
              ))}
              <a href={`tel:${t('global.topbar.phone').replace(/\s/g, '')}`} className="text-white/80 text-sm flex items-center gap-2"><Phone size={15}/> {t('global.topbar.phone')}</a>
              <BookConsultationButton source="Mobile Menu" className="btn-primary justify-center">{t('global.nav.cta')}</BookConsultationButton>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
