import { type HeadingEntry } from '../lib/articleUtils';
import { List } from 'lucide-react';

interface TableOfContentsProps {
  headings: HeadingEntry[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="bg-navy-50/40 border border-navy/10 p-6 md:p-8 mb-10">
      <div className="flex items-center gap-2 mb-4">
        <List size={18} className="text-crimson" />
        <h2 className="font-display text-lg text-navy">In this article</h2>
      </div>
      <ol className="space-y-1.5">
        {headings.map((h, i) => (
          <li
            key={`${h.id}-${i}`}
            style={{ paddingLeft: `${(h.level - 2) * 16}px` }}
          >
            <a
              href={`#${h.id}`}
              className="text-navy/70 hover:text-crimson transition-colors text-sm leading-relaxed inline-block"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
