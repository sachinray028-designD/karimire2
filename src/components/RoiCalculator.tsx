import { useMemo, useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

export default function RoiCalculator() {
  const [price, setPrice] = useState(2500000);
  const [down, setDown] = useState(20);
  const [yieldPct, setYieldPct] = useState(7);
  const [appreciation, setAppreciation] = useState(8);
  const [years, setYears] = useState(5);

  const results = useMemo(() => {
    const downPayment = (price * down) / 100;
    const annualRent = (price * yieldPct) / 100;
    const totalRent = annualRent * years;
    const futureValue = price * Math.pow(1 + appreciation / 100, years);
    const capitalGain = futureValue - price;
    const totalReturn = totalRent + capitalGain;
    const roi = (totalReturn / downPayment) * 100;
    return { downPayment, annualRent, totalRent, futureValue, capitalGain, totalReturn, roi };
  }, [price, down, yieldPct, appreciation, years]);

  const fmt = (n: number) => `AED ${Math.round(n).toLocaleString()}`;

  const slider = 'w-full accent-crimson';

  return (
    <div className="bg-white border border-navy/10 shadow-xl">
      <div className="grid lg:grid-cols-5">
        <div className="lg:col-span-3 p-8 md:p-10 space-y-7 border-r border-navy/10">
          <div className="flex items-center gap-3">
            <Calculator className="text-crimson" size={22}/>
            <div>
              <div className="eyebrow"><span className="w-6 h-px bg-crimson"/>ROI Intelligence</div>
              <h3 className="font-display text-2xl md:text-3xl text-navy mt-1">Model your Dubai investment</h3>
            </div>
          </div>
          {[
            { l: 'Property Price', v: fmt(price), min: 500000, max: 25000000, step: 50000, val: price, set: setPrice },
            { l: 'Down Payment %', v: `${down}%`, min: 10, max: 50, step: 5, val: down, set: setDown },
            { l: 'Annual Rental Yield %', v: `${yieldPct}%`, min: 4, max: 12, step: 0.5, val: yieldPct, set: setYieldPct },
            { l: 'Annual Appreciation %', v: `${appreciation}%`, min: 2, max: 15, step: 0.5, val: appreciation, set: setAppreciation },
            { l: 'Holding Period (years)', v: `${years} yr`, min: 1, max: 15, step: 1, val: years, set: setYears },
          ].map((s) => (
            <div key={s.l}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-navy/70 tracking-wide uppercase">{s.l}</span>
                <span className="font-display text-navy">{s.v}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                onChange={(e) => s.set(Number(e.target.value))} className={slider}/>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 bg-navy text-white p-8 md:p-10">
          <div className="flex items-center gap-2 text-crimson-200 text-[11px] tracking-[0.3em] uppercase"><TrendingUp size={15}/>Projected outcome</div>
          <div className="mt-5 pb-5 border-b border-white/10">
            <div className="text-sm text-white/60">Total ROI on cash invested</div>
            <div className="font-display text-5xl md:text-6xl text-crimson-200 mt-1">{Math.round(results.roi)}%</div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            {[
              ['Down payment', fmt(results.downPayment)],
              ['Annual rental income', fmt(results.annualRent)],
              ['Rent over period', fmt(results.totalRent)],
              ['Projected capital gain', fmt(results.capitalGain)],
              ['Future property value', fmt(results.futureValue)],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between"><span className="text-white/60">{l}</span><span>{v}</span></div>
            ))}
          </div>
          <a href="/contact" className="btn-primary w-full justify-center mt-7">Discuss With an Advisor</a>
          <p className="text-[11px] text-white/40 mt-4">Estimates only. Actual returns vary with market conditions, location, and service charges.</p>
        </div>
      </div>
    </div>
  );
}
