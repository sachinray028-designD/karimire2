import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo, useSiteUrl } from '../lib/seo';
import { Calculator as CalcIcon } from 'lucide-react';

const FAQ = [
  { q: 'How accurate is this calculator?', a: 'This calculator provides estimates based on your inputs. Actual returns depend on market conditions, occupancy rates, maintenance costs, and other factors. Consult a RERA-certified advisor for personalised projections.' },
  { q: 'What rental yield should I expect in Dubai?', a: 'Dubai gross rental yields typically range from 5-8% depending on the area. Prime locations like Dubai Marina and JBR can achieve 6-8%, while Downtown Dubai averages 5-6%. Holiday homes (short-term lets) can yield higher but involve more management.' },
  { q: 'Does this include all costs?', a: 'The calculator factors in service charges but does not include the one-time 4% DLD transfer fee, agent commission (if any), furnishing costs, or mortgage interest. Add these manually for a complete picture.' },
  { q: 'What appreciation rate is realistic?', a: 'Dubai property has historically appreciated 3-7% per annum in established areas over long holding periods, though some off-plan investments have seen higher short-term gains. Use a conservative 3-5% for planning purposes.' },
];

export default function CalculatorPage() {
  const site = useSiteUrl();
  const [price, setPrice] = useState(2000000);
  const [downPayment, setDownPayment] = useState(100);
  const [yieldRate, setYieldRate] = useState(6.5);
  const [serviceCharges, setServiceCharges] = useState(25000);
  const [appreciation, setAppreciation] = useState(4);

  const equity = price * (downPayment / 100);
  const annualRental = price * (yieldRate / 100);
  const netRental = annualRental - serviceCharges;
  const netYield = ((netRental / equity) * 100);

  // 5-year projection
  let totalRental = 0;
  let propertyValue = price;
  for (let y = 0; y < 5; y++) {
    totalRental += netRental;
    propertyValue *= (1 + appreciation / 100);
  }
  const capitalGain = propertyValue - price;
  const totalReturn = totalRental + capitalGain;
  const fiveYearROI = ((totalReturn / equity) * 100);
  const breakEvenYears = netRental > 0 ? Math.ceil(equity / netRental) : Infinity;

  const fmt = (n: number) => new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(n);

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Karimi Dubai Property ROI Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      url: `${site}/calculator`,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return (
    <>
      <Seo
        page="insights"
        titleOverride="Dubai Property ROI Calculator | Karimi Real Estate"
        descriptionOverride="Calculate rental yield, 5-year ROI, and break-even for Dubai investment property. Free tool from Karimi Real Estate."
        canonicalOverride={`${site}/calculator`}
        breadcrumbs={[
          { name: 'Home', url: `${site}/` },
          { name: 'ROI Calculator', url: `${site}/calculator` },
        ]}
        jsonLd={schema}
      />
      <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-navy text-white">
        <div className="container-px max-w-5xl">
          <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>Investment Tools</div>
          <h1 className="mt-5 font-display text-5xl md:text-6xl">Property ROI<br/><span className="italic text-crimson-100">Calculator</span></h1>
          <p className="mt-5 text-white/70 text-lg max-w-2xl">Estimate rental income, net yield, and 5-year returns for any Dubai investment property.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-px max-w-5xl grid lg:grid-cols-2 gap-12">
          {/* Inputs */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-navy flex items-center gap-2"><CalcIcon size={20} className="text-crimson"/>Your Investment</h2>
            
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Purchase Price (AED)</label>
              <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full border border-navy/20 px-4 py-3 text-navy focus:border-crimson outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Down Payment: {downPayment}%</label>
              <input type="range" min={20} max={100} value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} className="w-full accent-crimson" />
              <div className="flex justify-between text-xs text-navy/50"><span>20%</span><span>AED {fmt(equity)}</span><span>100%</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Expected Gross Yield: {yieldRate}%</label>
              <input type="range" min={3} max={12} step={0.5} value={yieldRate} onChange={e => setYieldRate(Number(e.target.value))} className="w-full accent-crimson" />
              <div className="flex justify-between text-xs text-navy/50"><span>3%</span><span>12%</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Annual Service Charges (AED)</label>
              <input type="number" value={serviceCharges} onChange={e => setServiceCharges(Number(e.target.value))} className="w-full border border-navy/20 px-4 py-3 text-navy focus:border-crimson outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Annual Appreciation: {appreciation}%</label>
              <input type="range" min={0} max={10} step={0.5} value={appreciation} onChange={e => setAppreciation(Number(e.target.value))} className="w-full accent-crimson" />
              <div className="flex justify-between text-xs text-navy/50"><span>0%</span><span>10%</span></div>
            </div>
          </div>

          {/* Results */}
          <div>
            <h2 className="font-display text-2xl text-navy mb-6">Projected Returns</h2>
            <div className="bg-navy-50/40 border border-navy/10 p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-navy/10">
                <span className="text-navy/70 text-sm">Annual Gross Rental</span>
                <span className="font-display text-xl text-navy">AED {fmt(annualRental)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-navy/10">
                <span className="text-navy/70 text-sm">Annual Net Rental (after charges)</span>
                <span className="font-display text-xl text-navy">AED {fmt(netRental)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-navy/10">
                <span className="text-navy/70 text-sm">Net Yield on Equity</span>
                <span className="font-display text-xl text-crimson">{netYield.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-navy/10">
                <span className="text-navy/70 text-sm">5-Year Capital Gain</span>
                <span className="font-display text-xl text-navy">AED {fmt(capitalGain)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-navy/10">
                <span className="text-navy/70 text-sm">5-Year Total Return</span>
                <span className="font-display text-xl text-navy">AED {fmt(totalReturn)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-navy/10">
                <span className="text-navy/70 text-sm">5-Year ROI on Equity</span>
                <span className="font-display text-2xl text-crimson font-bold">{fiveYearROI.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-navy/70 text-sm">Break-even (rental only)</span>
                <span className="font-display text-xl text-navy">{breakEvenYears === Infinity ? '—' : `~${breakEvenYears} years`}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-navy/40">Estimates only. Does not include DLD transfer fee (4%), mortgage interest, vacancy, or maintenance. Consult a Karimi advisor for detailed projections.</p>
            <Link to="/contact" className="btn-primary inline-flex mt-6">Discuss With an Advisor</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container-px max-w-3xl">
          <h2 className="font-display text-3xl text-navy mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-white p-6 border border-navy/10">
                <h3 className="font-display text-lg text-navy">{f.q}</h3>
                <p className="mt-2 text-navy/70 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
