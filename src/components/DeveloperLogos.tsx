import { useT } from '../lib/content';

export type DeveloperLogo = { name: string; img: string; url: string };

export function useDeveloperLogos(): DeveloperLogo[] {
  const t = useT();
  const out: DeveloperLogo[] = [];
  for (let i = 1; i <= 12; i++) {
    const name = t(`developers.logo.${i}.name`, '');
    const img = t(`developers.logo.${i}.img`, '');
    const url = t(`developers.logo.${i}.url`, '');
    if (name || img) out.push({ name, img, url });
  }
  return out;
}

export function DeveloperLogo({ logo, className = 'h-10' }: { logo: DeveloperLogo; className?: string }) {
  if (logo.img) {
    return (
      <img
        src={logo.img}
        alt={logo.name || 'Developer logo'}
        className={`${className} w-auto object-contain opacity-70 hover:opacity-100 transition-opacity`}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`${className} flex items-center font-display tracking-[0.3em] text-lg uppercase text-navy/70`}>{logo.name}</div>
  );
}
