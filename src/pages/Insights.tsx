import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, type BlogPost } from '../lib/supabase';
import { useReveal } from '../lib/useReveal';
import { ArrowLeft } from 'lucide-react';
import { Seo } from '../lib/seo';

// Detects if a line is a subheading: short (under 90 chars), doesn't end with sentence punctuation
function isSubheading(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 90) return false;
  return !/[.,;]$/.test(trimmed);
}

function BlogContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let paraBuffer: string[] = [];

  const flushPara = () => {
    const text = paraBuffer.join(' ').trim();
    if (text) elements.push(<p key={elements.length} className="text-navy/75 text-lg leading-relaxed mb-5">{text}</p>);
    paraBuffer = [];
  };

  lines.forEach((line) => {
    if (isSubheading(line)) {
      flushPara();
      elements.push(<h3 key={elements.length} className="font-bold text-navy text-xl mt-8 mb-3">{line.trim()}</h3>);
    } else if (line.trim() === '') {
      flushPara();
    } else {
      paraBuffer.push(line.trim());
    }
  });
  flushPara();

  return <div className="prose-custom">{elements}</div>;
}

export function InsightsList() {
  useReveal();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => { supabase.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false }).then(({ data }) => setPosts(data || [])); }, []);
  return (
    <>
      <Seo page="insights" breadcrumbs={[{ name: 'Home', url: 'https://karimi.ae/' }, { name: 'Insights', url: 'https://karimi.ae/insights' }]} jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Karimi Real Estate Insights',
        url: 'https://karimi.ae/insights',
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: `https://karimi.ae/insights/${p.slug}`,
          image: p.cover_image,
          datePublished: (p as any).created_at,
          description: p.excerpt,
        })),
      }}/>
      <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-navy text-white relative overflow-hidden">
        <img src="https://images.pexels.com/photos/3787485/pexels-photo-3787485.jpeg?auto=compress&cs=tinysrgb&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-15" alt=""/>
        <div className="container-px max-w-4xl relative">
          <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>Market Insights</div>
          <h1 className="mt-5 font-display text-5xl md:text-7xl">Intelligence,<br/><span className="italic text-crimson-100">not noise.</span></h1>
          <p className="mt-5 text-white/70 text-lg">Research, strategy, and honest analysis from Karimi's advisory desk.</p>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container-px grid md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
          {posts.map((p) => (
            <Link key={p.id} to={`/insights/${p.slug}`} className="group block">
              <div className="aspect-[4/3] overflow-hidden"><img src={p.cover_image} alt={p.title} className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"/></div>
              <div className="pt-5">
                <div className="flex gap-3 text-[10px] tracking-[0.25em] uppercase text-navy/50"><span className="text-crimson">{p.category}</span><span>{p.read_time}</span></div>
                <h2 className="font-display text-2xl text-navy mt-3 group-hover:text-crimson transition-colors">{p.title}</h2>
                <p className="mt-3 text-navy/60 text-sm">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function InsightDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!slug) return;
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).maybeSingle()
      .then(({ data }) => { setPost(data); setLoading(false); });
  }, [slug]);
  if (loading) return <div className="pt-40 text-center text-navy/50">Loading...</div>;
  if (!post) return <div className="pt-40 text-center"><h2 className="font-display text-4xl text-navy">Article not found</h2></div>;
  return (
    <article>
      <Seo
        page="insights"
        titleOverride={`${post.title} | Karimi Insights`}
        descriptionOverride={post.excerpt}
        canonicalOverride={`https://karimi.ae/insights/${post.slug}`}
        imageOverride={post.cover_image}
        article={{ publishedTime: (post as any).created_at, author: 'Karimi Advisory Desk' }}
        breadcrumbs={[
          { name: 'Home', url: 'https://karimi.ae/' },
          { name: 'Insights', url: 'https://karimi.ae/insights' },
          { name: post.title, url: `https://karimi.ae/insights/${post.slug}` },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          image: post.cover_image,
          datePublished: (post as any).created_at,
          author: { '@type': 'Organization', name: 'Karimi Real Estate' },
          mainEntityOfPage: `https://karimi.ae/insights/${post.slug}`,
        }}
      />
      <section className="relative pt-20 h-[60vh] min-h-[400px]">
        <img src={post.cover_image} alt={post.title} className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-navy/70"/>
        <div className="container-px relative h-full flex flex-col justify-end pb-12 max-w-4xl mx-auto">
          <Link to="/insights" className="text-white/70 text-sm flex items-center gap-2 mb-4 hover:text-white"><ArrowLeft size={14}/>All Insights</Link>
          <div className="flex gap-3 text-[11px] tracking-[0.25em] uppercase text-crimson-200"><span>{post.category}</span><span>{post.read_time}</span></div>
          <h1 className="mt-3 font-display text-white text-4xl md:text-6xl">{post.title}</h1>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container-px max-w-3xl mx-auto">
          <p className="text-xl text-navy/80 leading-relaxed font-light">{post.excerpt}</p>
          <div className="gold-divider my-10"/>
          <BlogContent content={post.content} />
        </div>
      </section>
    </article>
  );
}
