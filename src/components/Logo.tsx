import { Link } from 'react-router-dom';
import { useT } from '../lib/content';

type Props = { variant?: 'light' | 'dark'; placement?: 'header' | 'footer' };

export default function Logo({ variant = 'light', placement = 'header' }: Props) {
  const t = useT();
  const src = t(placement === 'footer' ? 'global.logo.footer' : 'global.logo.header', '/karimi-logo_copy.png');
  const brand = t('global.brand.name', 'Karimi Real Estate');
  return (
    <Link to="/" className="flex items-center group" aria-label={brand}>
      <div className={`${variant === 'light' ? 'bg-white' : 'bg-white'} p-1.5 rounded-sm transition-transform group-hover:scale-105 shadow-md`}>
        <img src={src} alt={brand} className="h-10 md:h-12 w-auto block" />
      </div>
    </Link>
  );
}
