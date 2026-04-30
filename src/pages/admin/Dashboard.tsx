import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Building2, MessageSquare, Star, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ properties: 0, leads: 0, newLeads: 0, posts: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [p, l, nl, po, r] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      setStats({ properties: p.count || 0, leads: l.count || 0, newLeads: nl.count || 0, posts: po.count || 0 });
      setRecent(r.data || []);
    })();
  }, []);

  const cards = [
    { I: Building2, l: 'Active Properties', v: stats.properties },
    { I: MessageSquare, l: 'New Leads', v: stats.newLeads },
    { I: Star, l: 'Total Leads', v: stats.leads },
    { I: BookOpen, l: 'Published Articles', v: stats.posts },
  ];

  return (
    <div className="p-10">
      <h1 className="font-display text-4xl text-navy">Dashboard</h1>
      <p className="text-navy/60 mt-2">Your business at a glance.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ I, l, v }) => (
          <div key={l} className="bg-white border border-navy/10 p-6">
            <I className="text-crimson" size={22}/>
            <div className="font-display text-4xl text-navy mt-4">{v}</div>
            <div className="text-xs tracking-[0.2em] uppercase text-navy/50 mt-2">{l}</div>
          </div>
        ))}
      </div>
      <div className="mt-10 bg-white border border-navy/10">
        <div className="p-6 border-b border-navy/10 font-display text-xl text-navy">Recent leads</div>
        <div className="divide-y divide-navy/10">
          {recent.length === 0 && <div className="p-6 text-navy/50 text-sm">No leads yet.</div>}
          {recent.map((l) => (
            <div key={l.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="font-medium text-navy">{l.name} <span className="text-navy/50 text-sm font-normal">· {l.property_name || 'General'}</span></div>
                <div className="text-xs text-navy/60 mt-1">{l.email} · {l.phone}</div>
              </div>
              <div className="text-xs text-navy/50">{new Date(l.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
