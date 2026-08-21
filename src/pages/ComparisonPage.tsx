import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Seo, useSiteUrl } from '../lib/seo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { COMPARISONS } from '../data/comparisons';

export default function ComparisonPage() {
  const site = useSiteUrl();
  const { slug } = useParams();
  const comparison = COMPARISONS.find(c => c.slug === slug);

  if (!comparison) {
    return (
      <div className="pt-40 text-center">
        <h2 className="font-display text-4xl text-navy">Comparison not found</h2>
        <Link to="/insights" className="btn-primary inline-flex mt-6">All Insights</Link>
      </div>
    );
  }

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: comparison.title,
      url: `${site}/insights/${comparison.slug}`,
      author: {
        '@type': 'Person',
        name: 'Karimi Advisory Desk',
        jobTitle: 'Property Advisor',
        worksFor: { '@type': 'Organization', name: 'Karimi Real Estate LLC' },
      },
      publisher: { '@type': 'Organization', name: 'Karimi Real Estate LLC', url: site },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: comparison.faq.map(f => ({
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
        titleOverride={`${comparison.title} | Karimi Insights`}
        descriptionOverride={comparison.metaDescription}
        canonicalOverride={`${site}/insights/${comparison.slug}`}
        breadcrumbs={[
          { name: 'Home', url: `${site}/` },
          { name: 'Insights', url: `${site}/insights` },
          { name: comparison.title, url: `${site}/insights/${comparison.slug}` },
        ]}
        jsonLd={schema}
      />
      <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-navy text-white">
        <div className="container-px max-w-5xl">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link to="/insights" className="hover:text-white transition-colors"><ArrowLeft size={14} className="inline mr-1"/>Insights</Link>
          </div>
          <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>Comparison Guide</div>
          <h1 className="mt-5 font-display text-4xl md:text-6xl">{comparison.title}</h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-px max-w-4xl">
          <div className="prose-custom max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {comparison.content}
            </ReactMarkdown>
          </div>
          <div className="mt-16 bg-navy-50 p-8 md:p-12 text-center">
            <h3 className="font-display text-3xl text-navy mb-4">Need Help Deciding?</h3>
            <p className="text-navy/70 mb-8 max-w-2xl mx-auto">Speak with a RERA-certified advisor at Karimi Real Estate for personalised guidance.</p>
            <Link to="/contact" className="btn-primary inline-flex">Book a Consultation</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container-px max-w-3xl">
          <h2 className="font-display text-3xl text-navy mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {comparison.faq.map((f, i) => (
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
