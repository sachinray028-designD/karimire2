import { useEffect, useRef, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type MediaRow = {
  id: string;
  filename: string;
  desktop_url: string;
  mobile_url: string;
  alt: string;
  width: number;
  height: number;
  size_bytes: number;
};

async function resize(file: File, maxWidth: number): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.85)!);
}

async function uploadVariant(blob: Blob, prefix: string, variant: string): Promise<string> {
  const path = `${prefix}-${variant}.jpg`;
  const { error } = await supabase.storage.from('site-media').upload(path, blob, {
    cacheControl: '31536000',
    upsert: true,
    contentType: 'image/jpeg',
  });
  if (error) throw error;
  const { data } = supabase.storage.from('site-media').getPublicUrl(path);
  return data.publicUrl;
}

type Props = {
  desktopUrl: string;
  mobileUrl: string;
  altText: string;
  onChange: (desktop: string, mobile: string, alt: string) => void;
};

export default function MediaUploader({ desktopUrl, mobileUrl, altText, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showLib, setShowLib] = useState(false);
  const [library, setLibrary] = useState<MediaRow[]>([]);
  const [libLoading, setLibLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadLibrary() {
    setLibLoading(true);
    const { data } = await supabase.from('media_library').select('*').order('uploaded_at', { ascending: false }).limit(60);
    setLibrary((data as MediaRow[]) || []);
    setLibLoading(false);
  }

  useEffect(() => {
    if (showLib) loadLibrary();
  }, [showLib]);

  async function handleFile(file: File) {
    setError('');
    setBusy(true);
    try {
      const ts = Date.now();
      const base = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40);
      const prefix = `${ts}-${base}`;
      const [desktopBlob, mobileBlob] = await Promise.all([resize(file, 2400), resize(file, 800)]);
      const [desktop, mobile] = await Promise.all([
        uploadVariant(desktopBlob, prefix, 'desktop'),
        uploadVariant(mobileBlob, prefix, 'mobile'),
      ]);
      const bmp = await createImageBitmap(file);
      await supabase.from('media_library').insert({
        filename: file.name,
        desktop_url: desktop,
        mobile_url: mobile,
        alt: altText,
        width: bmp.width,
        height: bmp.height,
        size_bytes: file.size,
        mime_type: file.type,
      });
      onChange(desktop, mobile, altText);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  function pickFromLibrary(row: MediaRow) {
    onChange(row.desktop_url, row.mobile_url || row.desktop_url, altText || row.alt);
    setShowLib(false);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-navy/60">Desktop</label>
          <input
            value={desktopUrl}
            onChange={(e) => onChange(e.target.value, mobileUrl, altText)}
            placeholder="https://..."
            className="w-full px-3 py-2 bg-white border border-navy/15 text-xs font-mono focus:outline-none focus:border-crimson"
          />
          {desktopUrl ? (
            <img src={desktopUrl} alt="" className="h-24 w-full object-cover border border-navy/10" />
          ) : (
            <div className="h-24 bg-navy/5 border border-navy/10 flex items-center justify-center text-navy/30">
              <ImageIcon size={20} />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-navy/60">Mobile</label>
          <input
            value={mobileUrl}
            onChange={(e) => onChange(desktopUrl, e.target.value, altText)}
            placeholder="https://... (leave blank to reuse desktop)"
            className="w-full px-3 py-2 bg-white border border-navy/15 text-xs font-mono focus:outline-none focus:border-crimson"
          />
          {mobileUrl ? (
            <img src={mobileUrl} alt="" className="h-24 w-full object-cover border border-navy/10" />
          ) : (
            <div className="h-24 bg-navy/5 border border-navy/10 flex items-center justify-center text-navy/30 text-[10px]">
              uses desktop
            </div>
          )}
        </div>
      </div>
      <input
        value={altText}
        onChange={(e) => onChange(desktopUrl, mobileUrl, e.target.value)}
        placeholder="Alt text (important for SEO)"
        className="w-full px-3 py-2 bg-white border border-navy/15 text-xs focus:outline-none focus:border-crimson"
      />
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 px-3 py-2 bg-navy text-white text-xs hover:bg-crimson transition-colors disabled:opacity-50"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {busy ? 'Uploading...' : 'Upload'}
        </button>
        <button
          type="button"
          onClick={() => setShowLib(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-navy/15 text-xs text-navy hover:border-crimson transition-colors"
        >
          <ImageIcon size={13} /> Library
        </button>
        {error && <span className="text-xs text-crimson">{error}</span>}
      </div>

      {showLib && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLib(false)}>
          <div className="bg-white w-full max-w-5xl max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-navy/10">
              <h3 className="font-display text-lg text-navy">Media Library</h3>
              <button onClick={() => setShowLib(false)}><X size={18} /></button>
            </div>
            <div className="p-4">
              {libLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-navy" /></div>
              ) : library.length === 0 ? (
                <div className="text-center py-12 text-navy/50 text-sm">No uploads yet. Upload to start your library.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {library.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => pickFromLibrary(m)}
                      className="group relative border border-navy/10 hover:border-crimson transition-colors text-left"
                    >
                      <img src={m.desktop_url} alt={m.alt} className="w-full h-28 object-cover" />
                      <div className="p-2">
                        <div className="text-[10px] font-mono truncate text-navy/70">{m.filename}</div>
                        <div className="text-[10px] text-navy/40">{m.width}×{m.height}</div>
                      </div>
                      <div className="absolute inset-0 bg-crimson/0 group-hover:bg-crimson/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Check className="text-crimson" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
