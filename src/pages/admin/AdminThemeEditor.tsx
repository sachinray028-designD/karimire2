import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CONTENT_DEFAULTS, ContentEntry, parsePageGroup } from '../../lib/contentDefaults';
import { useContent } from '../../lib/content';
import { useSeoContext, PageSeo, SeoGlobal } from '../../lib/seo';
import MediaUploader from '../../components/admin/MediaUploader';
import { Search, Save, RotateCcw, Check, Loader2, Globe, FileText, LayoutGrid as LayoutIcon, Settings, ChevronDown, ChevronRight, Eye, EyeOff, Link2, Tag, BarChart } from 'lucide-react';

type Tab = 'content' | 'sections' | 'seo-global' | 'seo-pages' | 'seo-analytics' | 'seo-schema' | 'seo-robots';

const SEO_PAGES = [
  { key: 'home', label: 'Home', route: '/' },
  { key: 'properties', label: 'Properties', route: '/properties' },
  { key: 'developers', label: 'Developers', route: '/developers' },
  { key: 'insights', label: 'Insights', route: '/insights' },
  { key: 'about', label: 'About', route: '/about' },
  { key: 'contact', label: 'Contact', route: '/contact' },
  { key: 'privacy', label: 'Privacy', route: '/privacy' },
  { key: 'terms', label: 'Terms', route: '/terms' },
  { key: 'notfound', label: '404', route: '*' },
];

