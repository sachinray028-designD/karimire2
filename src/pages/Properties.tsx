import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { supabase, type Property } from '../lib/supabase';
import PropertyCard from '../components/PropertyCard';
import { useReveal } from '../lib/useReveal';
import { Seo } from '../lib/seo';
import { getSSGData } from '../lib/ssgData';

export default function Properties() {
  useReveal();
  const [params, setParams] = useSearchParams();
  const ssg = getSSGData();
  const [all, setAll] = useState<Property[]>(ssg?.properties || []);
  const [loading, setLoading] = useState(!ssg?.properties?.length);
  const [q, setQ] = useState(params.get('q') || '');
  const [type, setType] = useState(params.get('type') || '');
  const [status, setStatus] = useState(params.get('status') || '');
  const [developer, setDeveloper] = useState(params.get('developer') || '');
  const [config, setConfig] = useState(params.get('config') || '');
  const [budget, setBudget] = useState(params.get('budget') || '');
  const [sort, setSort] = useState('newest');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.from('properties').select('*').eq('active', true).order('created_at', { ascending: false })
      .then(({ data }) => { setAll(data || []); setLoading(false); });
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (type) next.set('type', type);
    if (status) next.set('status', status);
    if (developer) next.set('developer', developer);
    if (config) next.set('config', config);
    if (budget) next.set('budget', budget);
    setParams(next, { replace: true });
  }, [q, type, status, developer, config, budget, setParams]);

  const developers = useMemo(() => Array.from(new Set(all.map((p) => p.developer_name))).filter(Boolean), [all]);

  const filtered = useMemo(() => {
    const [minB, maxB] = budget ? budget.split('-').map(Number) : [0, 0];
    let list = all.filter((p) => {
      if (q && !(`${p.project_name} ${p.location} ${p.developer_name}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (type && p.property_type !== type) return false;
      if (status && p.status !== status) return false;
      if (developer && p.developer_name !== developer) return false;
      if (config && !p.configurations.includes(config)) return false;
      if (budget && (p.starting_price < minB || p.starting_price > maxB)) return false;
      return true;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.starting_price - b.starting_price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.starting_price - a.starting_price);
    return list;
  }, [all, q, type, status, developer, config, budget, sort]);

  const select = 'bg-white border border-navy/15 px-3 py-2.5 text-sm text-navy focus:outline-none focus:border-crimson';

  return (
    <>
      <Seo
        page="properties"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Properties', url: '/properties' }]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Dubai Properties for Sale',
          url: 'https://www.karimi.ae/properties',
          numberOfItems: filtered.length,
          itemListElement: filtered.slice(0, 30).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://www.karimi.ae/properties/${p.slug}`,
            name: p.project_name,
          })),
        }}
      />
      <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-navy text-white relative overflow-hidden">
        <img loading="lazy" src="https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-15" alt=""/>
        <div className="container-px relative">
          <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>Curated Portfolio</div>
          <h1 className="mt-4 font-display text-5xl md:text-7xl">Dubai's finest,<br/><span className="italic text-crimson-100">filtered.</span></h1>
          <p className="mt-5 text-white/70 max-w-2xl text-lg">Off-plan and ready properties across every prime Dubai address, continuously updated with direct-from-developer allocations.</p>
        </div>
      </section>

      <section className="sticky top-20 md:top-[7.25rem] z-30 bg-white border-b border-navy/10 shadow-sm">
        <div className="container-px py-4 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[220px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"/>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search project, developer, or area" className="w-full pl-9 pr-3 py-2.5 border border-navy/15 text-sm focus:outline-none focus:border-crimson"/>
          </div>
          <button onClick={() => setOpen(!open)} className="lg:hidden border border-navy/15 px-3 py-2.5 text-sm flex items-center gap-2"><SlidersHorizontal size={14}/>Filters</button>
          <div className={`${open ? 'flex' : 'hidden'} lg:flex flex-wrap gap-3 w-full lg:w-auto`}>
            <select className={select} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All Types</option><option>Apartment</option><option>Villa</option><option>Townhouse</option>
            </select>
            <select className={select} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any Status</option><option>Off-Plan</option><option>Ready</option>
            </select>
            <select className={select} value={developer} onChange={(e) => setDeveloper(e.target.value)}>
              <option value="">All Developers</option>{developers.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className={select} value={config} onChange={(e) => setConfig(e.target.value)}>
              <option value="">Any Config</option><option>Studio</option><option>1BR</option><option>2BR</option><option>3BR</option><option>4BR+</option>
            </select>
            <select className={select} value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">Any Budget</option>
              <option value="0-1000000">Under AED 1M</option>
              <option value="1000000-3000000">AED 1M – 3M</option>
              <option value="3000000-7000000">AED 3M – 7M</option>
              <option value="7000000-15000000">AED 7M – 15M</option>
              <option value="15000000-999000000">AED 15M+</option>
            </select>
            <select className={select} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option>
            </select>
            {(q || type || status || developer || config || budget) && (
              <button onClick={() => { setQ(''); setType(''); setStatus(''); setDeveloper(''); setConfig(''); setBudget(''); }} className="text-sm text-crimson flex items-center gap-1"><X size={14}/>Clear</button>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy-50/30">
        <div className="container-px">
          <h2 className="font-display text-3xl md:text-4xl text-navy">Available Dubai properties</h2>
          <p className="mt-3 text-navy/65 max-w-3xl leading-relaxed">
            Every listing below is a direct developer allocation, so the price you see is the price you
            pay — we charge you no commission. Starting prices, down payment percentages and handover
            dates are shown upfront. New to the market? Start with our{' '}
            <Link to="/insights" className="text-crimson underline underline-offset-4">
              Dubai property investment guides
            </Link>{' '}
            or compare{' '}
            <Link to="/developers" className="text-crimson underline underline-offset-4">
              developer track records
            </Link>
            .
          </p>
          <div className="mt-6 text-sm text-navy/60 mb-6">Showing <span className="text-navy font-medium">{filtered.length}</span> of {all.length} properties</div>
          {loading ? (
            <div className="text-center py-20 text-navy/50">Loading portfolio...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-navy/50">No properties match your filters.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
