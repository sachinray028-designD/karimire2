import { ReactNode, createContext, useContext, useEffect, useMemo, useRef } from 'react';

type HeadEntry = { key: string; node: HTMLElement };

type Registry = {
  claim: (id: string) => void;
  release: (id: string) => void;
  apply: (id: string, entries: HeadEntry[]) => void;
};

const Ctx = createContext<Registry | null>(null);

export function HelmetProvider({ children }: { children: ReactNode }) {
  const stacks = useRef<Map<string, { entries: HeadEntry[]; order: number }>>(new Map());
  const counter = useRef(0);
  const managed = useRef<Map<string, HTMLElement>>(new Map());

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
    const winner = new Map<string, HTMLElement>();
    const ordered = [...stacks.current.entries()].sort((a, b) => a[1].order - b[1].order);
    for (const [, s] of ordered) {
      for (const e of s.entries) winner.set(e.key, e.node);
    }

    for (const [key, el] of managed.current) {
      if (!winner.has(key)) {
        el.parentNode?.removeChild(el);
        managed.current.delete(key);
      }
    }
    for (const [key, node] of winner) {
      const existing = managed.current.get(key);
      if (existing && existing.isEqualNode(node)) continue;
      if (existing) existing.parentNode?.removeChild(existing);
      document.head.appendChild(node);
      managed.current.set(key, node);
    }

    const titleNode = [...winner.values()].find((n) => n.tagName === 'TITLE');
    if (titleNode && document.title !== titleNode.textContent) {
      document.title = titleNode.textContent || '';
    }
  }

  return <Ctx.Provider value={registry}>{children}</Ctx.Provider>;
}

type HelmetProps = { children?: ReactNode };

export function Helmet({ children }: HelmetProps) {
  const reg = useContext(Ctx);
  const idRef = useRef<string>('');
  if (!idRef.current) idRef.current = Math.random().toString(36).slice(2);

  useEffect(() => {
    if (!reg) return;
    reg.claim(idRef.current);
    return () => reg.release(idRef.current);
  }, [reg]);

  useEffect(() => {
    if (!reg) return;
    const entries: HeadEntry[] = [];
    const arr = Array.isArray(children) ? children : [children];

    function walk(nodes: any[]) {
      for (const c of nodes) {
        if (!c || typeof c !== 'object') continue;
        if (Array.isArray(c)) { walk(c); continue; }
        const type = c.type;
        const props = c.props || {};
        if (type === 'title') {
          const el = document.createElement('title');
          el.textContent = Array.isArray(props.children) ? props.children.join('') : (props.children ?? '');
          entries.push({ key: 'title', node: el });
        } else if (type === 'meta') {
          const el = document.createElement('meta');
          for (const [k, v] of Object.entries(props)) {
            if (v == null || k === 'children') continue;
            el.setAttribute(k, String(v));
          }
          const key = `meta:${props.name || props.property || props.httpEquiv || props.charset || Math.random()}`;
          entries.push({ key, node: el });
        } else if (type === 'link') {
          const el = document.createElement('link');
          for (const [k, v] of Object.entries(props)) {
            if (v == null || k === 'children') continue;
            el.setAttribute(k, String(v));
          }
          const key = `link:${props.rel || ''}:${props.href || ''}:${props.hreflang || ''}`;
          entries.push({ key, node: el });
        } else if (type === 'script') {
          const el = document.createElement('script');
          for (const [k, v] of Object.entries(props)) {
            if (v == null || k === 'children') continue;
            el.setAttribute(k, String(v));
          }
          const body = Array.isArray(props.children) ? props.children.join('') : (props.children ?? '');
          el.textContent = body;
          const key = `script:${props.type || 'text/javascript'}:${body.slice(0, 60)}:${Math.random()}`;
          entries.push({ key, node: el });
        } else if (type === 'html') {
          // ignored — we only manage head
        }
      }
    }
    walk(arr);
    reg.apply(idRef.current, entries);
  });

  return null;
}
