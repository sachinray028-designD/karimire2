import { useReveal } from '../lib/useReveal';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDeveloperLogos, DeveloperLogo } from '../components/DeveloperLogos';
import { useT } from '../lib/content';
import { Seo } from '../lib/seo';
const DEV_META: { est: string; tag: string; desc: string; img: string }[] = [
  { est: '1997', tag: 'Master Developer', desc: 'Creator of Downtown Dubai, the Burj Khalifa, Dubai Mall, Dubai Marina and Dubai Hills Estate.', img: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=1400' },
  { est: '2002', tag: 'Luxury Branded', desc: 'Pioneers of branded residences with Versace, Roberto Cavalli, Paramount and de GRISOGONO.', img: 'https://images.pexels.com/photos/618079/pexels-photo-618079.jpeg?auto=compress&cs=tinysrgb&w=1400' },
  { est: '1976', tag: 'Vertically Integrated', desc: 'Renowned for uncompromising build quality across Sobha Hartland and Sobha Reserve.', img: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1400' },
  { est: '2005', tag: 'Ultra-Luxury Boutique', desc: 'Behind The Opus by Zaha Hadid, One Palm, The Bay and the Binary Tower.', img: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1400' },
  { est: '2000', tag: 'Master Developer', desc: 'Developer of Palm Jumeirah, Palm Jebel Ali, The World Islands and Dubai Islands.', img: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1400' },
  { est: '2007', tag: 'Lifestyle Destinations', desc: 'Developer of Bluewaters, City Walk, La Mer and a curated portfolio of lifestyle districts.', img: 'https://images.pexels.com/photos/3787485/pexels-photo-3787485.jpeg?auto=compress&cs=tinysrgb&w=1400' },
  { est: '2014', tag: 'Design-Led', desc: 'A design-driven developer behind DT1, Belgravia and Upper House, celebrated for finish quality.', img: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1400' },
  { est: '2002', tag: 'Waterfront Specialist', desc: 'Europe-grade waterfront towers including Marina Gate, Peninsula and the iconic The Residences.', img: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1400' },
  { est: '2008', tag: 'Architectural Identity', desc: 'Sculptural, instantly recognisable façades delivering strong rental yields across Dubai.', img: 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=1400' },
  { est: '2014', tag: 'Attainable Luxury', desc: 'Pioneer of the 1% monthly payment plan, one of Dubai\'s fastest delivery track records.', img: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1400' },
];

export default function Developers() {
  useReveal();
  const t = useT();
  const logos = useDeveloperLogos();
  const staticDevs = logos.slice(0, DEV_META.length).map((logo, i) => ({ logo, ...DEV_META[i] }));

  return (
    <>
      <Seo
        page="developers"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Developers', url: '/developers' }]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Dubai property developers represented by Karimi Real Estate',
          itemListElement: staticDevs.map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Organization',
              name: d.logo.name,
              url: d.logo.url || undefined,
              foundingDate: d.est,
              description: d.desc,
            },
          })),
        }}
      />
      <section className="pt-36 md:pt-44 pb-16 md:pb-20 bg-navy text-white relative overflow-hidden">
        <img loading="lazy" src={t('developers.hero.bg')} className="absolute inset-0 w-full h-full object-cover opacity-15" alt=""/>
        <div className="container-px relative max-w-4xl">
          <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>{t('developers.hero.eyebrow')}</div>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl md:text-7xl">{t('developers.hero.title1')}<br/><span className="italic text-crimson-100">{t('developers.hero.title2')}</span></h1>
          <p className="mt-6 text-white/70 text-base md:text-lg max-w-2xl">{t('developers.hero.description')}</p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-px mb-12 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-navy">
            The Dubai developers we hold direct allocations with
          </h2>
          <p className="mt-4 text-navy/65 leading-relaxed">
            Track record matters more than a brochure. Each partner below is listed with its founding
            year, specialism and signature delivery, so you can weigh build quality and handover history
            before committing to an off-plan purchase. Browse the{' '}
            <Link to="/properties" className="text-crimson underline underline-offset-4">
              full Dubai property portfolio
            </Link>{' '}
            or read our{' '}
            <Link to="/insights" className="text-crimson underline underline-offset-4">
              off-plan buyer protection guides
            </Link>{' '}
            first.
          </p>
        </div>
        <div className="container-px grid sm:grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 reveal">
          {staticDevs.map(({ logo, est, tag, desc, img }) => (
            <div key={logo.name} className="group bg-white border border-navy/10 overflow-hidden hover-lift grid grid-cols-1 sm:grid-cols-5">
              <div className="sm:col-span-2 aspect-video sm:aspect-square relative overflow-hidden">
                <img loading="lazy" src={img} alt={logo.name} className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"/>
                <div className="absolute inset-0 bg-navy/40"/>
              </div>
              <div className="sm:col-span-3 p-6 md:p-7 flex flex-col justify-between">
                <div>
                  <div className="text-navy h-10 flex items-center"><DeveloperLogo logo={logo} className="h-7"/></div>
                  <div className="mt-3 flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-navy/60">
                    <span className="text-crimson">{tag}</span><span>Est. {est}</span>
                  </div>
                  <h3 className="font-display text-xl text-navy mt-3">{logo.name}</h3>
                  <p className="mt-3 text-navy/60 text-sm leading-relaxed">{desc}</p>
                </div>
                <Link
                  to={`/properties?developer=${encodeURIComponent(logo.name)}`}
                  className="mt-5 text-navy font-medium flex items-center gap-2 group/l text-sm hover:text-crimson transition-colors"
                >
                  View {logo.name} projects in Dubai
                  <ArrowRight size={15} className="transition-transform group-hover/l:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
