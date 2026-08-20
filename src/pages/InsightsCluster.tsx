import { Link, useParams } from 'react-router-dom';
import { useReveal } from '../lib/useReveal';
import { Seo, useSiteUrl } from '../lib/seo';
import { getSSGData } from '../lib/ssgData';
import { getCluster, getClusterForArticle, TOPIC_CLUSTER_DATA } from '../data/topicClusters';
import type { BlogPost } from '../lib/supabase';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

export default function InsightsCluster() {
  useReveal();
  const { slug } = useParams<{ slug: string }>();
  const site = useSiteUrl();
  const ssg = getSSGData();
  const cluster = getCluster(slug || '');

  if (!cluster) {
    return (
      <div className="pt-40 text-center">
        <h1 className="font-display text-4xl text-navy">Topic not found</h1>
        <Link to="/insights" className="text-crimson mt-4 inline-block">
          Back to Insights
        </Link>
      </div>
    );
  }

  // Filter articles that belong to this cluster
  const allPosts: BlogPost[] = ssg?.blogPosts || [];
  const clusterPosts = allPosts.filter(
    (p) => getClusterForArticle(p.slug) === cluster.slug
  );

  // Related clusters (2-3 siblings)
  const relatedClusters = cluster.relatedSlugs
    .map((s) => TOPIC_CLUSTER_DATA.find((c) => c.slug === s))
    .filter(Boolean);

  // Structured data
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cluster.name,
    description: cluster.metaDescription,
    url: `${site}/insights/topic/${cluster.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Karimi Real Estate',
      url: site,
    },
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cluster.name} Articles`,
    numberOfItems: clusterPosts.length,
    itemListElement: clusterPosts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${site}/insights/${p.slug}`,
      name: p.seo_title || p.title,
    })),
  };

  return (
    <>
      <Seo
        page="insights"
        titleOverride={cluster.title}
        descriptionOverride={cluster.metaDescription}
        canonicalOverride={`${site}/insights/topic/${cluster.slug}`}
        breadcrumbs={[
          { name: 'Home', url: `${site}/` },
          { name: 'Insights', url: `${site}/insights` },
          { name: cluster.name, url: `${site}/insights/topic/${cluster.slug}` },
        ]}
        jsonLd={[collectionSchema, itemListSchema]}
      />

      {/* Hero */}
      <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-navy text-white relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/3787485/pexels-photo-3787485.jpeg?auto=compress&cs=tinysrgb&w=2000"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
          alt=""
        />
        <div className="container-px max-w-5xl relative">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link to="/insights" className="hover:text-white transition-colors">
              Insights
            </Link>
            <span>/</span>
            <span className="text-crimson-200">{cluster.name}</span>
          </div>
          <div className="eyebrow text-crimson-200">
            <span className="w-8 h-px bg-crimson" />
            Topic Cluster
          </div>
          <h1 className="mt-5 font-display text-4xl md:text-6xl">
            {cluster.name}
          </h1>
          <p className="mt-5 text-white/70 text-lg max-w-2xl">
            {clusterPosts.length} in-depth articles from the Karimi advisory desk.
          </p>
        </div>
      </section>

      {/* Intro copy */}
      <section className="py-12 md:py-16 bg-white border-b border-navy/10">
        <div className="container-px max-w-4xl">
          <div className="prose-custom text-navy/75 leading-relaxed text-base md:text-lg">
            {cluster.intro.split('\n\n').map((para, i) => (
              <p key={i} className="mb-5 last:mb-0">
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Article list */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container-px">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
            {clusterPosts.map((p) => (
              <Link
                key={p.id}
                to={`/insights/${p.slug}`}
                className="group block bg-white border border-navy/10 hover-lift"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={p.cover_image}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-navy/50">
                    <span className="text-crimson">{cluster.name}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {p.read_time}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-navy mt-3 leading-tight group-hover:text-crimson transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-navy/60 text-sm leading-relaxed line-clamp-2">
                    {p.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-navy/40">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(p.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {clusterPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-navy/50 text-lg">
                No articles in this topic yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Related clusters */}
      {relatedClusters.length > 0 && (
        <section className="py-12 md:py-16 bg-navy-50/30 border-t border-navy/10">
          <div className="container-px">
            <div className="eyebrow mb-3">
              <span className="w-8 h-px bg-crimson" />
              Related Topics
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-navy mb-8">
              Explore related guides
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedClusters.map((rc) =>
                rc ? (
                  <Link
                    key={rc.slug}
                    to={`/insights/topic/${rc.slug}`}
                    className="group block bg-white p-6 md:p-8 border border-navy/10 hover-lift"
                  >
                    <h3 className="font-display text-xl text-navy group-hover:text-crimson transition-colors">
                      {rc.name}
                    </h3>
                    <p className="mt-3 text-navy/60 text-sm leading-relaxed line-clamp-3">
                      {rc.metaDescription}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-crimson text-sm font-medium">
                      Browse articles{' '}
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                ) : null
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-px text-center">
          <Link to="/insights" className="btn-navy inline-flex">
            All Insights
          </Link>
        </div>
      </section>
    </>
  );
}
