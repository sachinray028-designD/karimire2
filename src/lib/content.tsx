import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from './supabase';
import { CONTENT_DEFAULTS, CONTENT_MAP } from './contentDefaults';
import { getSSGData } from './ssgData';

type Ctx = {
  values: Record<string, string>;
  loaded: boolean;
  refresh: () => Promise<void>;
};

const ContentCtx = createContext<Ctx>({ values: {}, loaded: false, refresh: async () => {} });

export function ContentProvider({ children }: { children: ReactNode }) {
  const ssg = getSSGData();
  const initialValues = Object.fromEntries(CONTENT_DEFAULTS.map((c) => [c.key, c.value]));
  if (ssg?.siteContent) {
    Object.assign(initialValues, ssg.siteContent);
  }
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [loaded, setLoaded] = useState(!!ssg);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from('site_content').select('key,value');
    if (data) {
      setValues((prev) => {
        const next = { ...prev };
        for (const row of data) next[row.key] = row.value;
        return next;
      });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <ContentCtx.Provider value={{ values, loaded, refresh }}>{children}</ContentCtx.Provider>;
}

export function useContent() {
  return useContext(ContentCtx);
}

export function useT() {
  const { values } = useContent();
  return (key: string, fallback?: string) => {
    if (key in values) return values[key];
    if (fallback !== undefined) return fallback;
    return CONTENT_MAP[key]?.value ?? key;
  };
}

export function useSection(key: string): boolean {
  const { values } = useContent();
  const full = `sections.${key}`;
  if (full in values) return values[full] !== 'false';
  return CONTENT_MAP[full]?.value !== 'false';
}
