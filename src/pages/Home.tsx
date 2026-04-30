import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Handshake, Compass, TrendingUp, Award, Users, Star, Quote, Gem, KeyRound, Briefcase, Globe, ChevronLeft, ChevronRight, Search, Phone, CalendarDays } from 'lucide-react';
import { supabase, type Property, type Testimonial, type BlogPost } from '../lib/supabase';
import { useReveal } from '../lib/useReveal';
import PropertyCard from '../components/PropertyCard';
import RoiCalculator from '../components/RoiCalculator';
import Faq from '../components/Faq';
import { useDeveloperLogos, DeveloperLogo } from '../components/DeveloperLogos';
import { useT, useSection } from '../lib/content';
import { Seo } from '../lib/seo';
import { BookConsultationButton } from '../components/ConsultationModal';

const AWARDS = [
  { label: 'Property Finder', year: '2024 Elite Agent' },
  { label: 'Bayut', year: 'Top Broker 2024' },
  { label: 'Dubai Land Department', year: 'RERA Certified' },
  { label: 'Arabian Business', year: 'Firm to Watch' },
  { label: 'Forbes Middle East', year: 'Featured Advisory' },
];

function useCount(target: number, active: boolean, duration = 1800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return v;
}

type Stat = { label: string; value: number; suffix: string };

function StatItem({ s, active }: { s: Stat; active: boolean }) {
  const v = useCount(s.value, active);
  const display = s.value < 10 ? v.toFixed(1) : Math.floor(v).toLocaleString();
  return (
    <div className="text-center border-r border-white/10 last:border-r-0 px-4">
      <div className="font-display text-3xl md:text-5xl text-white">{display}<span className="text-crimson">{s.suffix}</span></div>
      <div className="mt-2 text-[10px] tracking-[0.3em] uppercase text-white/60">{s.label}</div>
    </div>
  );
}

