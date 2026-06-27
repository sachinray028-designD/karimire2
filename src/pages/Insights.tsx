import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, type BlogPost } from '../lib/supabase';
import { useReveal } from '../lib/useReveal';
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react';
import { Seo } from '../lib/seo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const TOPIC_CLUSTERS = [
  'All',
  'International Investor Journey',
  'Market Analysis',
  'Off-Plan & Buyer Protection',
  'Transaction Mechanics & Legal',
  'Ownership & Yield',
  'Area & Community Guides'
];

export function InsightsList() {
  useReveal();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 9;

  useEffect(() => {
    let query = supabase.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false });
    if (filter !== 'All') {
      query = query.eq('category', filter);
    }
    query.then(({ data }) => setPosts(data || []));
    setPage(1); // Reset page on filter change
  }, [filter]);

  const displayedPosts = posts.slice(0, page * POSTS_PER_PAGE);
  const hasMore = displayedPosts.length < posts.length;

  return (
    <>
      <Seo page="insights" breadcrumbs={[{ name: 'Home', url: 'https://karimi.ae/' }, { name: 'Insights', url: 'https://karimi.ae/insights' }]} jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Karimi Real Estate Insights',
        url: 'https://karimi.ae/insights',
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.seo_title || p.title,
          url: `https://karimi.ae/insights/${p.slug}`,
          image: p.cover_image,
          datePublished: p.created_at,
          description: p.meta_description || p.excerpt,
        })),
      }}/>
      <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-navy text-white relative overflow-hidden">
        <img src="https://images.pexels.com/photos/3787485/pexels-photo-3787485.jpeg?auto=compress&cs=tinysrgb&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-15" alt=""/>
        <div className="container-px max-w-5xl relative">
          <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>Market Insights</div>
          <h1 className="mt-5 font-display text-5xl md:text-7xl">Intelligence,<br/><span className="italic text-crimson-100">not noise.</span></h1>
          <p className="mt-5 text-white/70 text-lg">Research, strategy, and honest analysis from Karimi's advisory desk.</p>
        </div>
      </section>

      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container-px">
          <div className="flex flex-wrap gap-2">
            {TOPIC_CLUSTERS.map(cluster => (
              <button 
                key={cluster} 
                onClick={() => setFilter(cluster)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${filter === cluster ? 'bg-navy text-white' : 'bg-white text-navy border border-gray-200 hover:border-navy'}`}
              >
                {cluster}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container-px grid md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
          {displayedPosts.map((p) => (
            <Link key={p.id} to={`/insights/${p.slug}`} className="group block">
              <div className="aspect-[4/3] overflow-hidden"><img src={p.cover_image} alt={p.title} className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"/></div>
              <div className="pt-5">
                <div className="flex justify-between items-center text-[10px] tracking-[0.25em] uppercase text-navy/50">
                  <span className="text-crimson">{p.category}</span>
                  <span>{p.read_time}</span>
                </div>
                <h2 className="font-display text-2xl text-navy mt-3 group-hover:text-crimson transition-colors">{p.title}</h2>
                <p className="mt-3 text-navy/60 text-sm line-clamp-3">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
        {hasMore && (
          <div className="mt-12 text-center">
            <button 
              onClick={() => setPage(p => p + 1)}
              className="btn-primary"
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export function InsightDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    window.scrollTo(0, 0);
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).maybeSingle()
      .then(({ data }) => { 
        setPost(data); 
        if (data) {
          supabase.from('blog_posts').select('*').eq('category', data.category).neq('id', data.id).eq('published', true).limit(3)
            .then(({ data: relatedData }) => setRelated(relatedData || []));
        }
        setLoading(false); 
      });
  }, [slug]);

  if (loading) return <div className="pt-40 text-center text-navy/50">Loading...</div>;
  if (!post) return <div className="pt-40 text-center"><h2 className="font-display text-4xl text-navy">Article not found</h2></div>;

  return (
    <article>
      <Seo
        page="insights"
        titleOverride={post.seo_title || `${post.title} | Karimi Insights`}
        descriptionOverride={post.meta_description || post.excerpt}
        canonicalOverride={`https://karimi.ae/insights/${post.slug}`}
        imageOverride={post.cover_image}
        article={{ publishedTime: post.created_at, author: 'Karimi Real Estate Advisory' }}
        breadcrumbs={[
          { name: 'Home', url: 'https://karimi.ae/' },
          { name: 'Insights', url: 'https://karimi.ae/insights' },
          { name: post.title, url: `https://karimi.ae/insights/${post.slug}` },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.seo_title || post.title,
          description: post.meta_description || post.excerpt,
          image: post.cover_image,
          datePublished: post.created_at,
          author: { '@type': 'Organization', name: 'Karimi Real Estate Advisory' },
          mainEntityOfPage: `https://karimi.ae/insights/${post.slug}`,
        }}
      />
      <section className="relative pt-20 h-[60vh] min-h-[400px]">
        <img src={post.cover_image} alt={post.title} className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-navy/70"/>
        <div className="container-px relative h-full flex flex-col justify-end pb-12 max-w-5xl mx-auto">
          <Link to="/insights" className="text-white/70 text-sm flex items-center gap-2 mb-4 hover:text-white"><ArrowLeft size={14}/>All Insights</Link>
          <div className="flex gap-3 text-[11px] tracking-[0.25em] uppercase text-crimson-200"><span>{post.category}</span><span>{post.read_time}</span></div>
          <h1 className="mt-3 font-display text-white text-4xl md:text-6xl">{post.title}</h1>
          <div className="flex items-center gap-6 mt-6 text-white/80 text-sm">
            <div className="flex items-center gap-2"><User size={16} className="text-crimson"/> Karimi Real Estate Advisory</div>
            <div className="flex items-center gap-2"><Calendar size={16} className="text-crimson"/> {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container-px max-w-5xl mx-auto">
          <p className="text-xl text-navy/80 leading-relaxed font-light">{post.excerpt}</p>
          <div className="gold-divider my-10"/>
          
          <div className="prose-custom max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-16 bg-navy-50 p-8 md:p-12 text-center">
            <h3 className="font-display text-3xl text-navy mb-4">Discuss Your Investment Strategy</h3>
            <p className="text-navy/70 mb-8 max-w-2xl mx-auto">Speak with a RERA-certified advisor at Karimi Real Estate to understand how these insights apply to your portfolio.</p>
            <Link to="/contact" className="btn-primary inline-flex">Book a Consultation</Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20 bg-gray-50 border-t border-gray-200">
          <div className="container-px">
            <div className="flex justify-between items-end mb-12">
              <div>
                <div className="eyebrow"><span className="w-8 h-px bg-crimson"/>Related Topics</div>
                <h2 className="mt-3 font-display text-4xl text-navy">Continue Reading</h2>
              </div>
              <Link to="/insights" className="hidden md:flex items-center gap-2 text-crimson font-medium hover:text-navy transition-colors text-sm uppercase tracking-widest">
                More Insights <ArrowRight size={16}/>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link key={p.id} to={`/insights/${p.slug}`} className="group block bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden"><img src={p.cover_image} alt={p.title} className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"/></div>
                  <div className="p-6">
                    <div className="flex gap-3 text-[10px] tracking-[0.25em] uppercase text-navy/50 mb-3"><span className="text-crimson">{p.category}</span></div>
                    <h3 className="font-display text-xl text-navy group-hover:text-crimson transition-colors line-clamp-2">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
