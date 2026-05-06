export type ContentType = 'text' | 'longtext' | 'image' | 'url' | 'toggle';

export type ContentEntry = {
  key: string;
  value: string;
  type: ContentType;
  section: string;
  label: string;
  page?: string;
  group?: string;
};

export function parsePageGroup(section: string): { page: string; group: string } {
  if (section.includes('·')) {
    const [p, g] = section.split('·').map((s) => s.trim());
    return { page: p, group: g || p };
  }
  return { page: section, group: section };
}

export const PAGE_ORDER = [
  'Global',
  'Top Bar',
  'Navigation',
  'Section Visibility',
  'Home',
  'Properties',
  'Developers',
  'Developer Logos',
  'Insights',
  'About',
  'Contact',
  'Footer',
];

const e = (
  key: string,
  value: string,
  type: ContentType,
  section: string,
  label: string
): ContentEntry => ({ key, value, type, section, label });

export const CONTENT_DEFAULTS: ContentEntry[] = [
  // ============ HEADER / GLOBAL ============
  e('global.brand.name', 'Karimi Real Estate', 'text', 'Global', 'Brand name'),
  e('global.logo.header', '/karimi-logo_copy.png', 'image', 'Global', 'Header logo (shown in navbar)'),
  e('global.logo.footer', '/karimi-logo_copy.png', 'image', 'Global', 'Footer logo'),
  e('global.logo.favicon', '/karimi-logo_copy.png', 'image', 'Global', 'Favicon (shown in browser tab)'),

  // ============ DEVELOPER LOGOS (marquee) ============
  ...Array.from({ length: 12 }).flatMap((_, idx) => {
    const i = idx + 1;
    const seeded = [
      { n: 'Emaar Properties', u: 'https://opnergcimvcujebqoerc.supabase.co/storage/v1/object/public/site-media/logos/emaar-logo-v2.png', l: 'https://www.emaar.com' },
      { n: 'DAMAC Properties', u: 'https://cdn.brandfetch.io/damacproperties.com/w/200/h/60?c=1id64Mup7ac', l: 'https://www.damacproperties.com' },
      { n: 'Sobha Realty', u: 'https://cdn.brandfetch.io/sobharealty.com/w/200/h/60?c=1id64Mup7ac', l: 'https://www.sobharealty.com' },
      { n: 'Omniyat', u: 'https://cdn.brandfetch.io/omniyat.com/w/200/h/60?c=1id64Mup7ac', l: 'https://www.omniyat.com' },
      { n: 'Nakheel', u: 'https://cdn.brandfetch.io/nakheel.com/w/200/h/60?c=1id64Mup7ac', l: 'https://www.nakheel.com' },
      { n: 'Meraas', u: 'https://cdn.brandfetch.io/meraas.com/w/200/h/60?c=1id64Mup7ac', l: 'https://www.meraas.com' },
      { n: 'Ellington Properties', u: 'https://cdn.brandfetch.io/ellingtonproperties.ae/w/200/h/60?c=1id64Mup7ac', l: 'https://ellingtonproperties.ae' },
      { n: 'Select Group', u: 'https://cdn.brandfetch.io/select-group.com/w/200/h/60?c=1id64Mup7ac', l: 'https://www.select-group.com' },
      { n: 'Binghatti', u: 'https://cdn.brandfetch.io/binghatti.com/w/200/h/60?c=1id64Mup7ac', l: 'https://binghatti.com' },
      { n: 'Danube Properties', u: 'https://cdn.brandfetch.io/danubeproperties.com/w/200/h/60?c=1id64Mup7ac', l: 'https://www.danubeproperties.com' },
      { n: '', u: '', l: '' },
      { n: '', u: '', l: '' },
    ][idx];
    return [
      e(`developers.logo.${i}.name`, seeded.n, 'text', 'Developer Logos', `Logo ${i} · Name`),
      e(`developers.logo.${i}.img`, seeded.u, 'image', 'Developer Logos', `Logo ${i} · Image (SVG / PNG URL)`),
      e(`developers.logo.${i}.url`, seeded.l, 'url', 'Developer Logos', `Logo ${i} · Link (optional)`),
    ];
  }),
  e('global.topbar.address', 'Tamani Art Tower, Business Bay, Dubai', 'text', 'Top Bar', 'Address line'),
  e('global.topbar.email', 'info@karimi.ae', 'text', 'Top Bar', 'Email'),
  e('global.topbar.phone', '+971 52 868 0423', 'text', 'Top Bar', 'Phone'),
  e('global.topbar.rera', 'RERA Registered', 'text', 'Top Bar', 'RERA badge text'),
  e('global.nav.home', 'Home', 'text', 'Navigation', 'Nav: Home'),
  e('global.nav.properties', 'Properties', 'text', 'Navigation', 'Nav: Properties'),
  e('global.nav.developers', 'Developers', 'text', 'Navigation', 'Nav: Developers'),
  e('global.nav.insights', 'Insights', 'text', 'Navigation', 'Nav: Insights'),
  e('global.nav.about', 'About', 'text', 'Navigation', 'Nav: About'),
  e('global.nav.contact', 'Contact', 'text', 'Navigation', 'Nav: Contact'),
  e('global.nav.cta', 'Book Consultation', 'text', 'Navigation', 'Header CTA button'),

  // ============ HOME — HERO ============
  e('home.hero.bg', 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=2400', 'image', 'Home · Hero', 'Background image'),
  e('home.hero.vertical', 'LUXURY REAL ESTATE ADVISORY', 'text', 'Home · Hero', 'Vertical left label'),
  e('home.hero.title', 'Buy Property', 'text', 'Home · Hero', 'Title line 1'),
  e('home.hero.title2', 'In Dubai', 'text', 'Home · Hero', 'Title line 2'),
  e('home.hero.description', 'Expert guidance for those who want more than just a property. They want clarity, confidence, and long-term value.', 'longtext', 'Home · Hero', 'Description'),
  e('home.hero.cta1', 'Book A Consultation', 'text', 'Home · Hero', 'CTA button 1'),
  e('home.hero.cta2', 'Call Now +971 52 868 0423', 'text', 'Home · Hero', 'CTA button 2'),
  e('home.hero.stat1.n', '150+', 'text', 'Home · Hero', 'Stat 1 number'),
  e('home.hero.stat1.l', 'Trusted developer partnerships', 'text', 'Home · Hero', 'Stat 1 label'),
  e('home.hero.stat2.n', '180+', 'text', 'Home · Hero', 'Stat 2 number'),
  e('home.hero.stat2.l', 'clients guided globally', 'text', 'Home · Hero', 'Stat 2 label'),
  e('home.hero.stat3.n', '98%', 'text', 'Home · Hero', 'Stat 3 number'),
  e('home.hero.stat3.l', 'client satisfaction', 'text', 'Home · Hero', 'Stat 3 label'),
  e('home.hero.avatar1', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200', 'image', 'Home · Hero', 'Avatar 1'),
  e('home.hero.avatar2', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200', 'image', 'Home · Hero', 'Avatar 2'),
  e('home.hero.avatar3', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200', 'image', 'Home · Hero', 'Avatar 3'),

  // Announcement marquee
  e('home.marquee.1', 'New Launch · Palm Beach Towers', 'text', 'Home · Marquee', 'Marquee text 1'),
  e('home.marquee.2', 'Golden Visa From AED 2M', 'text', 'Home · Marquee', 'Marquee text 2'),
  e('home.marquee.3', 'Direct Developer Allocations', 'text', 'Home · Marquee', 'Marquee text 3'),
  e('home.marquee.4', 'Zero Commission Advisory', 'text', 'Home · Marquee', 'Marquee text 4'),

  // Stats
  e('home.stats.1.label', 'AED Transacted', 'text', 'Home · Stats', 'Stat 1 label'),
  e('home.stats.1.value', '2.1', 'text', 'Home · Stats', 'Stat 1 value'),
  e('home.stats.1.suffix', 'B+', 'text', 'Home · Stats', 'Stat 1 suffix'),
  e('home.stats.2.label', 'Clients Advised', 'text', 'Home · Stats', 'Stat 2 label'),
  e('home.stats.2.value', '1200', 'text', 'Home · Stats', 'Stat 2 value'),
  e('home.stats.2.suffix', '+', 'text', 'Home · Stats', 'Stat 2 suffix'),
  e('home.stats.3.label', 'Developer Partners', 'text', 'Home · Stats', 'Stat 3 label'),
  e('home.stats.3.value', '40', 'text', 'Home · Stats', 'Stat 3 value'),
  e('home.stats.3.suffix', '+', 'text', 'Home · Stats', 'Stat 3 suffix'),
  e('home.stats.4.label', 'Client Satisfaction', 'text', 'Home · Stats', 'Stat 4 label'),
  e('home.stats.4.value', '98', 'text', 'Home · Stats', 'Stat 4 value'),
  e('home.stats.4.suffix', '%', 'text', 'Home · Stats', 'Stat 4 suffix'),

  // Developer strip
  e('home.devstrip.eyebrow', 'Official Developer Partners', 'text', 'Home · Developers', 'Eyebrow'),
  e('home.devstrip.title', 'Direct access. Preferential allocations.', 'text', 'Home · Developers', 'Title'),
  e('home.devstrip.description', "40+ registered partnerships across Dubai's finest master developers.", 'longtext', 'Home · Developers', 'Description'),

  // Signature portfolio
  e('home.portfolio.eyebrow', 'Signature Portfolio', 'text', 'Home · Portfolio', 'Eyebrow'),
  e('home.portfolio.title1', 'Curated Dubai addresses,', 'text', 'Home · Portfolio', 'Title line 1'),
  e('home.portfolio.title2', 'handpicked for enduring value.', 'text', 'Home · Portfolio', 'Title line 2'),
  e('home.portfolio.link', 'View all properties', 'text', 'Home · Portfolio', 'Link text'),

  // Karimi Doctrine
  e('home.doctrine.eyebrow', 'The Karimi Doctrine', 'text', 'Home · Doctrine', 'Eyebrow'),
  e('home.doctrine.quote1', 'Dubai rewards patience,', 'text', 'Home · Doctrine', 'Quote line 1'),
  e('home.doctrine.quote2', 'data, and honest counsel.', 'text', 'Home · Doctrine', 'Quote line 2'),
  e('home.doctrine.quote3', 'We bring all three.', 'text', 'Home · Doctrine', 'Quote line 3 (italic)'),
  e('home.doctrine.description', 'After advising on over AED 2 billion in Dubai property, one truth has held constant: the best returns come from the calmest decisions, and the calmest decisions come from the clearest counsel.', 'longtext', 'Home · Doctrine', 'Description'),
  e('home.doctrine.signature.name', 'Karimi Advisory Desk', 'text', 'Home · Doctrine', 'Signature name'),
  e('home.doctrine.signature.location', 'Business Bay, Dubai', 'text', 'Home · Doctrine', 'Signature location'),
  e('home.doctrine.bg', 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=2000', 'image', 'Home · Doctrine', 'Background image'),
  e('home.doctrine.img', 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1200', 'image', 'Home · Doctrine', 'Portrait image'),
  e('home.doctrine.featured.label', 'Featured in', 'text', 'Home · Doctrine', 'Featured label'),
  e('home.doctrine.featured.text', 'Forbes Middle East, Arabian Business, Khaleej Times', 'text', 'Home · Doctrine', 'Featured text'),

  // Why Karimi
  e('home.why.eyebrow', 'Why Karimi', 'text', 'Home · Why Karimi', 'Eyebrow'),
  e('home.why.title', 'The advisory Dubai deserved.', 'text', 'Home · Why Karimi', 'Title'),
  e('home.why.description', 'Zero commission on buyers. Uncompromising access. A partnership measured in portfolios, not transactions.', 'longtext', 'Home · Why Karimi', 'Description'),
  e('home.why.1.title', 'Zero Commission', 'text', 'Home · Why Karimi', 'Card 1 title'),
  e('home.why.1.text', 'You pay us nothing. Developer-funded.', 'text', 'Home · Why Karimi', 'Card 1 text'),
  e('home.why.2.title', 'Advisory-First', 'text', 'Home · Why Karimi', 'Card 2 title'),
  e('home.why.2.text', 'Strategy first, inventory second.', 'text', 'Home · Why Karimi', 'Card 2 text'),
  e('home.why.3.title', 'Prime Access', 'text', 'Home · Why Karimi', 'Card 3 title'),
  e('home.why.3.text', 'Direct allocations at 40+ developers.', 'text', 'Home · Why Karimi', 'Card 3 text'),
  e('home.why.4.title', 'Portfolio Thinking', 'text', 'Home · Why Karimi', 'Card 4 title'),
  e('home.why.4.text', 'Yield, appreciation, liquidity, visa.', 'text', 'Home · Why Karimi', 'Card 4 text'),

  // Locations
  e('home.locations.eyebrow', 'Prime Dubai Addresses', 'text', 'Home · Locations', 'Eyebrow'),
  e('home.locations.title', "Where the city's finest lives.", 'text', 'Home · Locations', 'Title'),
  ...[
    { k: '1', n: 'Palm Jumeirah', t: 'Iconic Island Living', i: 'https://images.pexels.com/photos/3787485/pexels-photo-3787485.jpeg?auto=compress&cs=tinysrgb&w=1400', y: '6%', s: 'AED 4,500/sqft' },
    { k: '2', n: 'Downtown Dubai', t: 'The Beating Heart', i: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=1400', y: '6.5%', s: 'AED 3,200/sqft' },
    { k: '3', n: 'Dubai Marina', t: 'Waterfront Skyline', i: 'https://images.pexels.com/photos/618079/pexels-photo-618079.jpeg?auto=compress&cs=tinysrgb&w=1400', y: '7.2%', s: 'AED 2,400/sqft' },
    { k: '4', n: 'Business Bay', t: 'The New CBD', i: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1400', y: '7.8%', s: 'AED 2,100/sqft' },
    { k: '5', n: 'Dubai Hills Estate', t: 'The Garden City', i: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=1400', y: '6.2%', s: 'AED 2,300/sqft' },
    { k: '6', n: 'Emaar Beachfront', t: 'Private Island', i: 'https://images.pexels.com/photos/3787485/pexels-photo-3787485.jpeg?auto=compress&cs=tinysrgb&w=1400', y: '6.8%', s: 'AED 3,100/sqft' },
  ].flatMap((l) => [
    e(`home.locations.${l.k}.name`, l.n, 'text', 'Home · Locations', `Location ${l.k} name`),
    e(`home.locations.${l.k}.tag`, l.t, 'text', 'Home · Locations', `Location ${l.k} tag`),
    e(`home.locations.${l.k}.img`, l.i, 'image', 'Home · Locations', `Location ${l.k} image`),
    e(`home.locations.${l.k}.yield`, l.y, 'text', 'Home · Locations', `Location ${l.k} yield`),
    e(`home.locations.${l.k}.stat`, l.s, 'text', 'Home · Locations', `Location ${l.k} price per sqft`),
  ]),

  // Process
  e('home.process.eyebrow', 'The Karimi Method', 'text', 'Home · Process', 'Eyebrow'),
  e('home.process.title', 'Four steps. Zero friction.', 'text', 'Home · Process', 'Title'),
  e('home.process.bg', 'https://images.pexels.com/photos/618079/pexels-photo-618079.jpeg?auto=compress&cs=tinysrgb&w=2000', 'image', 'Home · Process', 'Background'),
  e('home.process.1.title', 'Discovery', 'text', 'Home · Process', 'Step 1 title'),
  e('home.process.1.text', 'A private consultation to understand your goals, horizon and risk.', 'text', 'Home · Process', 'Step 1 text'),
  e('home.process.2.title', 'Curation', 'text', 'Home · Process', 'Step 2 title'),
  e('home.process.2.text', 'We shortlist only the projects that fit your strategy, off-plan or ready.', 'text', 'Home · Process', 'Step 2 text'),
  e('home.process.3.title', 'Execution', 'text', 'Home · Process', 'Step 3 title'),
  e('home.process.3.text', 'We negotiate, structure payment plans and handle end-to-end paperwork.', 'text', 'Home · Process', 'Step 3 text'),
  e('home.process.4.title', 'Stewardship', 'text', 'Home · Process', 'Step 4 title'),
  e('home.process.4.text', 'Handover, leasing, resale. A lifetime relationship, not a transaction.', 'text', 'Home · Process', 'Step 4 text'),

  // ROI
  e('home.roi.eyebrow', 'Investment Intelligence', 'text', 'Home · ROI', 'Eyebrow'),
  e('home.roi.title', 'Run the numbers, honestly.', 'text', 'Home · ROI', 'Title'),
  e('home.roi.description', 'A transparent ROI model based on current Dubai market benchmarks. No inflated assumptions.', 'longtext', 'Home · ROI', 'Description'),

  // Golden Visa
  e('home.visa.badge', 'UAE Golden Visa', 'text', 'Home · Golden Visa', 'Badge'),
  e('home.visa.title1', '10 years of residency', 'text', 'Home · Golden Visa', 'Title line 1'),
  e('home.visa.title2', 'through property.', 'text', 'Home · Golden Visa', 'Title line 2 (italic)'),
  e('home.visa.description', 'A single property investment of AED 2 million unlocks a renewable 10-year Golden Visa for you, your spouse, children, and parents.', 'longtext', 'Home · Golden Visa', 'Description'),
  e('home.visa.cta', 'Plan My Golden Visa', 'text', 'Home · Golden Visa', 'CTA button'),
  e('home.visa.bg', 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=2000', 'image', 'Home · Golden Visa', 'Background image'),
  e('home.visa.img', 'https://images.pexels.com/photos/3787485/pexels-photo-3787485.jpeg?auto=compress&cs=tinysrgb&w=1200', 'image', 'Home · Golden Visa', 'Side image'),
  e('home.visa.stat1.n', 'AED 2M', 'text', 'Home · Golden Visa', 'Stat 1 value'),
  e('home.visa.stat1.l', 'Minimum equity', 'text', 'Home · Golden Visa', 'Stat 1 label'),
  e('home.visa.stat2.n', '10 years', 'text', 'Home · Golden Visa', 'Stat 2 value'),
  e('home.visa.stat2.l', 'Renewable term', 'text', 'Home · Golden Visa', 'Stat 2 label'),
  e('home.visa.stat3.n', '30 days', 'text', 'Home · Golden Visa', 'Stat 3 value'),
  e('home.visa.stat3.l', 'Typical processing', 'text', 'Home · Golden Visa', 'Stat 3 label'),
  e('home.visa.eligible.label', 'Eligible Asset Classes', 'text', 'Home · Golden Visa', 'Eligible label'),
  e('home.visa.eligible.text', 'Apartments · Villas · Townhouses · Off-plan equity', 'text', 'Home · Golden Visa', 'Eligible text'),

  // Testimonials
  e('home.testimonials.eyebrow', 'Client Voices', 'text', 'Home · Testimonials', 'Eyebrow'),
  e('home.testimonials.title', 'Trusted across continents.', 'text', 'Home · Testimonials', 'Title'),

  // Personas
  e('home.personas.eyebrow', 'Who We Serve', 'text', 'Home · Personas', 'Eyebrow'),
  e('home.personas.title', 'Built for serious buyers.', 'text', 'Home · Personas', 'Title'),
  e('home.personas.1.title', 'International Investors', 'text', 'Home · Personas', 'Persona 1 title'),
  e('home.personas.1.text', 'Capital allocators seeking yield, appreciation and USD-pegged stability in a tax-free jurisdiction.', 'longtext', 'Home · Personas', 'Persona 1 text'),
  e('home.personas.1.img', 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', 'Home · Personas', 'Persona 1 image'),
  e('home.personas.2.title', 'HNW Families', 'text', 'Home · Personas', 'Persona 2 title'),
  e('home.personas.2.text', 'Multi-generational families relocating to Dubai. Schools, lifestyle, residency and legacy planning.', 'longtext', 'Home · Personas', 'Persona 2 text'),
  e('home.personas.2.img', 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', 'Home · Personas', 'Persona 2 image'),
  e('home.personas.3.title', 'End-Users & First-Timers', 'text', 'Home · Personas', 'Persona 3 title'),
  e('home.personas.3.text', 'Residents of Dubai making their first owned home. Guided, not sold, to the right community.', 'longtext', 'Home · Personas', 'Persona 3 text'),
  e('home.personas.3.img', 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800', 'image', 'Home · Personas', 'Persona 3 image'),

  // Insights preview
  e('home.insights.eyebrow', 'Market Insights', 'text', 'Home · Insights', 'Eyebrow'),
  e('home.insights.title', 'Intelligence, not noise.', 'text', 'Home · Insights', 'Title'),
  e('home.insights.link', 'Read all insights', 'text', 'Home · Insights', 'Link text'),

  // FAQ
  e('home.faq.eyebrow', 'Answers First', 'text', 'Home · FAQ', 'Eyebrow'),
  e('home.faq.title', 'Questions, answered.', 'text', 'Home · FAQ', 'Title'),
  e('home.faq.description', 'From Golden Visa to rental yields, the answers our clients ask us every day.', 'longtext', 'Home · FAQ', 'Description'),
  e('home.faq.cta', 'Ask a Private Question', 'text', 'Home · FAQ', 'CTA button'),

  // Final CTA
  e('home.cta.bg', 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=2000', 'image', 'Home · Final CTA', 'Background image'),
  e('home.cta.badge', 'Private Advisory', 'text', 'Home · Final CTA', 'Badge'),
  e('home.cta.title1', "Let's build your", 'text', 'Home · Final CTA', 'Title line 1'),
  e('home.cta.title2', 'Dubai portfolio.', 'text', 'Home · Final CTA', 'Title line 2 (italic)'),
  e('home.cta.description', 'A 30-minute consultation. No obligation. No commission. Just clarity.', 'longtext', 'Home · Final CTA', 'Description'),
  e('home.cta.btn1', 'Schedule Consultation', 'text', 'Home · Final CTA', 'Button 1'),
  e('home.cta.btn2', 'WhatsApp Us', 'text', 'Home · Final CTA', 'Button 2'),

  // ============ ABOUT ============
  e('about.hero.bg', 'https://opnergcimvcujebqoerc.supabase.co/storage/v1/object/public/site-media/about/hero-group-photo.jpg', 'image', 'About · Hero', 'Background'),
  e('about.hero.eyebrow', 'About Karimi', 'text', 'About · Hero', 'Eyebrow'),
  e('about.hero.title', 'A firm built on counsel, not commission.', 'text', 'About · Hero', 'Title'),
  e('about.hero.description', "We are Dubai's advisory-first real estate firm, trusted by investors from 32 countries to guide them into the city's most defining properties.", 'longtext', 'About · Hero', 'Description'),
  e('about.story.img', 'https://opnergcimvcujebqoerc.supabase.co/storage/v1/object/public/site-media/about/story-meeting.jpg', 'image', 'About · Story', 'Story image'),
  e('about.story.eyebrow', 'Our Story', 'text', 'About · Story', 'Eyebrow'),
  e('about.story.title', 'Why we exist.', 'text', 'About · Story', 'Title'),
  e('about.story.p1', "Karimi was founded on a simple observation: Dubai's property market rewards those with access and punishes those without counsel. Most agencies sell. We advise.", 'longtext', 'About · Story', 'Paragraph 1'),
  e('about.story.p2', "By taking our fee exclusively from developers, we've aligned with the only party that matters: the buyer. Every recommendation is earned. Every allocation is earned.", 'longtext', 'About · Story', 'Paragraph 2'),
  e('about.story.p3', 'Today, from our offices in Tamani Art Tower, Business Bay, we serve a global clientele of private investors, family offices, and end-users who demand discretion, data, and integrity in equal measure.', 'longtext', 'About · Story', 'Paragraph 3'),
  e('about.principles.eyebrow', 'Our Principles', 'text', 'About · Principles', 'Eyebrow'),
  e('about.principles.title', 'Four values. Zero exceptions.', 'text', 'About · Principles', 'Title'),
  e('about.principles.1.t', 'Integrity', 'text', 'About · Principles', 'Value 1 title'),
  e('about.principles.1.d', 'Zero commission on the buy side. Our revenue comes from developers, never from you.', 'text', 'About · Principles', 'Value 1 text'),
  e('about.principles.2.t', 'Discretion', 'text', 'About · Principles', 'Value 2 title'),
  e('about.principles.2.d', 'Your portfolio, your timeline, your privacy. No public listings where inappropriate.', 'text', 'About · Principles', 'Value 2 text'),
  e('about.principles.3.t', 'Global Fluency', 'text', 'About · Principles', 'Value 3 title'),
  e('about.principles.3.d', 'English, Arabic, Hindi, Russian, Mandarin. We speak the language of every client.', 'text', 'About · Principles', 'Value 3 text'),
  e('about.principles.4.t', 'Expertise', 'text', 'About · Principles', 'Value 4 title'),
  e('about.principles.4.d', 'RERA-certified brokers with decades of Dubai market experience across every asset class.', 'text', 'About · Principles', 'Value 4 text'),
  e('about.visit.title', 'Visit us in Business Bay.', 'text', 'About · Visit', 'Title'),
  e('about.visit.description', '8th Floor, Office No. 0810, Tamani Art Tower, Al Asayel Street, Business Bay, Dubai. A private advisory suite in the heart of Business Bay.', 'longtext', 'About · Visit', 'Description'),
  e('about.visit.cta', 'Schedule a Visit', 'text', 'About · Visit', 'CTA'),

  // ============ DEVELOPERS ============
  e('developers.hero.eyebrow', 'Our Developer Partners', 'text', 'Developers · Hero', 'Eyebrow'),
  e('developers.hero.title1', 'Direct access.', 'text', 'Developers · Hero', 'Title line 1'),
  e('developers.hero.title2', 'Preferential allocations.', 'text', 'Developers · Hero', 'Title line 2 (italic)'),
  e('developers.hero.description', 'Official partnerships with 40+ Dubai developers. We secure units, launches and payment plans not available to the open market.', 'longtext', 'Developers · Hero', 'Description'),
  e('developers.hero.bg', 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=2000', 'image', 'Developers · Hero', 'Background'),

  // ============ SECTION VISIBILITY ============
  e('sections.home.hero', 'true', 'toggle', 'Section Visibility · Home', 'Hero'),
  e('sections.home.marquee', 'true', 'toggle', 'Section Visibility · Home', 'Announcement Marquee'),
  e('sections.home.stats', 'true', 'toggle', 'Section Visibility · Home', 'Stats Strip'),
  e('sections.home.developers', 'true', 'toggle', 'Section Visibility · Home', 'Developer Logos'),
  e('sections.home.portfolio', 'true', 'toggle', 'Section Visibility · Home', 'Signature Portfolio'),
  e('sections.home.doctrine', 'true', 'toggle', 'Section Visibility · Home', 'The Karimi Doctrine'),
  e('sections.home.why', 'true', 'toggle', 'Section Visibility · Home', 'Why Karimi'),
  e('sections.home.locations', 'true', 'toggle', 'Section Visibility · Home', 'Prime Locations'),
  e('sections.home.process', 'true', 'toggle', 'Section Visibility · Home', 'The Karimi Method'),
  e('sections.home.roi', 'true', 'toggle', 'Section Visibility · Home', 'ROI Calculator'),
  e('sections.home.visa', 'true', 'toggle', 'Section Visibility · Home', 'Golden Visa'),
  e('sections.home.testimonials', 'true', 'toggle', 'Section Visibility · Home', 'Testimonials'),
  e('sections.home.awards', 'true', 'toggle', 'Section Visibility · Home', 'Awards / Recognition'),
  e('sections.home.personas', 'true', 'toggle', 'Section Visibility · Home', 'Client Personas'),
  e('sections.home.insights', 'true', 'toggle', 'Section Visibility · Home', 'Insights Preview'),
  e('sections.home.faq', 'true', 'toggle', 'Section Visibility · Home', 'FAQ'),
  e('sections.home.cta', 'true', 'toggle', 'Section Visibility · Home', 'Final CTA'),
  e('sections.about.hero', 'true', 'toggle', 'Section Visibility · About', 'Hero'),
  e('sections.about.story', 'true', 'toggle', 'Section Visibility · About', 'Our Story'),
  e('sections.about.principles', 'true', 'toggle', 'Section Visibility · About', 'Principles'),
  e('sections.about.visit', 'true', 'toggle', 'Section Visibility · About', 'Visit Us'),
  e('sections.developers.hero', 'true', 'toggle', 'Section Visibility · Developers', 'Hero'),
  e('sections.developers.grid', 'true', 'toggle', 'Section Visibility · Developers', 'Developer Grid'),
  e('sections.footer.newsletter', 'true', 'toggle', 'Section Visibility · Footer', 'Newsletter'),
  e('sections.footer.social', 'true', 'toggle', 'Section Visibility · Footer', 'Social Icons'),

  // ============ SOCIAL LINKS ============
  e('social.linkedin.url', 'https://linkedin.com/company/karimi-real-estate', 'url', 'Footer · Social Links', 'LinkedIn URL'),
  e('social.linkedin.show', 'true', 'toggle', 'Footer · Social Links', 'Show LinkedIn'),
  e('social.instagram.url', 'https://instagram.com/karimirealestate', 'url', 'Footer · Social Links', 'Instagram URL'),
  e('social.instagram.show', 'true', 'toggle', 'Footer · Social Links', 'Show Instagram'),
  e('social.facebook.url', 'https://facebook.com/karimirealestate', 'url', 'Footer · Social Links', 'Facebook URL'),
  e('social.facebook.show', 'true', 'toggle', 'Footer · Social Links', 'Show Facebook'),
  e('social.twitter.url', 'https://x.com/karimirealestate', 'url', 'Footer · Social Links', 'Twitter / X URL'),
  e('social.twitter.show', 'true', 'toggle', 'Footer · Social Links', 'Show Twitter / X'),
  e('social.youtube.url', '', 'url', 'Footer · Social Links', 'YouTube URL'),
  e('social.youtube.show', 'false', 'toggle', 'Footer · Social Links', 'Show YouTube'),
  e('social.tiktok.url', '', 'url', 'Footer · Social Links', 'TikTok URL'),
  e('social.tiktok.show', 'false', 'toggle', 'Footer · Social Links', 'Show TikTok'),

  // ============ FOOTER ============
  e('footer.newsletter.eyebrow', 'The Karimi Brief', 'text', 'Footer · Newsletter', 'Eyebrow'),
  e('footer.newsletter.title', 'Dubai market intelligence, monthly.', 'text', 'Footer · Newsletter', 'Title'),
  e('footer.newsletter.description', 'Off-market launches, area analysis and investor-grade research. No spam. Unsubscribe anytime.', 'longtext', 'Footer · Newsletter', 'Description'),
  e('footer.newsletter.placeholder', 'your@email.com', 'text', 'Footer · Newsletter', 'Email placeholder'),
  e('footer.newsletter.button', 'Subscribe', 'text', 'Footer · Newsletter', 'Button'),
  e('footer.tagline', "Dubai's zero-commission, advisory-first luxury property specialists. We align with investors, not transactions.", 'longtext', 'Footer', 'Tagline'),
  e('footer.explore.title', 'Explore', 'text', 'Footer', 'Explore column title'),
  e('footer.locations.title', 'Prime Locations', 'text', 'Footer', 'Locations column title'),
  e('footer.locations.1', 'Downtown Dubai', 'text', 'Footer', 'Location 1'),
  e('footer.locations.2', 'Palm Jumeirah', 'text', 'Footer', 'Location 2'),
  e('footer.locations.3', 'Dubai Marina', 'text', 'Footer', 'Location 3'),
  e('footer.locations.4', 'Business Bay', 'text', 'Footer', 'Location 4'),
  e('footer.locations.5', 'Dubai Hills Estate', 'text', 'Footer', 'Location 5'),
  e('footer.locations.6', 'Emaar Beachfront', 'text', 'Footer', 'Location 6'),
  e('footer.contact.title', 'Contact', 'text', 'Footer', 'Contact column title'),
  e('footer.contact.address', '8th Floor, Office No. 0810, Tamani Art Tower, Al Asayel Street, Business Bay, Dubai', 'text', 'Footer', 'Address'),
  e('footer.contact.phone', '+971 52 868 0423 | 04 558 4435', 'text', 'Footer', 'Phone'),
  e('footer.contact.email', 'info@karimi.ae', 'text', 'Footer', 'Email'),
  e('footer.legal.copyright', '© {year} Karimi Real Estate LLC. All rights reserved. RERA Registered.', 'text', 'Footer', 'Copyright (use {year})'),
];

export const CONTENT_MAP: Record<string, ContentEntry> = Object.fromEntries(
  CONTENT_DEFAULTS.map((c) => [c.key, c])
);