export default function AdminThemeEditor() {
  const { refresh } = useContent();
  const { refresh: refreshSeo } = useSeoContext();
  const [tab, setTab] = useState<Tab>('content');

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(CONTENT_DEFAULTS.map((c) => [c.key, c.value]))
  );
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState('');
  const [activePage, setActivePage] = useState<string>('Global');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const [seoGlobal, setSeoGlobal] = useState<SeoGlobal | null>(null);
  const [seoGlobalDirty, setSeoGlobalDirty] = useState(false);
  const [seoPages, setSeoPages] = useState<Record<string, PageSeo>>({});
  const [activeSeoPage, setActiveSeoPage] = useState('home');
  const [seoPageDirty, setSeoPageDirty] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const [content, seoG, seoP] = await Promise.all([
        supabase.from('site_content').select('key,value'),
        supabase.from('seo_global').select('*').eq('id', 'singleton').maybeSingle(),
        supabase.from('page_seo').select('*'),
      ]);
      if (content.data) {
        setValues((prev) => {
          const next = { ...prev };
          for (const row of content.data) next[row.key] = row.value;
          return next;
        });
      }
      if (seoG.data) setSeoGlobal(seoG.data as SeoGlobal);
      if (seoP.data) {
        const m: Record<string, PageSeo> = {};
        for (const r of seoP.data as PageSeo[]) m[r.page_key] = r;
        setSeoPages(m);
      }
      setLoading(false);
    })();
  }, []);

  const pageIndex = useMemo(() => {
    const map = new Map<string, { group: string; entries: ContentEntry[] }[]>();
    for (const c of CONTENT_DEFAULTS) {
      const { page, group } = parsePageGroup(c.section);
      if (!map.has(page)) map.set(page, []);
      const arr = map.get(page)!;
      let g = arr.find((x) => x.group === group);
      if (!g) {
        g = { group, entries: [] };
        arr.push(g);
      }
      g.entries.push({ ...c, page, group });
    }
    return map;
  }, []);

  const pageList = useMemo(() => Array.from(pageIndex.keys()), [pageIndex]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = pageIndex.get(activePage) || [];
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        entries: g.entries.filter(
          (c) =>
            c.key.toLowerCase().includes(q) ||
            c.label.toLowerCase().includes(q) ||
            (values[c.key] || '').toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.entries.length > 0);
  }, [query, activePage, pageIndex, values]);

  function update(key: string, value: string) {
    setValues((p) => ({ ...p, [key]: value }));
    setDirty((p) => ({ ...p, [key]: true }));
    setSaved(false);
  }

  function resetOne(key: string) {
    const def = CONTENT_DEFAULTS.find((c) => c.key === key);
    if (!def) return;
    update(key, def.value);
  }

  async function saveAll() {
    setSaving(true);
    try {
      const contentKeys = Object.keys(dirty).filter((k) => dirty[k]);
      if (contentKeys.length > 0) {
        const rows = contentKeys.map((k) => {
          const def = CONTENT_DEFAULTS.find((c) => c.key === k);
          return {
            key: k,
            value: values[k] ?? '',
            type: def?.type || 'text',
            section: def?.section || 'general',
            label: def?.label || k,
            updated_at: new Date().toISOString(),
          };
        });
        const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' });
        if (error) throw error;
      }

      if (seoGlobalDirty && seoGlobal) {
        const { error } = await supabase.from('seo_global').upsert({ ...seoGlobal, id: 'singleton', updated_at: new Date().toISOString() });
        if (error) throw error;
      }

      const dirtySeoPages = Object.keys(seoPageDirty).filter((k) => seoPageDirty[k]);
      if (dirtySeoPages.length > 0) {
        const rows = dirtySeoPages.map((k) => ({ ...seoPages[k], updated_at: new Date().toISOString() }));
        const { error } = await supabase.from('page_seo').upsert(rows, { onConflict: 'page_key' });
        if (error) throw error;
      }

      setDirty({});
      setSeoGlobalDirty(false);
      setSeoPageDirty({});
      setSaved(true);
      await refresh();
      await refreshSeo();
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert('Save failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  }

  const dirtyCount =
    Object.values(dirty).filter(Boolean).length +
    (seoGlobalDirty ? 1 : 0) +
    Object.values(seoPageDirty).filter(Boolean).length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-navy" /></div>;
  }

  function renderContentField(c: ContentEntry) {
    const v = values[c.key] ?? '';
    if (c.type === 'toggle') {
      const isOn = v === 'true';
      return (
        <button
          type="button"
          onClick={() => update(c.key, isOn ? 'false' : 'true')}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isOn ? 'bg-green-500' : 'bg-navy/20'}`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      );
    }
    if (c.type === 'image') {
      const pairedMobileKey = `${c.key}.mobile`;
      const pairedAltKey = `${c.key}.alt`;
      return (
        <MediaUploader
          desktopUrl={v}
          mobileUrl={values[pairedMobileKey] ?? ''}
          altText={values[pairedAltKey] ?? ''}
          onChange={(d, m, alt) => {
            setValues((p) => ({ ...p, [c.key]: d, [pairedMobileKey]: m, [pairedAltKey]: alt }));
            setDirty((p) => ({ ...p, [c.key]: true, [pairedMobileKey]: true, [pairedAltKey]: true }));
            setSaved(false);
          }}
        />
      );
    }
    if (c.type === 'longtext') {
      return (
        <textarea
          value={v}
          onChange={(ev) => update(c.key, ev.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-white border border-navy/15 text-sm focus:outline-none focus:border-crimson"
        />
      );
    }
    return (
      <input
        value={v}
        onChange={(ev) => update(c.key, ev.target.value)}
        className="w-full px-3 py-2 bg-white border border-navy/15 text-sm focus:outline-none focus:border-crimson"
      />
    );
  }

  function updatePageSeo(key: string, field: keyof PageSeo, val: string) {
    setSeoPages((p) => ({ ...p, [key]: { ...(p[key] || ({ page_key: key, route: '/' } as PageSeo)), [field]: val } }));
    setSeoPageDirty((p) => ({ ...p, [key]: true }));
  }

  function updateGlobalSeo(field: keyof SeoGlobal, val: string) {
    setSeoGlobal((g) => (g ? { ...g, [field]: val } : g));
    setSeoGlobalDirty(true);
  }

  const curPage = seoPages[activeSeoPage];

  return (
    <div className="flex min-h-screen bg-navy/5">
      <aside className="w-64 bg-white border-r border-navy/10 flex-shrink-0">
        <div className="p-4 border-b border-navy/10">
          <h1 className="font-display text-lg text-navy">Theme Editor</h1>
          <p className="text-[10px] text-navy/50 mt-1">Content · SEO · Media</p>
        </div>
        <nav className="p-3 space-y-1">
          <SidebarBtn icon={<LayoutIcon size={14} />} active={tab === 'content'} onClick={() => setTab('content')}>Content & Pages</SidebarBtn>
          <SidebarBtn icon={<Eye size={14} />} active={tab === 'sections'} onClick={() => setTab('sections')}>Section Visibility</SidebarBtn>
          <SidebarBtn icon={<Globe size={14} />} active={tab === 'seo-global'} onClick={() => setTab('seo-global')}>SEO · Global</SidebarBtn>
          <SidebarBtn icon={<FileText size={14} />} active={tab === 'seo-pages'} onClick={() => setTab('seo-pages')}>SEO · Per-Page</SidebarBtn>
          <SidebarBtn icon={<Tag size={14} />} active={tab === 'seo-schema'} onClick={() => setTab('seo-schema')}>SEO · Schema</SidebarBtn>
          <SidebarBtn icon={<BarChart size={14} />} active={tab === 'seo-analytics'} onClick={() => setTab('seo-analytics')}>Analytics</SidebarBtn>
          <SidebarBtn icon={<Settings size={14} />} active={tab === 'seo-robots'} onClick={() => setTab('seo-robots')}>Robots & Sitemap</SidebarBtn>
        </nav>
        {tab === 'content' && (
          <div className="border-t border-navy/10 p-3">
            <div className="text-[10px] uppercase tracking-wider text-navy/40 mb-2 px-2">Pages</div>
            <div className="space-y-0.5">
              {pageList.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePage(p)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${activePage === p ? 'bg-navy text-white' : 'text-navy/70 hover:bg-navy/5'}`}
                >{p}</button>
              ))}
            </div>
          </div>
        )}
        {tab === 'seo-pages' && (
          <div className="border-t border-navy/10 p-3">
            <div className="text-[10px] uppercase tracking-wider text-navy/40 mb-2 px-2">Pages</div>
            <div className="space-y-0.5">
              {SEO_PAGES.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setActiveSeoPage(p.key)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${activeSeoPage === p.key ? 'bg-navy text-white' : 'text-navy/70 hover:bg-navy/5'}`}
                >
                  {p.label}
                  <span className="block text-[9px] opacity-60 font-mono">{p.route}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-navy/10 z-10 px-6 py-3 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-navy/15 text-sm focus:outline-none focus:border-crimson"
            />
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-green-600 text-sm flex items-center gap-1"><Check size={14} />Saved</span>}
            <button
              onClick={saveAll}
              disabled={dirtyCount === 0 || saving}
              className="bg-crimson text-white px-5 py-2 text-sm flex items-center gap-2 disabled:opacity-40 hover:bg-crimson-600 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save {dirtyCount > 0 && `(${dirtyCount})`}
            </button>
          </div>
        </div>

        <div className="p-6">
          {tab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-2xl text-navy">{activePage}</h2>
                <span className="text-xs text-navy/50">{filtered.reduce((n, g) => n + g.entries.length, 0)} fields</span>
              </div>
              {filtered.map((g) => {
                const gid = `${activePage}/${g.group}`;
                const open = openGroups[gid] !== false;
                return (
                  <div key={gid} className="bg-white border border-navy/10">
                    <button
                      onClick={() => setOpenGroups((o) => ({ ...o, [gid]: !open }))}
                      className="w-full flex items-center justify-between px-5 py-3 bg-navy text-white"
                    >
                      <div className="flex items-center gap-2">
                        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="text-xs tracking-[0.25em] uppercase font-medium">{g.group}</span>
                      </div>
                      <span className="text-[10px] opacity-70">{g.entries.length} fields</span>
                    </button>
                    {open && (
                      <div className="divide-y divide-navy/5">
                        {g.entries.map((c) => (
                          <div key={c.key} className="p-5 grid md:grid-cols-[260px_1fr_auto] gap-4 items-start">
                            <div>
                              <div className="text-sm font-medium text-navy">{c.label}</div>
                              <div className="text-[10px] text-navy/50 font-mono mt-1 break-all">{c.key}</div>
                              <div className="text-[10px] text-crimson/80 uppercase tracking-wider mt-1">{c.type}</div>
                            </div>
                            <div>{renderContentField(c)}</div>
                            <div className="flex items-center gap-2 justify-end">
                              {dirty[c.key] && <span className="w-1.5 h-1.5 rounded-full bg-crimson" />}
                              <button
                                onClick={() => resetOne(c.key)}
                                title="Reset to default"
                                className="text-navy/40 hover:text-crimson transition-colors p-1"
                              >
                                <RotateCcw size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-16 text-navy/50">No fields match your search.</div>
              )}
            </div>
          )}

          {tab === 'sections' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="font-display text-2xl text-navy">Section Visibility</h2>
                <p className="text-sm text-navy/60 mt-1">Toggle sections on or off for each page. Hidden sections won't render on the frontend.</p>
              </div>
              {CONTENT_DEFAULTS.filter((c) => c.type === 'toggle' && c.key.startsWith('sections.')).reduce<{ page: string; entries: typeof CONTENT_DEFAULTS }[]>((acc, c) => {
                const page = c.section.replace('Section Visibility · ', '');
                let group = acc.find((g) => g.page === page);
                if (!group) { group = { page, entries: [] }; acc.push(group); }
                group.entries.push(c);
                return acc;
              }, []).map((group) => (
                <div key={group.page} className="bg-white border border-navy/10">
                  <div className="px-5 py-3 bg-navy text-white text-xs tracking-[0.25em] uppercase font-medium">{group.page}</div>
                  <div className="divide-y divide-navy/5">
                    {group.entries.map((c) => {
                      const isOn = (values[c.key] ?? c.value) === 'true';
                      return (
                        <div key={c.key} className="px-5 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isOn ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-navy/30" />}
                            <span className={`text-sm ${isOn ? 'text-navy' : 'text-navy/40 line-through'}`}>{c.label}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => update(c.key, isOn ? 'false' : 'true')}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isOn ? 'bg-green-500' : 'bg-navy/20'}`}
                          >
                            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'seo-global' && seoGlobal && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="font-display text-2xl text-navy">SEO · Global Defaults</h2>
                <p className="text-sm text-navy/60 mt-1">Applies to every page unless overridden.</p>
              </div>
              <SeoCard title="Site">
                <Field label="Site name" value={seoGlobal.site_name} onChange={(v) => updateGlobalSeo('site_name', v)} />
                <Field label="Site URL" value={seoGlobal.site_url} onChange={(v) => updateGlobalSeo('site_url', v)} help="Used as canonical base + in sitemap.xml" />
                <Field label="Default title" value={seoGlobal.default_title} onChange={(v) => updateGlobalSeo('default_title', v)} counter={{ min: 30, max: 60 }} />
                <Field label="Default description" value={seoGlobal.default_description} onChange={(v) => updateGlobalSeo('default_description', v)} multiline counter={{ min: 70, max: 160 }} />
                <Field label="Default OG image (desktop)" value={seoGlobal.default_og_image} onChange={(v) => updateGlobalSeo('default_og_image', v)} />
                <Field label="Default OG image (mobile)" value={seoGlobal.default_og_image_mobile} onChange={(v) => updateGlobalSeo('default_og_image_mobile', v)} />
                <Field label="Default robots" value={seoGlobal.default_robots} onChange={(v) => updateGlobalSeo('default_robots', v)} />
              </SeoCard>
              <SeoCard title="Social">
                <Field label="Twitter handle" value={seoGlobal.twitter_handle} onChange={(v) => updateGlobalSeo('twitter_handle', v)} />
                <Field label="Facebook URL" value={seoGlobal.facebook_url} onChange={(v) => updateGlobalSeo('facebook_url', v)} />
                <Field label="Instagram URL" value={seoGlobal.instagram_url} onChange={(v) => updateGlobalSeo('instagram_url', v)} />
                <Field label="LinkedIn URL" value={seoGlobal.linkedin_url} onChange={(v) => updateGlobalSeo('linkedin_url', v)} />
                <Field label="YouTube URL" value={seoGlobal.youtube_url} onChange={(v) => updateGlobalSeo('youtube_url', v)} />
              </SeoCard>
              <SeoCard title="Verification">
                <Field label="Google Search Console" value={seoGlobal.google_verification} onChange={(v) => updateGlobalSeo('google_verification', v)} />
                <Field label="Bing Webmaster" value={seoGlobal.bing_verification} onChange={(v) => updateGlobalSeo('bing_verification', v)} />
              </SeoCard>
            </div>
          )}

          {tab === 'seo-pages' && curPage && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="font-display text-2xl text-navy">SEO · {SEO_PAGES.find((p) => p.key === activeSeoPage)?.label}</h2>
                <p className="text-sm text-navy/60 mt-1 flex items-center gap-2"><Link2 size={12} />{curPage.route}</p>
              </div>
              <SeoSerpPreview title={curPage.title} description={curPage.description} url={curPage.canonical} />
              <SeoCard title="Meta">
                <Field label="Title" value={curPage.title} onChange={(v) => updatePageSeo(activeSeoPage, 'title', v)} counter={{ min: 30, max: 60 }} />
                <Field label="Meta description" value={curPage.description} onChange={(v) => updatePageSeo(activeSeoPage, 'description', v)} multiline counter={{ min: 70, max: 160 }} />
                <Field label="Canonical URL" value={curPage.canonical} onChange={(v) => updatePageSeo(activeSeoPage, 'canonical', v)} />
                <Field label="Focus keyword" value={curPage.focus_keyword} onChange={(v) => updatePageSeo(activeSeoPage, 'focus_keyword', v)} />
                <Field label="Keywords" value={curPage.keywords} onChange={(v) => updatePageSeo(activeSeoPage, 'keywords', v)} multiline />
                <Field label="Robots" value={curPage.robots} onChange={(v) => updatePageSeo(activeSeoPage, 'robots', v)} help="e.g. index,follow or noindex,nofollow" />
              </SeoCard>
              <SeoCard title="Social (Open Graph)">
                <Field label="OG title" value={curPage.og_title} onChange={(v) => updatePageSeo(activeSeoPage, 'og_title', v)} />
                <Field label="OG description" value={curPage.og_description} onChange={(v) => updatePageSeo(activeSeoPage, 'og_description', v)} multiline />
                <Field label="OG image (desktop 1200×630)" value={curPage.og_image_desktop} onChange={(v) => updatePageSeo(activeSeoPage, 'og_image_desktop', v)} />
                <Field label="OG image (mobile/square)" value={curPage.og_image_mobile} onChange={(v) => updatePageSeo(activeSeoPage, 'og_image_mobile', v)} />
                <Field label="Twitter card" value={curPage.twitter_card} onChange={(v) => updatePageSeo(activeSeoPage, 'twitter_card', v)} />
              </SeoCard>
              <SeoCard title="Advanced">
                <Field label="JSON-LD schema override" value={curPage.schema_jsonld} onChange={(v) => updatePageSeo(activeSeoPage, 'schema_jsonld', v)} multiline mono />
                <Field label="Extra head HTML / script" value={curPage.head_extra} onChange={(v) => updatePageSeo(activeSeoPage, 'head_extra', v)} multiline mono />
              </SeoCard>
            </div>
          )}

          {tab === 'seo-schema' && seoGlobal && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="font-display text-2xl text-navy">SEO · Structured Data (JSON-LD)</h2>
                <p className="text-sm text-navy/60 mt-1">These blocks are injected on every page so Google understands your business.</p>
              </div>
              <SeoCard title="Organization">
                <Field label="Organization JSON-LD" value={seoGlobal.organization_jsonld} onChange={(v) => updateGlobalSeo('organization_jsonld', v)} multiline mono />
              </SeoCard>
              <SeoCard title="Local Business">
                <Field label="LocalBusiness JSON-LD" value={seoGlobal.local_business_jsonld} onChange={(v) => updateGlobalSeo('local_business_jsonld', v)} multiline mono />
              </SeoCard>
              <SeoCard title="hreflang">
                <Field label="hreflang JSON array" value={seoGlobal.hreflang_json} onChange={(v) => updateGlobalSeo('hreflang_json', v)} multiline mono help='[{"lang":"en","href":"https://karimi.ae/"}]' />
              </SeoCard>
            </div>
          )}

          {tab === 'seo-analytics' && seoGlobal && (
            <div className="max-w-3xl space-y-6">
              <h2 className="font-display text-2xl text-navy">Analytics</h2>
              <SeoCard title="Tracking IDs">
                <Field label="GA4 Measurement ID" value={seoGlobal.ga4_id} onChange={(v) => updateGlobalSeo('ga4_id', v)} help="G-XXXXXXXXXX" />
                <Field label="GTM Container ID" value={seoGlobal.gtm_id} onChange={(v) => updateGlobalSeo('gtm_id', v)} help="GTM-XXXXXX" />
                <Field label="Facebook Pixel ID" value={seoGlobal.facebook_pixel_id} onChange={(v) => updateGlobalSeo('facebook_pixel_id', v)} />
              </SeoCard>
            </div>
          )}

          {tab === 'seo-robots' && seoGlobal && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="font-display text-2xl text-navy">Robots & Sitemap</h2>
                <p className="text-sm text-navy/60 mt-1">Sitemap.xml is generated at build time from Supabase. Edit robots.txt here.</p>
              </div>
              <SeoCard title="robots.txt">
                <Field label="robots.txt content" value={seoGlobal.robots_txt} onChange={(v) => updateGlobalSeo('robots_txt', v)} multiline mono rows={10} />
              </SeoCard>
              <div className="bg-white border border-navy/10 p-5">
                <div className="flex items-center gap-2 text-sm text-navy">
                  <Eye size={14} /> Sitemap preview
                </div>
                <p className="text-xs text-navy/60 mt-2">
                  Sitemap will include: all SEO-managed pages, all active properties, all published blog posts.
                  Served at <code className="font-mono text-crimson">/sitemap.xml</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarBtn({ icon, active, onClick, children }: { icon: React.ReactNode; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${active ? 'bg-navy text-white' : 'text-navy/70 hover:bg-navy/5'}`}
    >
      {icon}
      {children}
    </button>
  );
}

function SeoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-navy/10">
      <div className="px-5 py-3 border-b border-navy/10 text-xs tracking-[0.25em] uppercase font-medium text-navy">{title}</div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, multiline, mono, counter, help, rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  mono?: boolean;
  counter?: { min: number; max: number };
  help?: string;
  rows?: number;
}) {
  const len = value?.length || 0;
  const inRange = counter ? len >= counter.min && len <= counter.max : true;
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-navy">{label}</span>
        {counter && (
          <span className={`text-[10px] ${inRange ? 'text-green-600' : len > counter.max ? 'text-crimson' : 'text-amber-600'}`}>
            {len} / {counter.max}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`w-full px-3 py-2 bg-white border border-navy/15 text-sm focus:outline-none focus:border-crimson ${mono ? 'font-mono' : ''}`}
        />
      ) : (
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 bg-white border border-navy/15 text-sm focus:outline-none focus:border-crimson ${mono ? 'font-mono' : ''}`}
        />
      )}
      {help && <p className="text-[10px] text-navy/50 mt-1">{help}</p>}
    </label>
  );
}

function SeoSerpPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="bg-white border border-navy/10 p-5">
      <div className="text-[10px] uppercase tracking-wider text-navy/40 mb-3">Google preview</div>
      <div className="text-xs text-[#202124] truncate">{url || 'https://karimi.ae/'}</div>
      <div className="text-[#1a0dab] text-lg font-medium mt-1 line-clamp-2">{title || 'Page title'}</div>
      <div className="text-[#4d5156] text-sm mt-1 line-clamp-2">{description || 'Meta description will appear here.'}</div>
    </div>
  );
}
