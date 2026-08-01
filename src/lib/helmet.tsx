import { ReactNode, createContext, useContext, useEffect, useMemo, useRef } from 'react';

export type HeadEntry = {
  key: string;
  tag: string;
  attrs: Record<string, string>;
  content?: string;
};

type Registry = {
  claim: (id: string) => void;
  release: (id: string) => void;
  apply: (id: string, entries: HeadEntry[]) => void;
};

const Ctx = createContext<Registry | null>(null);

let serverEntries: HeadEntry[] = [];

export function collectHeadEntries(): HeadEntry[] {
  const res = [...serverEntries];
  serverEntries = [];
  return res;
}

export const HelmetServerContext = createContext<{ entries: HeadEntry[] }>({ entries: [] });

export function renderHeadToString(entries: HeadEntry[]): string {
  let html = '';
  for (const e of entries) {
    let attrStr = ' data-rh="1"';
    for (const [k, v] of Object.entries(e.attrs)) {
      attrStr += ` ${k}="${v.replace(/"/g, '&quot;')}"`;
    }
    if (e.tag === 'title' || e.tag === 'script' || e.tag === 'style') {
      // Escape < inside script bodies to prevent </script> in content from breaking out
      const safeContent = (e.content || '').replace(/</g, '\u003c');
      html += `<${e.tag}${attrStr}>${safeContent}</${e.tag}>`;
    } else {
      html += `<${e.tag}${attrStr} />`;
    }
  }
  return html;
}

export function HelmetProvider({ children }: { children: ReactNode }) {
  const stacks = useRef<Map<string, { entries: HeadEntry[]; order: number }>>(new Map());
  const counter = useRef(0);
  const managed = useRef<Map<string, HTMLElement>>(new Map());
  const ssrCleaned = useRef(false);

  const registry: Registry = useMemo(
    () => ({
      claim: (id) => {
        counter.current += 1;
        stacks.current.set(id, { entries: [], order: counter.current });
        schedule();
      },
      release: (id) => {
        stacks.current.delete(id);
        schedule();
      },
      apply: (id, entries) => {
        const s = stacks.current.get(id);
        if (s) s.entries = entries;
        schedule();
      },
    }),
    [],
  );

  function schedule() {
    if (typeof window === 'undefined') return;
    queueMicrotask(flush);
  }

  function flush() {
    if (typeof document === 'undefined') return;

    // On first client flush, remove all server-rendered data-rh tags
    // so the live set replaces them cleanly instead of duplicating
    if (!ssrCleaned.current) {
      ssrCleaned.current = true;
      document.head.querySelectorAll('[data-rh]').forEach((el) => el.remove());
    }

    const winner = new Map<string, HeadEntry>();
    const ordered = [...stacks.current.entries()].sort((a, b) => a[1].order - b[1].order);
    for (const [, s] of ordered) {
      for (const e of s.entries) winner.set(e.key, e);
    }

    for (const [key, el] of managed.current) {
      if (!winner.has(key)) {
        el.parentNode?.removeChild(el);
        managed.current.delete(key);
      }
    }
    for (const [key, entry] of winner) {
      const node = document.createElement(entry.tag);
      for (const [k, v] of Object.entries(entry.attrs)) {
        node.setAttribute(k, v);
      }
      if (entry.content !== undefined) {
        node.textContent = entry.content;
      }

      const existing = managed.current.get(key);
      if (existing && existing.isEqualNode(node)) continue;
      if (existing) existing.parentNode?.removeChild(existing);

      document.head.appendChild(node);
      managed.current.set(key, node);
    }

    const titleEntry = [...winner.values()].find((n) => n.tag === 'title');
    if (titleEntry && document.title !== titleEntry.content) {
      document.title = titleEntry.content || '';
    }
  }

  return <Ctx.Provider value={registry}>{children}</Ctx.Provider>;
}

type HelmetProps = { children?: ReactNode };

export function Helmet({ children }: HelmetProps) {
  const reg = useContext(Ctx);
  const serverCtx = useContext(HelmetServerContext);
  const idRef = useRef<string>('');
  if (!idRef.current) idRef.current = Math.random().toString(36).slice(2);

  useEffect(() => {
    if (!reg) return;
    reg.claim(idRef.current);
    return () => reg.release(idRef.current);
  }, [reg]);

  const entries: HeadEntry[] = [];
  const arr = Array.isArray(children) ? children : [children];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function walk(nodes: any[]) {
    for (const c of nodes) {
      if (!c || typeof c !== 'object') continue;
      if (Array.isArray(c)) { walk(c); continue; }
      const type = c.type;
      const props = c.props || {};
      
      if (type === 'title') {
        const content = Array.isArray(props.children) ? props.children.join('') : (props.children ?? '');
        entries.push({ key: 'title', tag: 'title', attrs: {}, content });
      } else if (type === 'meta') {
        const attrs: Record<string, string> = {};
        for (const [k, v] of Object.entries(props)) {
          if (v == null || k === 'children') continue;
          attrs[k] = String(v);
        }
        const key = `meta:${props.name || props.property || props.httpEquiv || props.charset || (attrs.content ? String(attrs.content).slice(0,20) : 'unknown')}`;
        entries.push({ key, tag: 'meta', attrs });
      } else if (type === 'link') {
        const attrs: Record<string, string> = {};
        for (const [k, v] of Object.entries(props)) {
          if (v == null || k === 'children') continue;
          attrs[k] = String(v);
        }
        const key = `link:${props.rel || ''}:${props.href || ''}:${props.hreflang || ''}`;
        entries.push({ key, tag: 'link', attrs });
      } else if (type === 'script') {
        const attrs: Record<string, string> = {};
        for (const [k, v] of Object.entries(props)) {
          if (v == null || k === 'children') continue;
          attrs[k] = String(v);
        }
        const content = Array.isArray(props.children) ? props.children.join('') : (props.children ?? '');
        const keyStr = attrs.src || content.slice(0, 60);
        const key = `script:${props.type || 'text/javascript'}:${keyStr}`;
        entries.push({ key, tag: 'script', attrs, content });
      } else if (type === 'html') {
        // ignored — we only manage head
      }
    }
  }
  walk(arr);

  if (typeof window === 'undefined') {
    if (serverCtx && serverCtx.entries) {
      serverCtx.entries.push(...entries);
    }
    serverEntries.push(...entries);
  }

  useEffect(() => {
    if (reg) reg.apply(idRef.current, entries);
  });

  return null;
}
