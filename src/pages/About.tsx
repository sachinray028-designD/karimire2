import { Link } from 'react-router-dom';
import { Award, Shield, Globe as Globe2, Sparkles } from 'lucide-react';
import { useReveal } from '../lib/useReveal';
import { useT } from '../lib/content';
import { Seo } from '../lib/seo';
import { BookConsultationButton } from '../components/ConsultationModal';

export default function About() {
  useReveal();
  const t = useT();
  const values = [
    { I: Shield, t: t('about.principles.1.t'), d: t('about.principles.1.d') },
    { I: Sparkles, t: t('about.principles.2.t'), d: t('about.principles.2.d') },
    { I: Globe2, t: t('about.principles.3.t'), d: t('about.principles.3.d') },
    { I: Award, t: t('about.principles.4.t'), d: t('about.principles.4.d') },
  ];
  return (
    <>
      <Seo page="about" breadcrumbs={[{ name: 'Home', url: 'https://karimi.ae/' }, { name: 'About', url: 'https://karimi.ae/about' }]} />
      <main>
      <section className="pt-32 md:pt-44 pb-16 md:pb-24 bg-navy text-white relative overflow-hidden">
        <img src={t('about.hero.bg')} className="absolute inset-0 w-full h-full object-cover opacity-15" alt=""/>
        <div className="container-px relative max-w-4xl">
          <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>{t('about.hero.eyebrow')}</div>
          <h1 className="mt-5 font-display text-5xl md:text-7xl text-balance">{t('about.hero.title')}</h1>
          <p className="mt-6 text-white/70 text-lg max-w-2xl">{t('about.hero.description')}</p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-px grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <img src={t('about.story.img')} alt="Team" className="w-full aspect-[4/5] object-cover"/>
          </div>
          <div className="reveal">
            <div className="eyebrow"><span className="w-8 h-px bg-crimson"/>{t('about.story.eyebrow')}</div>
            <h2 className="mt-3 font-display text-4xl text-navy">{t('about.story.title')}</h2>
            <div className="mt-6 space-y-5 text-navy/75 text-lg leading-relaxed">
              <p>{t('about.story.p1')}</p>
              <p>{t('about.story.p2')}</p>
              <p>{t('about.story.p3')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-navy-50/30">
        <div className="container-px">
          <div className="text-center reveal mb-16">
            <div className="eyebrow justify-center"><span className="w-8 h-px bg-crimson"/>{t('about.principles.eyebrow')}</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy">{t('about.principles.title')}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 reveal">
            {values.map(({ I, t: vt, d }) => (
              <div key={vt} className="bg-white p-8 hover-lift border border-navy/5">
                <I className="text-crimson" size={28}/>
                <div className="mt-5 font-display text-2xl text-navy">{vt}</div>
                <p className="mt-3 text-navy/60 text-sm leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-px text-center max-w-3xl mx-auto reveal">
          <h2 className="font-display text-4xl md:text-5xl text-navy">{t('about.visit.title')}</h2>
          <p className="mt-5 text-navy/70 text-lg">{t('about.visit.description')}</p>
          <BookConsultationButton source="About" className="btn-primary mt-8 inline-flex">{t('about.visit.cta')}</BookConsultationButton>
        </div>
      </section>
      </main>
    </>
  );
}
