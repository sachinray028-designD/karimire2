import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';

type Props = {
  propertyId?: string | null;
  propertyName?: string;
  onSuccess?: () => void;
  compact?: boolean;
};

export default function InquiryForm({ propertyId = null, propertyName = '', onSuccess, compact }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', budget: '', purpose: '' });
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErr('');
    const { error } = await supabase.from('leads').insert({
      property_id: propertyId,
      property_name: propertyName,
      ...form,
    });
    if (error) { setErr(error.message); setState('error'); return; }
    setState('done');
    onSuccess?.();
  }

  if (state === 'done') {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="mx-auto text-crimson" size={44}/>
        <h3 className="font-display text-2xl text-navy mt-4">Thank you.</h3>
        <p className="text-navy/60 mt-2 text-sm">A senior advisor will reach out within one business hour. Full project details have been unlocked on this page.</p>
        <a href="https://wa.me/971528680423" className="btn-primary mt-6 inline-flex">Continue on WhatsApp</a>
      </div>
    );
  }

  const input = 'w-full bg-white border border-navy/15 px-4 py-3 text-navy placeholder:text-navy/40 focus:outline-none focus:border-crimson transition-colors';

  return (
    <form onSubmit={submit} className={`space-y-3 ${compact ? '' : ''}`}>
      <div className="grid sm:grid-cols-2 gap-3">
        <input required placeholder="Full name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" placeholder="Email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <input required placeholder="Phone / WhatsApp" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <select className={input} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}>
          <option value="">Budget range</option>
          <option>Under AED 1M</option>
          <option>AED 1M – 3M</option>
          <option>AED 3M – 7M</option>
          <option>AED 7M – 15M</option>
          <option>AED 15M+</option>
        </select>
        <select className={input} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
          <option value="">Purpose</option>
          <option>Investment</option>
          <option>End-use</option>
          <option>Golden Visa</option>
          <option>Relocation</option>
        </select>
      </div>
      {!compact && (
        <textarea placeholder="Anything else we should know? (optional)" className={`${input} min-h-[90px]`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}/>
      )}
      {err && <div className="text-crimson text-sm">{err}</div>}
      <button disabled={state === 'loading'} className="btn-primary w-full justify-center">
        {state === 'loading' ? <Loader2 className="animate-spin" size={18}/> : 'Unlock Full Project Details'}
      </button>
      <p className="text-[11px] text-navy/50 text-center">By submitting you agree to be contacted by Karimi Real Estate. We never share your details.</p>
    </form>
  );
}
