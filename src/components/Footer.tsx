import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Linkedin, Instagram, Facebook, Twitter, Youtube, Send } from 'lucide-react';
import Logo from './Logo';
import { useT, useSection } from '../lib/content';

type SocialLink = { key: string; Icon: typeof Linkedin; label: string };

const SOCIAL_DEFS: SocialLink[] = [
  { key: 'linkedin', Icon: Linkedin, label: 'LinkedIn' },
  { key: 'instagram', Icon: Instagram, label: 'Instagram' },
  { key: 'facebook', Icon: Facebook, label: 'Facebook' },
  { key: 'twitter', Icon: Twitter, label: 'Twitter' },
  { key: 'youtube', Icon: Youtube, label: 'YouTube' },
  { key: 'tiktok', Icon: Send, label: 'TikTok' },
];

export default function Footer() {
  const t = useT();
  const showNewsletter = useSection('footer.newsletter');
  const showSocial = useSection('footer.social');
  const copyright = t('footer.legal.copyright').replace('{year}', String(new Date().getFullYear()));

  const socials = SOCIAL_DEFS
    .filter((s) => t(`social.${s.key}.show`, 'false') === 'true')
    .map((s) => ({ ...s, url: t(`social.${s.key}.url`, '') }))
    .filter((s) => s.url);

  return (
    <footer className="bg-navy-900 text-white/70">
      {showNewsletter && (
        <div className="bg-navy-800 border-b border-white/5">
          <div className="container-px py-14 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>{t('footer.newsletter.eyebrow')}</div>
              <h3 className="mt-3 font-display text-3xl md:text-4xl text-white">{t('footer.newsletter.title')}</h3>
              <p className="mt-3 text-white/60 max-w-md">{t('footer.newsletter.description')}</p>
            </div>
            <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder={t('footer.newsletter.placeholder')} className="flex-1 bg-white/5 border border-white/15 px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-crimson"/>
              <button className="btn-primary"><Send size={14}/>{t('footer.newsletter.button')}</button>
            </form>
          </div>
        </div>
      )}

      <div className="container-px py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div>
          <Logo variant="light" placement="footer" />
          <p className="mt-6 text-sm leading-relaxed">{t('footer.tagline')}</p>
          {showSocial && socials.length > 0 && (
            <div className="flex gap-3 mt-6">
              {socials.map(({ key, Icon, url, label }) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-10 h-10 border border-white/15 flex items-center justify-center hover:border-crimson hover:bg-crimson hover:text-white transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-white font-display text-lg mb-5">{t('footer.explore.title')}</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/properties" className="hover:text-crimson-200 transition-colors">{t('global.nav.properties')}</Link></li>
            <li><Link to="/developers" className="hover:text-crimson-200 transition-colors">{t('global.nav.developers')}</Link></li>
            <li><Link to="/insights" className="hover:text-crimson-200 transition-colors">{t('global.nav.insights')}</Link></li>
            <li><Link to="/about" className="hover:text-crimson-200 transition-colors">{t('global.nav.about')}</Link></li>
            <li><Link to="/contact" className="hover:text-crimson-200 transition-colors">{t('global.nav.contact')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-display text-lg mb-5">{t('footer.locations.title')}</h4>
          <ul className="space-y-3 text-sm">
            <li>{t('footer.locations.1')}</li>
            <li>{t('footer.locations.2')}</li>
            <li>{t('footer.locations.3')}</li>
            <li>{t('footer.locations.4')}</li>
            <li>{t('footer.locations.5')}</li>
            <li>{t('footer.locations.6')}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-display text-lg mb-5">{t('footer.contact.title')}</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3"><MapPin size={16} className="text-crimson mt-1 shrink-0"/>{t('footer.contact.address')}</li>
            <li className="flex gap-3"><Phone size={16} className="text-crimson shrink-0"/>{t('footer.contact.phone')}</li>
            <li className="flex gap-3"><Mail size={16} className="text-crimson shrink-0"/>{t('footer.contact.email')}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-px py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <span>{copyright}</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/admin/login" className="hover:text-white">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
