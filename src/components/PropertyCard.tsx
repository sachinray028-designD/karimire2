import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import type { Property } from '../lib/supabase';
import { formatAED } from '../lib/useReveal';

export default function PropertyCard({ p }: { p: Property }) {
  const img = p.hero_images?.[0] || 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1600';
  return (
    <Link to={`/properties/${p.slug}`} className="group block bg-white hover-lift">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img src={img} alt={p.project_name} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-crimson text-white text-[10px] tracking-[0.2em] uppercase px-3 py-1.5">{p.status}</span>
          {p.featured && <span className="bg-white/95 text-navy text-[10px] tracking-[0.2em] uppercase px-3 py-1.5">Signature</span>}
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="text-[11px] tracking-[0.25em] uppercase opacity-90">{p.developer_name}</div>
          <h3 className="font-display text-2xl mt-1 leading-tight">{p.project_name}</h3>
        </div>
      </div>
      <div className="p-6 border border-t-0 border-navy/10">
        <div className="flex items-center justify-between text-sm text-navy/70">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-crimson"/>{p.location}</span>
          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-crimson"/>{p.handover_date}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.configurations.slice(0, 4).map((c) => (
            <span key={c} className="text-[10px] tracking-wider uppercase border border-navy/15 text-navy/70 px-2 py-1">{c}</span>
          ))}
        </div>
        <div className="mt-5 pt-5 border-t border-navy/10 flex items-end justify-between">
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-navy/50">Starting from</div>
            <div className="font-display text-xl text-navy">{formatAED(p.starting_price, p.currency)}</div>
          </div>
          <div className="w-10 h-10 bg-navy text-white flex items-center justify-center group-hover:bg-crimson transition-colors">
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
