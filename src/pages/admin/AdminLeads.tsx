import { useEffect, useState } from 'react';
import { supabase, type Lead } from '../../lib/supabase';
import { Trash2, Mail, Phone } from 'lucide-react';

export default function AdminLeads() {
  const [list, setList] = useState<Lead[]>([]);
  const [filter, setFilter] = useState('');

  async function load() {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setList(data || []);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from('leads').update({ status }).eq('id', id);
    load();
  }
  async function remove(id: string) {
    if (!confirm('Delete this lead?')) return;
    await supabase.from('leads').delete().eq('id', id);
    load();
  }

  const filtered = list.filter((l) => !filter || l.status === filter);

  function exportCsv() {
    const rows = [['Name','Email','Phone','Property','Budget','Purpose','Status','Date']];
    filtered.forEach((l) => rows.push([l.name, l.email, l.phone, l.property_name, l.budget, l.purpose, l.status, new Date(l.created_at).toISOString()]));
    const csv = rows.map((r) => r.map((c) => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `karimi-leads-${Date.now()}.csv`;
    a.click();
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-4xl text-navy">Leads</h1>
        <div className="flex gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-navy/15 px-3 py-2 text-sm">
            <option value="">All</option><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option>
          </select>
          <button onClick={exportCsv} className="btn-navy !py-2 !px-4 text-xs">Export CSV</button>
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {filtered.length === 0 && <div className="bg-white p-10 text-center text-navy/50">No leads yet.</div>}
        {filtered.map((l) => (
          <div key={l.id} className="bg-white border border-navy/10 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-display text-xl text-navy">{l.name}</div>
                <div className="text-xs tracking-wider uppercase text-crimson mt-1">{l.property_name || 'General enquiry'}</div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-navy/70">
                  <a href={`mailto:${l.email}`} className="flex items-center gap-1.5"><Mail size={14}/>{l.email}</a>
                  <a href={`tel:${l.phone}`} className="flex items-center gap-1.5"><Phone size={14}/>{l.phone}</a>
                  {l.budget && <span>Budget: <b>{l.budget}</b></span>}
                  {l.purpose && <span>Purpose: <b>{l.purpose}</b></span>}
                </div>
                {l.message && <p className="mt-3 text-navy/75 text-sm bg-navy-50/40 p-3">{l.message}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)} className="border border-navy/15 px-3 py-1.5 text-sm">
                  <option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option>
                </select>
                <div className="text-xs text-navy/50">{new Date(l.created_at).toLocaleString()}</div>
                <button onClick={() => remove(l.id)} className="text-navy/40 hover:text-crimson"><Trash2 size={15}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
