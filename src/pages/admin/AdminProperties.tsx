import { useEffect, useState } from 'react';
import { supabase, type Property } from '../../lib/supabase';
import { Eye, EyeOff, Trash2, Plus, Save, X } from 'lucide-react';
import { formatAED } from '../../lib/useReveal';

const blank = {
  slug: '', project_name: '', developer_name: '', location: '', property_type: 'Apartment',
  configurations: [] as string[], starting_price: 0, down_payment_percent: 20, handover_date: '',
  status: 'Off-Plan', overview: '', hero_images: [] as string[], featured: false, active: true,
};

export default function AdminProperties() {
  const [list, setList] = useState<Property[]>([]);
  const [editing, setEditing] = useState<Partial<Property> | null>(null);

  async function load() {
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    setList(data || []);
  }
  useEffect(() => { load(); }, []);

  async function toggleActive(p: Property) {
    await supabase.from('properties').update({ active: !p.active }).eq('id', p.id);
    load();
  }
  async function remove(p: Property) {
    if (!confirm(`Delete ${p.project_name}?`)) return;
    await supabase.from('properties').delete().eq('id', p.id);
    load();
  }
  async function save() {
    if (!editing) return;
    const payload = {
      ...editing,
      slug: editing.slug || (editing.project_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      configurations: Array.isArray(editing.configurations) ? editing.configurations : [],
      hero_images: Array.isArray(editing.hero_images) ? editing.hero_images : [],
    };
    if (editing.id) await supabase.from('properties').update(payload).eq('id', editing.id);
    else await supabase.from('properties').insert(payload);
    setEditing(null);
    load();
  }

  const input = 'w-full bg-white border border-navy/15 px-3 py-2 text-sm focus:outline-none focus:border-crimson';

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-navy">Properties</h1>
        <button onClick={() => setEditing(blank)} className="btn-primary"><Plus size={16}/>New Property</button>
      </div>
      <div className="mt-8 bg-white border border-navy/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-50/50 text-navy/70 text-left text-xs uppercase tracking-wider">
            <tr><th className="p-4">Project</th><th className="p-4">Location</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4">Active</th><th className="p-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-navy-50/30">
                <td className="p-4">
                  <div className="font-medium text-navy">{p.project_name}</div>
                  <div className="text-xs text-navy/50">{p.developer_name}</div>
                </td>
                <td className="p-4 text-navy/70">{p.location}</td>
                <td className="p-4 text-navy/70">{formatAED(p.starting_price, p.currency)}</td>
                <td className="p-4"><span className="text-xs bg-navy text-white px-2 py-1">{p.status}</span></td>
                <td className="p-4"><button onClick={() => toggleActive(p)}>{p.active ? <Eye size={16} className="text-crimson"/> : <EyeOff size={16} className="text-navy/40"/>}</button></td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => setEditing(p)} className="text-sm text-navy hover:text-crimson">Edit</button>
                  <button onClick={() => remove(p)} className="text-navy/40 hover:text-crimson"><Trash2 size={15}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-navy/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-5 border-b border-navy/10">
              <h3 className="font-display text-2xl text-navy">{editing.id ? 'Edit' : 'New'} Property</h3>
              <button onClick={() => setEditing(null)}><X/></button>
            </div>
            <div className="p-6 space-y-3">
              <input placeholder="Project name" className={input} value={editing.project_name || ''} onChange={(e) => setEditing({ ...editing, project_name: e.target.value })}/>
              <input placeholder="Slug (auto)" className={input} value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })}/>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Developer" className={input} value={editing.developer_name || ''} onChange={(e) => setEditing({ ...editing, developer_name: e.target.value })}/>
                <input placeholder="Location" className={input} value={editing.location || ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })}/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select className={input} value={editing.property_type || 'Apartment'} onChange={(e) => setEditing({ ...editing, property_type: e.target.value })}>
                  <option>Apartment</option><option>Villa</option><option>Townhouse</option>
                </select>
                <select className={input} value={editing.status || 'Off-Plan'} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option>Off-Plan</option><option>Ready</option><option>Sold Out</option>
                </select>
                <input placeholder="Handover" className={input} value={editing.handover_date || ''} onChange={(e) => setEditing({ ...editing, handover_date: e.target.value })}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Starting price (AED)" className={input} value={editing.starting_price || 0} onChange={(e) => setEditing({ ...editing, starting_price: Number(e.target.value) })}/>
                <input type="number" placeholder="Down payment %" className={input} value={editing.down_payment_percent || 20} onChange={(e) => setEditing({ ...editing, down_payment_percent: Number(e.target.value) })}/>
              </div>
              <input placeholder="Configurations (comma-separated: Studio,1BR,2BR)" className={input}
                value={(editing.configurations || []).join(',')}
                onChange={(e) => setEditing({ ...editing, configurations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}/>
              <input placeholder="Hero image URL" className={input}
                value={(editing.hero_images || [])[0] || ''}
                onChange={(e) => setEditing({ ...editing, hero_images: [e.target.value] })}/>
              <textarea placeholder="Overview" className={`${input} min-h-[100px]`} value={editing.overview || ''} onChange={(e) => setEditing({ ...editing, overview: e.target.value })}/>
              <div className="flex gap-5 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}/>Featured</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.active !== false} onChange={(e) => setEditing({ ...editing, active: e.target.checked })}/>Active</label>
              </div>
            </div>
            <div className="p-5 border-t border-navy/10 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 border border-navy/15 text-sm text-navy">Cancel</button>
              <button onClick={save} className="btn-primary"><Save size={15}/>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
