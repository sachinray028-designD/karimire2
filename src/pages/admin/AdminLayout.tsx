import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Building2, MessageSquare, LogOut, Loader2, Palette } from 'lucide-react';

export default function AdminLayout() {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) nav('/admin/login');
      else setEmail(data.session.user.email || '');
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) nav('/admin/login');
      else setEmail(session.user.email || '');
    });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  async function logout() {
    await supabase.auth.signOut();
    nav('/admin/login');
  }

  if (checking) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-navy"/></div>;

  const link = 'flex items-center gap-3 px-4 py-3 text-sm rounded transition-colors';

  return (
    <div className="min-h-screen bg-navy-50/40 flex">
      <aside className="w-64 bg-navy text-white flex flex-col">
        <Link to="/" className="p-6 font-display text-2xl border-b border-white/10">Karimi<span className="text-crimson">.</span></Link>
        <nav className="p-4 space-y-1 flex-1">
          <NavLink to="/admin" end className={({ isActive }) => `${link} ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}><LayoutDashboard size={17}/>Dashboard</NavLink>
          <NavLink to="/admin/properties" className={({ isActive }) => `${link} ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}><Building2 size={17}/>Properties</NavLink>
          <NavLink to="/admin/leads" className={({ isActive }) => `${link} ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}><MessageSquare size={17}/>Leads</NavLink>
          <NavLink to="/admin/theme" className={({ isActive }) => `${link} ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}><Palette size={17}/>Theme Editor</NavLink>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-3 truncate">{email}</div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-white/80 hover:text-white"><LogOut size={15}/>Sign out</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet/>
      </main>
    </div>
  );
}
