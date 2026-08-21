import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, TrendingUp, Home as HomeIcon, Train } from 'lucide-react';
import { Seo, useSiteUrl } from '../lib/seo';
import { AREA_GUIDES } from '../data/areas';

export default function AreaGuide() {
  const site = useSiteUrl();
  const { slug } = useParams();
  const area = AREA_GUIDES.find(a => a.slug === slug);

  if (!area) {
    return (
      <div className="pt-40 text-center">
        <h2 className="font-display text-4xl text-navy">Area not found</h2>
        <Link to="/" className="btn-primary inline-flex mt-6">Home</Link>
      </div>
    );
  }

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: area.name,
      description: area.metaDescription,
      address: { '@type': 'PostalAddress', addressLocality: area.name, addressRegion: 'Dubai', addressCountry: 'AE' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: area.faq.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ];

  return (
    <>
      <Seo
        page="insights"
        titleOverride={`${area.title} | Karimi Real Estate`}
        descriptionOverride={area.metaDescription}
        canonicalOverride={`${site}/areas/${area.slug}`}
        breadcrumbs={[
          { name: 'Home', url: `${site}/` },
          { name: 'Areas', url: `${site}/areas/${area.slug}` },
          { name: area.name, url: `${site}/areas/${area.slug}` },
        ]}
        jsonLd={schema}
      />
      <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-navy text-white">
        <div className="container-px max-w-5xl">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link to="/" className="hover:text-white transition-colors"><ArrowLeft size={14} className="inline mr-1"/>Home</Link>
            <span>/</span>
            <span>Areas</span>
          </div>
          <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>Area Guide</div>
          <h1 className="mt-5 font-display text-5xl md:text-6xl">{area.name}</h1>
          <p className="mt-5 text-white/70 text-lg">Living & Investment Guide</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-6 bg-navy-50/40 border-b border-navy/10">
        <div className="container-px max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {area.stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xs text-navy/50 uppercase tracking-widest">{s.label}</div>
                <div className="font-display text-lg text-navy mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-px max-w-5xl">
          <div className="prose-custom max-w-none">
            {area.description.split('\n\n').map((p, i) => (
              <p key={i} className="text-navy/80 leading-relaxed mb-4">{p}</p>
            ))}
          </div>

          <div className="mt-12 grid sm:grid-cols-2 gap-4">
            <Link to="/properties" className="flex items-center gap-3 bg-navy-50/30 p-5 border border-navy/10 hover:border-crimson/30 transition-colors group">
              <HomeIcon size={20} className="text-crimson"/>
              <div>
                <div className="font-display text-navy group-hover:text-crimson transition-colors">Browse Properties</div>
                <div className="text-navy/50 text-sm">Find available properties in {area.name}</div>
              </div>
            </Link>
            <Link to="/contact" className="flex items-center gap-3 bg-navy-50/30 p-5 border border-navy/10 hover:border-crimson/30 transition-colors group">
              <MapPin size={20} className="text-crimson"/>
              <div>
                <div className="font-display text-navy group-hover:text-crimson transition-colors">Area Consultation</div>
                <div className="text-navy/50 text-sm">Get expert advice on investing in {area.name}</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Other Areas */}
      <section className="py-12 bg-navy-50/20 border-t border-navy/10">
        <div className="container-px max-w-5xl">
          <h2 className="font-display text-2xl text-navy mb-6">Explore Other Areas</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {AREA_GUIDES.filter(a => a.slug !== area.slug).map(a => (
              <Link key={a.slug} to={`/areas/${a.slug}`} className="group bg-white p-4 border border-navy/10 hover:border-crimson/30 transition-colors">
                <div className="font-display text-navy group-hover:text-crimson transition-colors">{a.name}</div>
                <div className="text-navy/50 text-xs mt-1">{a.stats[0]?.value} avg yield</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container-px max-w-3xl">
          <h2 className="font-display text-3xl text-navy mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {area.faq.map((f, i) => (
              <div key={i} className="bg-white p-6 border border-navy/10">
                <h3 className="font-display text-lg text-navy">{f.question}</h3>
                <p className="mt-2 text-navy/70 text-sm leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
