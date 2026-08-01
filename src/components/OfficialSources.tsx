import { ExternalLink } from 'lucide-react';

const SOURCES = [
  {
    name: 'Dubai Land Department',
    url: 'https://dubailand.gov.ae/en/',
    description: 'Official registry for all Dubai property transactions, title deeds and RERA licensing.',
  },
  {
    name: 'UAE Golden Visa',
    url: 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa',
    description: 'Official UAE government portal for Golden Visa eligibility, requirements and application.',
  },
  {
    name: 'Dubai Pulse — DLD Open Data',
    url: 'https://www.dubaipulse.gov.ae/organisation/dld',
    description: 'Public transaction data, price indices and market statistics from the Dubai Land Department.',
  },
  {
    name: 'Central Bank of the UAE',
    url: 'https://www.centralbank.ae/en/',
    description: 'Mortgage regulations, lending caps and monetary policy relevant to UAE property finance.',
  },
];

export default function OfficialSources() {
  return (
    <aside className="mt-12 pt-10 border-t border-navy/10">
      <div className="eyebrow mb-5">
        <span className="w-8 h-px bg-crimson" />
        Official Sources
      </div>
      <p className="text-navy/60 text-sm mb-6">
        Data and regulatory references cited on this page come from the following UAE government bodies.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {SOURCES.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-4 border border-navy/10 hover:border-crimson/30 transition-colors"
          >
            <ExternalLink size={16} className="text-crimson mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-navy group-hover:text-crimson transition-colors text-sm">{s.name}</div>
              <p className="text-navy/50 text-xs mt-1 leading-relaxed">{s.description}</p>
            </div>
          </a>
        ))}
      </div>
    </aside>
  );
}

export { SOURCES as OFFICIAL_SOURCES };
