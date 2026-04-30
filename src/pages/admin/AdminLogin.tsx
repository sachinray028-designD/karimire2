import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setLoading(true);
    const fn = mode === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn.call(supabase.auth, { email, password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    nav('/admin');
  }

  const input = 'w-full bg-white border border-navy/15 px-4 py-3 focus:outline-none focus:border-crimson';
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10">
        <div className="font-display text-2xl text-navy">Karimi<span className="text-crimson">.</span> Admin</div>
        <h1 className="font-display text-3xl text-navy mt-4">{mode === 'signin' ? 'Sign in' : 'Create admin account'}</h1>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input type="email" required placeholder="Email" className={input} value={email} onChange={(e) => setEmail(e.target.value)}/>
          <input type="password" required placeholder="Password" className={input} value={password} onChange={(e) => setPassword(e.target.value)}/>
          {err && <div className="text-crimson text-sm">{err}</div>}
          <button disabled={loading} className="btn-primary w-full justify-center">
            {loading ? <Loader2 className="animate-spin" size={18}/> : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </button>
        </form>
        <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-sm text-navy/60 hover:text-crimson mt-5">
          {mode === 'signin' ? "Need to create an admin account?" : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
