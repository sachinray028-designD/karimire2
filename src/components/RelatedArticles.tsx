import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { BlogPost } from '../lib/supabase';
import { getSSGData } from '../lib/ssgData';
import { getClusterForArticle, TOPIC_CLUSTER_DATA } from '../data/topicClusters';

interface RelatedArticlesProps {
  currentSlug: string;
  clusterSlug: string;
}

/**
 * Picks 3 related articles: 2 from the same cluster + 1 from a related cluster.
 * Uses SSG data so it renders at build time without extra Supabase calls.
 */
export default function RelatedArticles({ currentSlug, clusterSlug }: RelatedArticlesProps) {
  const ssg = getSSGData();
  const allPosts: BlogPost[] = ssg?.blogPosts || [];

  // Same-cluster articles (excluding current)
  const sameCluster = allPosts.filter(
    (p) => getClusterForArticle(p.slug) === clusterSlug && p.slug !== currentSlug
  );

  // Related cluster articles
  const cluster = TOPIC_CLUSTER_DATA.find((c) => c.slug === clusterSlug);
  const relatedClusterSlugs = cluster?.relatedSlugs || [];
  const crossCluster = allPosts.filter(
    (p) => relatedClusterSlugs.includes(getClusterForArticle(p.slug)) && p.slug !== currentSlug
  );

  // Deterministic shuffle based on current slug so each article picks different relatives
  const hash = currentSlug.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const shuffled = [...sameCluster].sort((a, b) => {
    const ha = (hash ^ a.slug.length) % 100;
    const hb = (hash ^ b.slug.length) % 100;
    return ha - hb || a.slug.localeCompare(b.slug);
  });
  const shuffledCross = [...crossCluster].sort((a, b) => {
    const ha = (hash ^ a.slug.length) % 100;
    const hb = (hash ^ b.slug.length) % 100;
    return ha - hb || a.slug.localeCompare(b.slug);
  });

  // Pick 2 same-cluster + 1 cross-cluster (or fill from same if not enough cross)
  const picked: BlogPost[] = [];
  const used = new Set<string>();

  for (const p of shuffled) {
    if (picked.length >= 2) break;
    picked.push(p);
    used.add(p.slug);
  }

  for (const p of shuffledCross) {
    if (picked.length >= 3) break;
    if (used.has(p.slug)) continue;
    picked.push(p);
    used.add(p.slug);
  }

  // Fill remaining from same cluster if needed
  for (const p of shuffled) {
    if (picked.length >= 3) break;
    if (used.has(p.slug)) continue;
    picked.push(p);
    used.add(p.slug);
  }

  if (picked.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50 border-t border-gray-200">
      <div className="container-px">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="eyebrow"><span className="w-8 h-px bg-crimson" />Related Topics</div>
            <h2 className="mt-3 font-display text-4xl text-navy">Continue Reading</h2>
          </div>
          <Link
            to={`/insights/topic/${clusterSlug}`}
            className="hidden md:flex items-center gap-2 text-crimson font-medium hover:text-navy transition-colors text-sm uppercase tracking-widest"
          >
            More in this topic <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {picked.map((p) => {
            const pCluster = TOPIC_CLUSTER_DATA.find(
              (c) => c.slug === getClusterForArticle(p.slug)
            );
            return (
              <Link
                key={p.id}
                to={`/insights/${p.slug}`}
                className="group block bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    loading="lazy"
                    src={p.cover_image}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <div className="flex gap-3 text-[10px] tracking-[0.25em] uppercase text-navy/50 mb-3">
                    <span className="text-crimson">{pCluster?.name || p.category}</span>
                  </div>
                  <h3 className="font-display text-xl text-navy group-hover:text-crimson transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
