import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  { q: 'How does Karimi\'s zero-commission model really work?', a: 'When you buy through Karimi, our fee is paid by the developer of the property you acquire, not by you. Developers budget 2-4% for distribution; we recover that on the listing side so your purchase price is unchanged and you pay us nothing.' },
  { q: 'Can foreigners buy property in Dubai?', a: 'Yes. Non-UAE nationals can purchase freehold in designated zones including Downtown, Palm Jumeirah, Dubai Marina, Business Bay, Dubai Hills, Emaar Beachfront and many more. Freehold grants full ownership, transferable to heirs.' },
  { q: 'What is the minimum investment for a Golden Visa?', a: 'AED 2 million equity in property (single unit or aggregate). Mortgaged properties qualify provided AED 2M of equity has been paid. The visa is renewable every 10 years.' },
  { q: 'Off-plan vs ready: which is right for me?', a: 'Off-plan offers payment-plan leverage and pre-handover appreciation, ideal for capital-growth investors with 3-5 year horizons. Ready property delivers immediate yield and eliminates construction risk. Most diversified Dubai portfolios blend both.' },
  { q: 'What rental yields can I expect in Dubai?', a: 'Gross yields typically range 5–9% depending on zone and asset class. Business Bay, JVC and Dubai Marina lead yields (7–9%). Prime addresses like Downtown and Palm Jumeirah trade at 5–6% but lead on capital appreciation.' },
  { q: 'Are there annual property taxes?', a: 'No recurring property tax in the UAE. Buyers pay a one-time 4% DLD transfer fee plus modest registration and trustee charges. Annual service charges apply and vary by community.' },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-navy/10 border-y border-navy/10">
      {FAQS.map((f, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full py-6 flex items-center justify-between gap-6 text-left group">
            <span className="font-display text-lg md:text-xl text-navy group-hover:text-crimson transition-colors">{f.q}</span>
            <span className="w-9 h-9 border border-navy/20 flex items-center justify-center shrink-0 group-hover:border-crimson transition-colors">
              {open === i ? <Minus size={15} className="text-crimson"/> : <Plus size={15} className="text-navy group-hover:text-crimson"/>}
            </span>
          </button>
          <div className={`grid transition-all duration-500 ${open === i ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <p className="text-navy/70 leading-relaxed max-w-3xl">{f.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
