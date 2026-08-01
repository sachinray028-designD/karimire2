import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Building2, Lock, Check, Share2, FileText, Home } from 'lucide-react';
import { supabase, type Property } from '../lib/supabase';
import { formatAED, useReveal } from '../lib/useReveal';
import InquiryForm from '../components/InquiryForm';
import { Seo } from '../lib/seo';
import { getSSGData } from '../lib/ssgData';

export default function PropertyDetail() {
  useReveal();
  const { slug } = useParams();
  const ssg = getSSGData();
  const ssgProperty = ssg?.properties.find(p => p.slug === slug);
  const [p, setP] = useState<Property | null>(ssgProperty || null);
  const [loading, setLoading] = useState(!ssgProperty);
  const [unlocked, setUnlocked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!slug) return;
    supabase.from('properties').select('*').eq('slug', slug).eq('active', true).maybeSingle()
      .then(({ data }) => { setP(data); setLoading(false); });
    setUnlocked(localStorage.getItem(`unlocked_${slug}`) === '1');
  }, [slug]);

  function onSuccess() {
    setUnlocked(true);
    if (slug) localStorage.setItem(`unlocked_${slug}`, '1');
  }

  if (loading) return <div className="pt-40 text-center text-navy/50">Loading...</div>;
  if (!p) return <div className="pt-40 text-center"><h2 className="font-display text-4xl text-navy">Property not found</h2><Link to="/properties" className="btn-primary mt-6 inline-flex">Browse Portfolio</Link></div>;

  const gallery = [...(p.hero_images || []), ...(p.gallery_images || [])];

  return (
    <>
      <Seo
        page="properties"
        titleOverride={`${p.project_name} by ${p.developer_name} in ${p.location} | Karimi Real Estate`}
        descriptionOverride={`${p.property_type} in ${p.location} by ${p.developer_name}. Handover ${p.handover_date}.`}
        canonicalOverride={`https://www.karimi.ae/properties/${p.slug}`}
        imageOverride={gallery[0]}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.karimi.ae/' },
          { name: 'Properties', url: 'https://www.karimi.ae/properties' },
          { name: p.project_name, url: `https://www.karimi.ae/properties/${p.slug}` },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Residence',
          name: p.project_name,
          url: `https://www.karimi.ae/properties/${p.slug}`,
          image: gallery,
          address: {
            '@type': 'PostalAddress',
            addressLocality: p.location,
            addressCountry: 'AE',
          },
          offers: p.starting_price ? {
            '@type': 'Offer',
            price: p.starting_price,
            priceCurrency: p.currency || 'AED',
            availability: 'https://schema.org/InStock',
          } : undefined,
          brand: { '@type': 'Organization', name: p.developer_name },
        }}
      />
      <section className="relative pt-28 md:pt-[7.25rem] bg-navy">
        <div className="relative aspect-[21/10] md:aspect-[21/9] max-h-[80vh] overflow-hidden">
          <img src={gallery[activeImg] || gallery[0]} alt={p.project_name} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent"/>
          <div className="absolute bottom-0 left-0 right-0 container-px pb-12">
            <div className="text-crimson-200 text-[11px] tracking-[0.3em] uppercase">{p.developer_name}</div>
            <h1 className="font-display text-white text-4xl md:text-6xl mt-3">{p.project_name}</h1>
            <div className="mt-4 flex flex-wrap gap-5 text-white/80 text-sm">
              <span className="flex items-center gap-1.5"><MapPin size={15} className="text-crimson"/>{p.location}</span>
              <span className="flex items-center gap-1.5"><Calendar size={15} className="text-crimson"/>Handover {p.handover_date}</span>
              <span className="flex items-center gap-1.5"><Building2 size={15} className="text-crimson"/>{p.property_type}</span>
            </div>
          </div>
        </div>
        {gallery.length > 1 && (
          <div className="container-px py-4 flex gap-2 overflow-x-auto bg-navy">
            {gallery.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`shrink-0 w-24 h-16 overflow-hidden border-2 ${activeImg === i ? 'border-crimson' : 'border-transparent opacity-60'}`}>
                <img src={img} alt="" className="w-full h-full object-cover"/>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="py-16 bg-white">
        <div className="container-px grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-14">
            {/* FACTS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { l: 'Starting From', v: formatAED(p.starting_price, p.currency) },
                { l: 'Down Payment', v: `${p.down_payment_percent}%` },
                { l: 'Handover', v: p.handover_date },
                { l: 'Status', v: p.status },
              ].map((f) => (
                <div key={f.l} className="border border-navy/10 p-5">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-navy/50">{f.l}</div>
                  <div className="font-display text-xl text-navy mt-2">{f.v}</div>
                </div>
              ))}
            </div>

            {/* OVERVIEW */}
            <div>
              <div className="eyebrow"><span className="w-8 h-px bg-crimson"/>Overview</div>
              <h2 className="mt-3 font-display text-3xl text-navy">About {p.project_name}</h2>
              <div className="mt-5 text-navy/70 text-lg leading-relaxed space-y-4">
                {(p.overview || '').split(/\n\n|\n/).filter(Boolean).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {p.configurations.map((c) => (
                  <span key={c} className="text-xs tracking-wider uppercase border border-navy/20 text-navy px-3 py-1.5">{c}</span>
                ))}
              </div>
            </div>

            {/* GATED */}
            <div className="relative">
              <div className={`space-y-10 ${unlocked ? '' : 'locked-blur'}`}>
                <div>
                  <h3 className="font-display text-2xl text-navy mb-5">Key Highlights</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(p.key_highlights || []).map((h) => (
                      <div key={h} className="flex gap-3 items-start p-4 bg-navy-50/30">
                        <Check className="text-crimson mt-0.5 shrink-0" size={18}/>
                        <span className="text-navy/80 text-sm">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-2xl text-navy mb-5">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(p.amenities || []).map((a) => (
                      <div key={a} className="border border-navy/10 p-4 text-sm text-navy/80">{a}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-2xl text-navy mb-5">Payment Plan</h3>
                  <div className="border border-navy/10">
                    {(p.payment_plan || []).map((row, i) => (
                      <div key={i} className="flex justify-between items-center p-5 border-b border-navy/10 last:border-b-0">
                        <span className="text-navy font-medium">{row.milestone}</span>
                        <span className="font-display text-2xl text-crimson">{row.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                {p.floor_plan_images?.length > 0 && (
                  <div>
                    <h3 className="font-display text-2xl text-navy mb-5">Floor Plans</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {p.floor_plan_images.map((img, i) => (
                        <img key={i} src={img} alt="Floor plan" className="w-full border border-navy/10"/>
                      ))}
                    </div>
                  </div>
                )}
                {p.brochure_url && unlocked && (
                  <a href={p.brochure_url} className="btn-navy inline-flex"><FileText size={16}/>Download Brochure</a>
                )}
              </div>
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white shadow-2xl max-w-md w-full p-8 text-center border-t-4 border-crimson">
                    <Lock className="mx-auto text-crimson" size={32}/>
                    <h3 className="font-display text-2xl text-navy mt-4">Unlock the full dossier</h3>
                    <p className="text-sm text-navy/60 mt-2">Instantly access amenities, payment plan, floor plans and brochure.</p>
                    <div className="mt-6"><InquiryForm propertyId={p.id} propertyName={p.project_name} onSuccess={onSuccess} compact/></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-28 h-fit space-y-5">
            <div className="bg-navy text-white p-7">
              <div className="font-display text-2xl">Speak to a senior advisor</div>
              <p className="text-sm text-white/70 mt-2">Zero commission. No pressure. Just clarity on {p.project_name}.</p>
              <div className="mt-5 space-y-3">
                <a href="https://wa.me/971528680423" className="btn-primary w-full justify-center">WhatsApp Advisor</a>
                <a href="tel:+971528680423" className="btn-ghost w-full justify-center">Call +971 52 868 0423</a>
              </div>
            </div>
            <div className="border border-navy/10 p-7">
              <div className="flex items-center gap-3">
                <Home className="text-crimson" size={20}/>
                <div>
                  <div className="text-xs text-navy/50 tracking-wider uppercase">Developer</div>
                  <div className="font-display text-navy">{p.developer_name}</div>
                </div>
              </div>
            </div>
            <button onClick={() => navigator.share?.({ title: p.project_name, url: window.location.href }).catch(() => navigator.clipboard.writeText(window.location.href))} className="w-full border border-navy/15 py-3 text-sm text-navy flex items-center justify-center gap-2 hover:border-crimson hover:text-crimson transition-colors">
              <Share2 size={15}/>Share this property
            </button>
          </aside>
        </div>
      </section>
    </>
  );
}
