import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, Calendar, Award, ExternalLink } from 'lucide-react';
import { Seo, useSiteUrl } from '../lib/seo';
import { DEV_PROFILES } from '../data/developers';

export default function DeveloperProfile() {
  const site = useSiteUrl();
  const { slug } = useParams();
  const dev = DEV_PROFILES.find(d => d.slug === slug);

  if (!dev) {
    return (
      <div className="pt-40 text-center">
        <h2 className="font-display text-4xl text-navy">Developer not found</h2>
        <Link to="/developers" className="btn-primary inline-flex mt-6">All Developers</Link>
      </div>
    );
  }

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: dev.name,
      url: dev.website,
      foundingDate: String(dev.foundingYear),
      description: dev.specialism,
      areaServed: { '@type': 'City', name: 'Dubai', addressCountry: 'AE' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: dev.faq.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ];

  return (
    <>
      <Seo
        page="developers"
        titleOverride={`${dev.name} — Dubai Developer Profile | Karimi Real Estate`}
        descriptionOverride={`${dev.name}: ${dev.specialism}. Founded ${dev.foundingYear}. Signature projects include ${dev.signatureProjects.slice(0, 3).join(', ')}. Expert analysis from Karimi Real Estate.`}
        canonicalOverride={`${site}/developers/${dev.slug}`}
        breadcrumbs={[
          { name: 'Home', url: `${site}/` },
          { name: 'Developers', url: `${site}/developers` },
          { name: dev.name, url: `${site}/developers/${dev.slug}` },
        ]}
        jsonLd={schema}
      />
      <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-navy text-white">
        <div className="container-px max-w-5xl">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link to="/developers" className="hover:text-white transition-colors"><ArrowLeft size={14} className="inline mr-1"/>All Developers</Link>
          </div>
          <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>Developer Profile</div>
          <h1 className="mt-5 font-display text-5xl md:text-6xl">{dev.name}</h1>
          <p className="mt-5 text-white/70 text-lg">{dev.specialism}</p>
          <div className="flex gap-6 mt-6 text-white/60 text-sm">
            <div className="flex items-center gap-2"><Calendar size={16} className="text-crimson"/>Founded {dev.foundingYear}</div>
            <div className="flex items-center gap-2"><Building2 size={16} className="text-crimson"/>{dev.signatureProjects.length} Signature Projects</div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-px max-w-5xl">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="prose-custom max-w-none">
                {dev.description.split('\n\n').map((p, i) => (
                  <p key={i} className="text-navy/80 leading-relaxed mb-4">{p}</p>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-navy-50/40 border border-navy/10 p-6">
                <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><Award size={18} className="text-crimson"/>Signature Projects</h3>
                <ul className="space-y-2">
                  {dev.signatureProjects.map((p, i) => (
                    <li key={i} className="text-navy/70 text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-crimson flex-shrink-0"/>
                      {p}
                    </li>
                  ))}
                </ul>
                <a href={dev.website} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center gap-2 text-crimson text-sm font-medium hover:text-navy transition-colors">
                  Official Website <ExternalLink size={14}/>
                </a>
              </div>
              <Link
                to={`/properties?developer=${encodeURIComponent(dev.name)}`}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                View {dev.name} Properties <ArrowRight size={16}/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container-px max-w-3xl">
          <h2 className="font-display text-3xl text-navy mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {dev.faq.map((f, i) => (
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
