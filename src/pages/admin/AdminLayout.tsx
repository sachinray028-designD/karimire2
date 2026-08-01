import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Building2, MessageSquare, LogOut, Loader2, Palette, ShieldAlert } from 'lucide-react';

export default function AdminLayout() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    async function checkAdmin(userId: string, userEmail: string) {
      // Verify user is in the admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        // Not an admin — sign them out and redirect
        await supabase.auth.signOut();
        setAuthorized(false);
        setChecking(false);
        return;
      }

      setAuthorized(true);
      setEmail(userEmail);
      setChecking(false);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        nav('/admin/login');
        setChecking(false);
      } else {
        checkAdmin(data.session.user.id, data.session.user.email || '');
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        nav('/admin/login');
        setAuthorized(false);
      } else {
        checkAdmin(session.user.id, session.user.email || '');
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  async function logout() {
    await supabase.auth.signOut();
    nav('/admin/login');
  }

  if (checking) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-navy"/></div>;

  if (!authorized) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-10 text-center">
          <ShieldAlert className="mx-auto text-crimson mb-4" size={48}/>
          <h1 className="font-display text-2xl text-navy mb-2">Access Denied</h1>
          <p className="text-navy/60 mb-6">Your account does not have admin privileges. Contact the site administrator.</p>
          <button onClick={() => nav('/admin/login')} className="btn-primary">Back to login</button>
        </div>
      </div>
    );
  }

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