export default function Home() {
  useReveal();
  const t = useT();
  const devLogos = useDeveloperLogos();
  const nav = useNavigate();
  const show = {
    hero: useSection('home.hero'),
    marquee: useSection('home.marquee'),
    stats: useSection('home.stats'),
    developers: useSection('home.developers'),
    portfolio: useSection('home.portfolio'),
    doctrine: useSection('home.doctrine'),
    why: useSection('home.why'),
    locations: useSection('home.locations'),
    process: useSection('home.process'),
    roi: useSection('home.roi'),
    visa: useSection('home.visa'),
    testimonials: useSection('home.testimonials'),
    awards: useSection('home.awards'),
    personas: useSection('home.personas'),
    insights: useSection('home.insights'),
    faq: useSection('home.faq'),
    cta: useSection('home.cta'),
  };
  const LOCATIONS = [1, 2, 3, 4, 5, 6].map((i) => ({
    name: t(`home.locations.${i}.name`),
    tag: t(`home.locations.${i}.tag`),
    img: t(`home.locations.${i}.img`),
    yield: t(`home.locations.${i}.yield`),
    stat: t(`home.locations.${i}.stat`),
  }));
  const STATS: Stat[] = [1, 2, 3, 4].map((i) => ({
    label: t(`home.stats.${i}.label`),
    value: parseFloat(t(`home.stats.${i}.value`)) || 0,
    suffix: t(`home.stats.${i}.suffix`),
  }));
  const [featured, setFeatured] = useState<Property[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [statsActive, setStatsActive] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const [search, setSearch] = useState({ location: '', type: '', budget: '', status: '' });

  function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.location) params.set('q', search.location);
    if (search.type) params.set('type', search.type);
    if (search.status) params.set('status', search.status);
    if (search.budget) params.set('budget', search.budget);
    nav(`/properties?${params.toString()}`);
  }

  useEffect(() => {
    supabase.from('properties').select('*').eq('active', true).eq('featured', true).limit(6).then(({ data }) => setFeatured(data || []));
    supabase.from('testimonials').select('*').eq('active', true).then(({ data }) => setTestimonials(data || []));
    supabase.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false }).limit(3).then(({ data }) => setPosts(data || []));

    const io = new IntersectionObserver((e) => e[0].isIntersecting && setStatsActive(true), { threshold: 0.3 });
    const el = document.getElementById('stats-strip');
    if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Seo page="home" />
      {/* HERO — editorial oversized title over Dubai skyline */}
      {show.hero && <section className="relative h-screen min-h-[560px] w-full overflow-hidden flex flex-col">
        <img src={t('home.hero.bg')} alt="Dubai" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy/25 to-navy/75"/>

        {/* Vertical label on the left */}
        <div className="hidden lg:flex absolute left-6 xl:left-10 top-1/2 -translate-y-1/2 flex-col items-center gap-3 text-white/85 tracking-[0.45em] text-[10px] uppercase z-10">
          {t('home.hero.vertical').split(' ').map((w, i) => (
            <span key={i} style={{ writingMode: 'vertical-rl' }} className="rotate-180">{w}</span>
          ))}
        </div>

        {/* Centered content — fills the viewport */}
        <div className="relative flex-1 flex flex-col justify-center items-center pt-24 md:pt-28 pb-6 px-4 sm:px-8">
          <div className="w-full max-w-[1400px] text-center">
            <h1 className="font-display text-white leading-[1.05] animate-fade-up"
              style={{ fontSize: 'clamp(4.25rem, 14vw, 11.5rem)' }}>
              <span className="block">{t('home.hero.title')}</span>
              <span className="block mt-3 md:mt-5">{t('home.hero.title2')}</span>
            </h1>

            <div className="mt-6 md:mt-8 max-w-xl mx-auto animate-fade-up text-center" style={{ animationDelay: '0.15s' }}>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">{t('home.hero.description')}</p>
            </div>

            <div className="mt-6 md:mt-8 flex flex-wrap gap-3 sm:gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <BookConsultationButton source="Hero CTA" className="btn-ghost" icon={<CalendarDays size={14}/>}>
                {t('home.hero.cta1')}
              </BookConsultationButton>
              <a href={`tel:${t('global.topbar.phone').replace(/\s/g, '')}`} className="btn-ghost">
                <Phone size={14}/>{t('home.hero.cta2')}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom stats strip — compact so everything fits in viewport */}
        <div className="relative pb-5 md:pb-8 px-4 sm:px-8 md:px-12 animate-fade-up" style={{ animationDelay: '0.45s' }}>
          <div className="max-w-[1100px] mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:gap-x-12">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 md:-space-x-3 shrink-0">
                {[t('home.hero.avatar1'), t('home.hero.avatar2'), t('home.hero.avatar3')].map((a, i) => (
                  <img key={i} src={a} alt="" className="w-8 h-8 md:w-11 md:h-11 rounded-full object-cover border-2 border-white/70 shadow-lg"/>
                ))}
              </div>
              <div className="text-white leading-tight text-left">
                <div className="font-display text-lg md:text-xl">{t('home.hero.stat1.n')}</div>
                <div className="text-white/80 text-[10px] md:text-xs">{t('home.hero.stat1.l')}</div>
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-white/20"/>
            <div className="text-center text-white">
              <div className="font-display text-2xl md:text-3xl">{t('home.hero.stat2.n')}</div>
              <div className="mt-0.5 text-white/80 text-[10px] md:text-xs">{t('home.hero.stat2.l')}</div>
            </div>
            <div className="hidden md:block w-px h-10 bg-white/20"/>
            <div className="text-center text-white">
              <div className="font-display text-2xl md:text-3xl">{t('home.hero.stat3.n')}</div>
              <div className="mt-0.5 text-white/80 text-[10px] md:text-xs">{t('home.hero.stat3.l')}</div>
            </div>
          </div>
        </div>

        {/* Hidden search form (still functional via URL params) */}
        <form onSubmit={runSearch} className="hidden">
          <input value={search.location} onChange={(e) => setSearch({ ...search, location: e.target.value })}/>
          <select value={search.type} onChange={(e) => setSearch({ ...search, type: e.target.value })}><option/></select>
          <select value={search.budget} onChange={(e) => setSearch({ ...search, budget: e.target.value })}><option/></select>
          <select value={search.status} onChange={(e) => setSearch({ ...search, status: e.target.value })}><option/></select>
          <button type="submit"><Search/></button>
        </form>
      </section>}

      {/* ANNOUNCEMENT BAR */}
      {show.marquee && <div className="bg-crimson text-white py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-16 text-[11px] tracking-[0.3em] uppercase">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-16">
              <span>{t('home.marquee.1')}</span>
              <Gem size={12}/>
              <span>{t('home.marquee.2')}</span>
              <Gem size={12}/>
              <span>{t('home.marquee.3')}</span>
              <Gem size={12}/>
              <span>{t('home.marquee.4')}</span>
              <Gem size={12}/>
            </span>
          ))}
        </div>
      </div>}

      {/* STATS STRIP */}
      {show.stats && <section id="stats-strip" className="bg-navy py-8 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}/>
        <div className="container-px grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative">
          {STATS.map((s) => <StatItem key={s.label} s={s} active={statsActive} />)}
        </div>
      </section>}

      {/* DEVELOPER STRIP */}
      {show.developers && <section className="py-10 md:py-14 bg-white overflow-hidden border-b border-navy/5">
        <div className="container-px text-center mb-8 md:mb-10 reveal">
          <div className="eyebrow justify-center"><span className="w-8 h-px bg-crimson"/>{t('home.devstrip.eyebrow')}</div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-navy mt-3">{t('home.devstrip.title')}</h2>
          <p className="text-navy/60 mt-2 md:mt-3 max-w-xl mx-auto text-sm md:text-base">{t('home.devstrip.description')}</p>
        </div>
        <div className="relative">
          <div className="flex gap-20 animate-marquee whitespace-nowrap">
            {[...devLogos, ...devLogos].map((logo, i) => (
              <div key={i} className="shrink-0">
                <DeveloperLogo logo={logo} className="h-10" />
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent"/>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent"/>
        </div>
      </section>}

      {/* SIGNATURE MOSAIC */}
      {show.portfolio && <section className="py-12 md:py-20 bg-gradient-to-b from-navy-50/40 to-white">
        <div className="container-px">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 md:mb-12 reveal">
            <div>
              <div className="eyebrow"><span className="w-8 h-px bg-crimson"/>{t('home.portfolio.eyebrow')}</div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-navy text-balance">{t('home.portfolio.title1')}<br/>{t('home.portfolio.title2')}</h2>
            </div>
            <Link to="/properties" className="group text-navy font-medium flex items-center gap-2">
              {t('home.portfolio.link')}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1"/>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 reveal">
            {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
          <div className="mt-10 md:mt-14 flex flex-wrap gap-3 justify-center reveal">
            <Link to="/properties" className="btn-navy">Explore Full Portfolio</Link>
            <BookConsultationButton source="Portfolio" className="btn-primary" icon={<CalendarDays size={14}/>}>Book a Consultation</BookConsultationButton>
          </div>
        </div>
      </section>}

      {/* EDITORIAL — SPLIT IMAGE + QUOTE */}
      {show.doctrine && <section className="relative py-14 md:py-24 bg-navy text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src={t('home.doctrine.bg')}
            className="absolute inset-0 w-full h-full object-cover opacity-25" alt=""/>
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent"/>
        </div>
        <div className="container-px relative grid lg:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="reveal">
            <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>{t('home.doctrine.eyebrow')}</div>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl text-white leading-[1.1]">
              "{t('home.doctrine.quote1')}<br/>{t('home.doctrine.quote2')}<br/>
              <span className="italic text-crimson-100">{t('home.doctrine.quote3')}</span>"
            </h2>
            <p className="mt-6 text-white/70 text-base md:text-lg max-w-xl leading-relaxed">{t('home.doctrine.description')}</p>
            <div className="mt-6 md:mt-8 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-crimson flex items-center justify-center font-display text-xl">KR</div>
              <div>
                <div className="font-display text-lg">{t('home.doctrine.signature.name')}</div>
                <div className="text-sm text-white/60">{t('home.doctrine.signature.location')}</div>
              </div>
            </div>
            <BookConsultationButton source="Doctrine" className="btn-primary mt-8 inline-flex" icon={<CalendarDays size={14}/>}>Book a Consultation</BookConsultationButton>
          </div>
          <div className="reveal relative">
            <div className="aspect-[3/4] overflow-hidden">
              <img src={t('home.doctrine.img')} alt="Dubai skyline" className="w-full h-full object-cover"/>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white text-navy p-6 max-w-xs shadow-2xl hidden md:block">
              <div className="text-[10px] tracking-[0.3em] uppercase text-crimson">{t('home.doctrine.featured.label')}</div>
              <div className="font-display text-xl mt-2">{t('home.doctrine.featured.text')}</div>
            </div>
          </div>
        </div>
      </section>}

      {/* WHY KARIMI */}
      {show.why && <section className="py-12 md:py-20 bg-white">
        <div className="container-px">
          <div className="text-center max-w-3xl mx-auto reveal mb-10 md:mb-14">
            <div className="eyebrow justify-center"><span className="w-8 h-px bg-crimson"/>{t('home.why.eyebrow')}</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-navy">{t('home.why.title')}</h2>
            <p className="mt-4 text-navy/70 text-base md:text-lg">{t('home.why.description')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 reveal">
            {[
              { Icon: ShieldCheck, title: t('home.why.1.title'), text: t('home.why.1.text') },
              { Icon: Handshake, title: t('home.why.2.title'), text: t('home.why.2.text') },
              { Icon: Compass, title: t('home.why.3.title'), text: t('home.why.3.text') },
              { Icon: TrendingUp, title: t('home.why.4.title'), text: t('home.why.4.text') },
            ].map(({ Icon, title, text }, i) => (
              <div key={title} className="group bg-white p-6 md:p-8 border border-navy/10 hover-lift relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-crimson/5 rounded-full group-hover:bg-crimson/10 transition-colors"/>
                <div className="font-display text-crimson text-xs tracking-[0.3em]">0{i + 1}</div>
                <Icon className="text-crimson mt-5" size={26}/>
                <div className="mt-4 font-display text-xl md:text-2xl text-navy">{title}</div>
                <p className="mt-2 text-navy/60 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* PRIME LOCATIONS — editorial grid */}
      {show.locations && <section className="py-12 md:py-20 bg-navy-50/30">
        <div className="container-px">
          <div className="text-center reveal mb-10 md:mb-12">
            <div className="eyebrow justify-center"><span className="w-8 h-px bg-crimson"/>{t('home.locations.eyebrow')}</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-navy">{t('home.locations.title')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 reveal">
            {LOCATIONS.map((l, i) => (
              <div key={l.name} className={`group relative overflow-hidden cursor-pointer ${i === 0 ? 'col-span-2 md:col-span-4 md:row-span-2 aspect-[16/10]' : 'md:col-span-2 aspect-[4/3]'}`}>
                <img src={l.img} alt={l.name} className="w-full h-full object-cover transition-transform duration-[1.6s] group-hover:scale-110"/>
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent"/>
                <div className="absolute bottom-4 left-4 right-4 md:bottom-5 md:left-5 md:right-5 text-white">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-crimson-200">{l.tag}</div>
                  <div className="font-display text-lg sm:text-xl md:text-2xl mt-1.5">{l.name}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] md:text-xs text-white/70">
                    <span><span className="text-crimson-200 font-medium">{l.yield}</span> avg yield</span>
                    <span>{l.stat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* PROCESS */}
      {show.process && <section className="py-12 md:py-20 bg-navy text-white relative overflow-hidden">
        <img src={t('home.process.bg')}
          className="absolute inset-0 w-full h-full object-cover opacity-10" alt=""/>
        <div className="container-px relative">
          <div className="text-center reveal">
            <div className="eyebrow justify-center text-crimson-200"><span className="w-8 h-px bg-crimson"/>{t('home.process.eyebrow')}</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-white">{t('home.process.title')}</h2>
          </div>
          <div className="mt-10 md:mt-14 grid sm:grid-cols-2 md:grid-cols-4 gap-8 reveal relative">
            <div className="hidden md:block absolute top-[2.5rem] left-0 right-0 h-px bg-white/10"/>
            {[
              { n: '01', t: t('home.process.1.title'), d: t('home.process.1.text') },
              { n: '02', t: t('home.process.2.title'), d: t('home.process.2.text') },
              { n: '03', t: t('home.process.3.title'), d: t('home.process.3.text') },
              { n: '04', t: t('home.process.4.title'), d: t('home.process.4.text') },
            ].map((s) => (
              <div key={s.n} className="relative pt-8 md:pt-10">
                <div className="absolute top-0 left-0 w-4 h-4 md:w-5 md:h-5 rounded-full bg-crimson ring-8 ring-navy"/>
                <div className="font-display text-crimson text-4xl md:text-5xl">{s.n}</div>
                <div className="mt-2 md:mt-3 font-display text-xl md:text-2xl">{s.t}</div>
                <p className="mt-2 text-white/60 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 md:mt-14 text-center reveal">
            <BookConsultationButton source="Process" className="btn-primary inline-flex" icon={<CalendarDays size={14}/>}>Start Your Discovery Call</BookConsultationButton>
          </div>
        </div>
      </section>}

      {/* ROI CALCULATOR */}
      {show.roi && <section className="py-12 md:py-20 bg-white">
        <div className="container-px">
          <div className="text-center max-w-2xl mx-auto reveal mb-8 md:mb-10">
            <div className="eyebrow justify-center"><span className="w-8 h-px bg-crimson"/>{t('home.roi.eyebrow')}</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-navy">{t('home.roi.title')}</h2>
            <p className="mt-4 text-navy/60">{t('home.roi.description')}</p>
          </div>
          <div className="reveal"><RoiCalculator/></div>
          <div className="mt-10 text-center reveal">
            <BookConsultationButton source="ROI Calculator" className="btn-primary inline-flex" icon={<CalendarDays size={14}/>}>Get a Personalised ROI Plan</BookConsultationButton>
          </div>
        </div>
      </section>}

      {/* GOLDEN VISA */}
      {show.visa && <section className="relative py-14 md:py-24 overflow-hidden">
        <img src={t('home.visa.bg')} className="absolute inset-0 w-full h-full object-cover" alt=""/>
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/50"/>
        <div className="container-px relative grid lg:grid-cols-2 gap-10 md:gap-16 items-center text-white">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 bg-crimson/20 border border-crimson/40 px-4 py-2 text-[11px] tracking-[0.3em] uppercase">
              <KeyRound size={14}/> {t('home.visa.badge')}
            </div>
            <h2 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl">{t('home.visa.title1')}<br/><span className="italic text-crimson-100">{t('home.visa.title2')}</span></h2>
            <p className="mt-5 text-white/75 text-base md:text-lg leading-relaxed max-w-xl">{t('home.visa.description')}</p>
            <div className="mt-6 md:mt-8 grid grid-cols-3 gap-4 md:gap-6">
              {[
                { n: t('home.visa.stat1.n'), l: t('home.visa.stat1.l') },
                { n: t('home.visa.stat2.n'), l: t('home.visa.stat2.l') },
                { n: t('home.visa.stat3.n'), l: t('home.visa.stat3.l') },
              ].map((s) => (
                <div key={s.l} className="border-l-2 border-crimson pl-3 md:pl-4">
                  <div className="font-display text-xl md:text-3xl text-white">{s.n}</div>
                  <div className="text-[10px] md:text-xs tracking-wider uppercase text-white/60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
            <BookConsultationButton source="Golden Visa" className="btn-primary mt-8 inline-flex">{t('home.visa.cta')} <ArrowRight size={16}/></BookConsultationButton>
          </div>
          <div className="reveal hidden lg:block">
            <div className="aspect-[3/4] overflow-hidden relative">
              <img src={t('home.visa.img')} alt="Dubai skyline"
                className="w-full h-full object-cover"/>
              <div className="absolute bottom-6 left-6 right-6 glass p-5 text-white">
                <div className="text-[10px] tracking-[0.3em] uppercase text-crimson-200">{t('home.visa.eligible.label')}</div>
                <div className="mt-2 font-display">{t('home.visa.eligible.text')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* TESTIMONIAL — Featured carousel */}
      {show.testimonials && <section className="py-12 md:py-20 bg-white">
        <div className="container-px">
          <div className="text-center reveal mb-10 md:mb-12">
            <div className="eyebrow justify-center"><span className="w-8 h-px bg-crimson"/>{t('home.testimonials.eyebrow')}</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-navy">{t('home.testimonials.title')}</h2>
          </div>
          {testimonials[tIdx] && (
            <div className="max-w-4xl mx-auto reveal">
              <div className="bg-navy-50/40 p-6 sm:p-10 md:p-16 border border-navy/10 relative">
                <Quote className="text-crimson/20 absolute top-4 left-4 md:top-6 md:left-6" size={60}/>
                <p className="relative font-display text-xl sm:text-2xl md:text-3xl text-navy leading-snug text-balance italic">
                  "{testimonials[tIdx].quote}"
                </p>
                <div className="mt-8 flex items-center gap-4">
                  {testimonials[tIdx].avatar_url && <img src={testimonials[tIdx].avatar_url} alt="" className="w-14 h-14 rounded-full object-cover"/>}
                  <div className="flex-1">
                    <div className="font-display text-navy text-lg">{testimonials[tIdx].name}</div>
                    <div className="text-xs text-navy/60">{testimonials[tIdx].role}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonials[tIdx].rating }).map((_, i) => <Star key={i} size={16} className="fill-crimson text-crimson"/>)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => setTIdx((tIdx - 1 + testimonials.length) % testimonials.length)} className="w-11 h-11 border border-navy/20 text-navy hover:bg-navy hover:text-white transition-colors flex items-center justify-center"><ChevronLeft size={16}/></button>
                <div className="text-navy/50 text-sm">{tIdx + 1} / {testimonials.length}</div>
                <button onClick={() => setTIdx((tIdx + 1) % testimonials.length)} className="w-11 h-11 border border-navy/20 text-navy hover:bg-navy hover:text-white transition-colors flex items-center justify-center"><ChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
      </section>}

      {/* PRESS / AWARDS */}
      {show.awards && <section className="py-12 md:py-16 bg-navy-50/30 border-y border-navy/10">
        <div className="container-px">
          <div className="text-center mb-8 md:mb-10 reveal">
            <div className="eyebrow justify-center"><span className="w-8 h-px bg-crimson"/>Recognition</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 items-center reveal">
            {AWARDS.map((a) => (
              <div key={a.label} className="text-center border-x border-navy/10 px-4">
                <Award className="text-crimson mx-auto" size={22}/>
                <div className="mt-3 font-display text-navy">{a.label}</div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-navy/50 mt-1">{a.year}</div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* CLIENT PERSONAS */}
      {show.personas && <section className="py-12 md:py-20 bg-white">
        <div className="container-px">
          <div className="text-center max-w-3xl mx-auto reveal mb-10 md:mb-12">
            <div className="eyebrow justify-center"><span className="w-8 h-px bg-crimson"/>{t('home.personas.eyebrow')}</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-navy">{t('home.personas.title')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 reveal">
            {[
              { I: Briefcase, tt: t('home.personas.1.title'), d: t('home.personas.1.text'), img: t('home.personas.1.img') },
              { I: Globe, tt: t('home.personas.2.title'), d: t('home.personas.2.text'), img: t('home.personas.2.img') },
              { I: Users, tt: t('home.personas.3.title'), d: t('home.personas.3.text'), img: t('home.personas.3.img') },
            ].map(({ I, tt, d, img }) => (
              <div key={tt} className="group relative overflow-hidden">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"/>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white">
                  <I size={20} className="text-crimson-200"/>
                  <div className="font-display text-xl md:text-2xl mt-2 md:mt-3">{tt}</div>
                  <p className="mt-2 md:mt-3 text-sm text-white/75 leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center reveal">
            <BookConsultationButton source="Personas" className="btn-primary inline-flex" icon={<CalendarDays size={14}/>}>Book a Private Consultation</BookConsultationButton>
          </div>
        </div>
      </section>}

      {/* INSIGHTS */}
      {show.insights && <section className="py-12 md:py-20 bg-navy-50/30">
        <div className="container-px">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 md:mb-12 reveal">
            <div>
              <div className="eyebrow"><span className="w-8 h-px bg-crimson"/>{t('home.insights.eyebrow')}</div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-navy">{t('home.insights.title')}</h2>
            </div>
            <Link to="/insights" className="group text-navy font-medium flex items-center gap-2">{t('home.insights.link')} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1"/></Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 reveal">
            {posts.map((p) => (
              <Link key={p.id} to={`/insights/${p.slug}`} className="group block bg-white border border-navy/10 hover-lift">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"/>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-navy/50">
                    <span className="text-crimson">{p.category}</span><span>·</span><span>{p.read_time}</span>
                  </div>
                  <h3 className="font-display text-xl text-navy mt-3 leading-tight group-hover:text-crimson transition-colors">{p.title}</h3>
                  <p className="mt-3 text-navy/60 text-sm leading-relaxed line-clamp-2">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>}

      {/* FAQ */}
      {show.faq && <section className="py-12 md:py-20 bg-white">
        <div className="container-px grid lg:grid-cols-3 gap-10 md:gap-14">
          <div className="reveal">
            <div className="eyebrow"><span className="w-8 h-px bg-crimson"/>{t('home.faq.eyebrow')}</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-navy">{t('home.faq.title')}</h2>
            <p className="mt-4 text-navy/60">{t('home.faq.description')}</p>
            <BookConsultationButton source="FAQ" className="btn-navy mt-6 inline-flex">{t('home.faq.cta')}</BookConsultationButton>
          </div>
          <div className="lg:col-span-2 reveal">
            <Faq/>
          </div>
        </div>
      </section>}

      {/* CTA */}
      {show.cta && <section className="relative py-14 md:py-24 overflow-hidden">
        <img src={t('home.cta.bg')}
          className="absolute inset-0 w-full h-full object-cover" alt=""/>
        <div className="absolute inset-0 bg-navy/90"/>
        <div className="container-px relative text-center text-white max-w-3xl mx-auto reveal">
          <div className="inline-flex items-center gap-3 text-crimson-200">
            <Award size={18}/><span className="text-[11px] tracking-[0.3em] uppercase">{t('home.cta.badge')}</span><Users size={18}/>
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-6xl">{t('home.cta.title1')}<br/><span className="italic text-crimson-100">{t('home.cta.title2')}</span></h2>
          <p className="mt-5 text-white/80 text-base md:text-lg">{t('home.cta.description')}</p>
          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4 justify-center">
            <BookConsultationButton source="Final CTA" className="btn-primary">{t('home.cta.btn1')}</BookConsultationButton>
            <a href="https://wa.me/971528680423" className="btn-ghost">{t('home.cta.btn2')}</a>
          </div>
        </div>
      </section>}
    </>
  );
}