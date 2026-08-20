/**
 * Topic cluster definitions for /insights/topic/:slug hub pages.
 *
 * The Supabase `category` field has most articles under "Market Analysis".
 * This mapping reclassifies articles by content into 6 intent-driven clusters
 * so each hub page groups genuinely related content together.
 */

export interface TopicCluster {
  slug: string;
  name: string;
  title: string;
  metaDescription: string;
  intro: string;
  relatedSlugs: string[]; // 2-3 sibling cluster slugs
}

export const CLUSTER_SLUGS = [
  'international-investor-journey',
  'market-analysis',
  'off-plan-buyer-protection',
  'transaction-mechanics-legal',
  'ownership-yield',
  'area-community-guides',
] as const;

export type ClusterSlug = (typeof CLUSTER_SLUGS)[number];

/**
 * Maps article slugs → cluster slugs.
 * Articles not listed here fall back to 'market-analysis'.
 */
const ARTICLE_TO_CLUSTER: Record<string, ClusterSlug> = {
  // International Investor Journey
  'aed-usd-peg-dubai-property': 'international-investor-journey',
  'dubai-property-tax-efficiency': 'international-investor-journey',
  'buy-dubai-property-remotely': 'international-investor-journey',
  'countries-investing-dubai-property': 'international-investor-journey',
  'passive-income-dubai-property-abroad': 'international-investor-journey',
  'step-by-step-buying-dubai': 'international-investor-journey',
  'golden-visa-cost-benefit': 'international-investor-journey',
  'golden-visa-property-guide': 'international-investor-journey',
  'new-uae-visa-update-2026-property-investors': 'international-investor-journey',
  'best-dubai-communities-families': 'international-investor-journey',
  'advisory-vs-broker-dubai': 'international-investor-journey',

  // Market Analysis
  'dubai-property-bubble': 'market-analysis',
  'short-vs-long-term-rental-dubai': 'market-analysis',
  'dubai-real-estate-outlook-2026': 'market-analysis',
  'dubai-population-growth': 'market-analysis',
  'dubai-tourism-rental-yields': 'market-analysis',
  'dubai-vs-lisbon-vs-singapore': 'market-analysis',
  'dubai-vs-abu-dhabi': 'market-analysis',
  'off-plan-vs-ready-dubai': 'market-analysis',

  // Off-Plan & Buyer Protection
  'evaluate-dubai-offplan-developer': 'off-plan-buyer-protection',
  'dubai-developer-delay-default-rights': 'off-plan-buyer-protection',
  'offplan-payment-plans-decoded': 'off-plan-buyer-protection',
  'snagging-dubai-handover': 'off-plan-buyer-protection',
  'spot-overpriced-offplan-dubai': 'off-plan-buyer-protection',
  'oqood-explained': 'off-plan-buyer-protection',
  'guaranteed-roi-truth-dubai': 'off-plan-buyer-protection',

  // Transaction Mechanics & Legal
  'company-vs-personal-dubai-property': 'transaction-mechanics-legal',
  'freehold-vs-leasehold-dubai': 'transaction-mechanics-legal',
  'power-of-attorney-dubai-real-estate': 'transaction-mechanics-legal',
  'cash-vs-mortgage-dubai': 'transaction-mechanics-legal',
  'ejari-explained-dubai': 'transaction-mechanics-legal',
  'difc-wills-dubai': 'transaction-mechanics-legal',
  'real-cost-owning-dubai-property': 'transaction-mechanics-legal',

  // Ownership & Yield
  'service-charges-dubai': 'ownership-yield',
  'property-management-dubai': 'ownership-yield',
  'exit-strategy-sell-dubai-property': 'ownership-yield',
  'build-dubai-property-portfolio': 'ownership-yield',
  'dubai-branded-residences': 'ownership-yield',

  // Area & Community Guides
  'dubai-creek-harbour': 'area-community-guides',
  'jvc-dubai-investment': 'area-community-guides',
  'dubai-prime-villa-communities': 'area-community-guides',
  'dubai-south-al-maktoum-airport': 'area-community-guides',
};

export function getClusterForArticle(articleSlug: string): ClusterSlug {
  return ARTICLE_TO_CLUSTER[articleSlug] || 'market-analysis';
}

export function getClusterSlugFromCategory(category: string): ClusterSlug {
  const map: Record<string, ClusterSlug> = {
    'International Investor Journey': 'international-investor-journey',
    'Market Analysis': 'market-analysis',
    'Market Insights': 'market-analysis',
    'Strategy': 'market-analysis',
    'Off-Plan & Buyer Protection': 'off-plan-buyer-protection',
    'Transaction Mechanics & Legal': 'transaction-mechanics-legal',
    'Ownership & Yield': 'ownership-yield',
    'Area & Community Guides': 'area-community-guides',
    'Visa & Residency': 'international-investor-journey',
    'Residency': 'international-investor-journey',
  };
  return map[category] || 'market-analysis';
}

export const TOPIC_CLUSTER_DATA: TopicCluster[] = [
  {
    slug: 'international-investor-journey',
    name: 'International Investor Journey',
    title: 'Buying Dubai Property as a Foreign Investor | Complete Guide | Karimi Real Estate',
    metaDescription:
      'Everything international buyers need to know about purchasing Dubai property: Golden Visa pathways, tax structuring by nationality, remote purchase processes, and step-by-step transaction guides from RERA-certified advisors.',
    relatedSlugs: ['transaction-mechanics-legal', 'market-analysis', 'area-community-guides'],
    intro: `Dubai's property market is deliberately built for international capital. Freehold ownership in designated zones, zero income tax on rental earnings, a hard USD-pegged currency, and the Golden Visa programme create a regulatory environment that actively rewards foreign investment — but only when the buyer understands the full picture before committing.

The articles in this cluster walk you through every stage of the international investor journey, from the initial decision to allocate capital into Dubai real estate through to the practical mechanics of completing a purchase from abroad. We cover the currency dynamics that make a dirham-denominated asset function as a dollar hedge, the tax obligations that follow you home regardless of the UAE's zero-tax regime, and the step-by-step process from offer to title deed.

Golden Visa eligibility through property is one of the most searched topics among international buyers — and one of the most misunderstood. Our guides break down the real thresholds, the recent February 2026 regulatory updates, and the honest cost-benefit analysis of buying purely for residency.

Whether you are a UK-based investor navigating HMRC obligations, an Indian NRI structuring for tax efficiency, or a first-time buyer evaluating Dubai against competing global markets, these articles give you the information that a sales brochure never will. Every piece is written by the Karimi advisory desk, grounded in transaction experience across 32 source countries, and updated for the 2026 regulatory landscape.

Start with the step-by-step buying guide if you are new to Dubai, or dive into the Golden Visa analysis if residency is your primary motivation. For currency and tax considerations, the AED-USD peg and tax-structuring articles are essential reading before you sign anything.`,
  },
  {
    slug: 'market-analysis',
    name: 'Market Analysis',
    title: 'Dubai Real Estate Market Analysis & Data | 2026 Insights | Karimi Real Estate',
    metaDescription:
      'Data-driven Dubai property market analysis: bubble risk assessment, rental yield comparisons, population growth impact, tourism-driven returns, and how Dubai compares to global investment destinations.',
    relatedSlugs: ['ownership-yield', 'international-investor-journey', 'area-community-guides'],
    intro: `Dubai's property market generates more headlines than almost any real estate market on earth — and most of them are wrong. Between developer marketing that inflates returns and international media that periodically declares a bubble, finding genuinely useful, data-grounded analysis requires cutting through considerable noise.

This cluster collects our most rigorous market research: the articles where we pull apart the actual transaction data, challenge popular narratives, and give you the honest assessment that informs investment decisions rather than confirming pre-existing biases.

The bubble question is the one we are asked most frequently, and our data-backed answer may surprise you — Dubai's current cycle is structurally different from 2008 in ways that matter for risk assessment. We examine the population growth story that underpins demand fundamentals, the tourism numbers that directly drive short-term rental yields, and the rental strategy comparison between short-term and long-term models with full cost transparency.

For investors evaluating Dubai against competing destinations, our comparative analyses — Dubai versus Abu Dhabi, Dubai versus Lisbon and Singapore — provide the framework for making that decision on fundamentals rather than marketing.

Every article in this cluster is built on publicly verifiable data from the Dubai Land Department, Dubai Statistics Centre, and DTCM. We cite our sources, show our working, and tell you where the data is ambiguous rather than presenting false certainty. That is what advisory-grade research looks like.`,
  },
  {
    slug: 'off-plan-buyer-protection',
    name: 'Off-Plan & Buyer Protection',
    title: 'Dubai Off-Plan Property Guide | Buyer Protection & Due Diligence | Karimi Real Estate',
    metaDescription:
      'Protect your off-plan Dubai investment: developer evaluation frameworks, escrow account verification, payment plan structures, Oqood registration, snagging checklists, and what to do if a developer delays.',
    relatedSlugs: ['transaction-mechanics-legal', 'market-analysis', 'ownership-yield'],
    intro: `Off-plan property is where the highest returns in Dubai real estate are made — and where the most expensive mistakes happen. The difference between the two outcomes almost always comes down to developer selection and contractual due diligence, decisions made before you sign the SPA rather than after.

Dubai has built one of the world's most structured buyer-protection frameworks for off-plan purchases. The RERA-regulated escrow system, mandatory project registration, and defined dispute resolution channels exist precisely because the emirate learned hard lessons from the 2008 crisis. But these protections only work if you understand them and verify they are in place for your specific project.

The articles in this cluster give you the complete toolkit for off-plan investing: how to evaluate a developer's delivery track record before you commit, how escrow accounts actually protect your capital, which payment plan structures shift risk toward the developer versus toward you, and what the Oqood interim registration means for your legal position.

We also cover what happens when things go wrong — developer delays, specification downgrades, and the dispute resolution channels available to you — because understanding your rights before you need them is vastly preferable to discovering them under pressure.

The snagging and handover guide is essential reading for anyone approaching completion. And if you have ever been tempted by a "guaranteed ROI" scheme, our analysis of how these structures actually work may save you from a costly misunderstanding.

Every article is grounded in the regulatory framework that governs Dubai off-plan transactions and informed by the thousands of handovers Karimi has guided clients through.`,
  },
  {
    slug: 'transaction-mechanics-legal',
    name: 'Transaction Mechanics & Legal',
    title: 'Dubai Property Transaction Guide | Legal, Mortgage & Ownership | Karimi Real Estate',
    metaDescription:
      'Navigate Dubai property transactions with confidence: freehold vs leasehold explained, company vs personal ownership, mortgage vs cash analysis, POA requirements, Ejari registration, and DIFC wills for foreign owners.',
    relatedSlugs: ['off-plan-buyer-protection', 'international-investor-journey', 'ownership-yield'],
    intro: `The mechanics of a Dubai property transaction are refreshingly straightforward compared to most Western markets — but straightforward does not mean simple, and the decisions you make about ownership structure, financing, and legal documentation have long-term consequences that outlast the transaction itself.

This cluster covers the practical, procedural, and legal dimensions of buying, owning, and protecting Dubai real estate. These are the articles our advisors most frequently recommend to clients who have already decided to invest and now need to execute correctly.

The freehold-versus-leasehold distinction is foundational: it determines your title rights, your ability to sell freely, and whether your heirs can inherit without restriction. Understanding which zones are freehold and what leasehold actually means in Dubai's context prevents one of the most fundamental purchasing errors.

Ownership structure — personal name versus company — affects your tax position, your liability exposure, and your succession planning. Our analysis covers the genuine trade-offs rather than recommending one approach universally.

For financing, the cash-versus-mortgage decision is more nuanced than most buyers realise, particularly given how UAE mortgage regulations interact with non-resident buyer eligibility. The Ejari rental registration system, Power of Attorney requirements for remote transactions, and DIFC Wills for foreign property owners round out the legal toolkit every Dubai investor needs.

These are not theoretical articles. Each one reflects questions our advisory team answers daily, informed by real transactions and current regulatory requirements.`,
  },
  {
    slug: 'ownership-yield',
    name: 'Ownership & Yield',
    title: 'Dubai Property Ownership, Yields & Portfolio Strategy | Karimi Real Estate',
    metaDescription:
      'Maximise your Dubai property returns: service charge analysis, property management selection, exit strategy planning, portfolio building frameworks, and whether branded residences justify their premium.',
    relatedSlugs: ['market-analysis', 'transaction-mechanics-legal', 'off-plan-buyer-protection'],
    intro: `Buying a Dubai property is a single event. Owning it profitably is an ongoing discipline. The decisions you make after purchase — how you manage the asset, what you spend on service charges, when and how you exit — determine whether your investment delivers the returns that justified the purchase in the first place.

This cluster focuses on the ownership phase: the practical realities of holding Dubai real estate, optimising yield, building a multi-property portfolio, and executing a sale when the time is right.

Service charges are the hidden cost that most investors underestimate. Our detailed breakdown shows how they vary by community, how they affect your net yield, and what to look for in the service charge budget before you buy. Property management selection is equally consequential — the difference between a competent manager and a poor one can represent two percentage points of yield on your annual return.

For investors thinking beyond a single unit, our portfolio-building framework explains how to scale from one Dubai property to a diversified holding that balances yield, appreciation, and liquidity across different communities and asset types.

The exit strategy article is one our most popular — because most buyers plan their entry meticulously and their exit not at all. Understanding how to position a Dubai property for sale, the costs involved, and the timing factors that affect price realisation can add hundreds of thousands of dirhams to your outcome.

Finally, our analysis of branded residences — the Versace, Armani, and Dorchester-affiliated properties that command significant premiums — gives you the honest assessment of whether the brand premium is justified by the returns.`,
  },
  {
    slug: 'area-community-guides',
    name: 'Area & Community Guides',
    title: 'Dubai Area Guides | Community Investment Analysis | Karimi Real Estate',
    metaDescription:
      'In-depth Dubai area and community guides: Dubai Creek Harbour investment case, JVC yield analysis, prime villa communities compared, and Dubai South growth corridor assessment for property investors.',
    relatedSlugs: ['market-analysis', 'ownership-yield', 'international-investor-journey'],
    intro: `In Dubai real estate, location is not just about prestige — it is the single largest determinant of your rental yield, your capital appreciation trajectory, your tenant profile, and your exit liquidity. Two properties at identical price points in different communities can deliver fundamentally different investment outcomes over a five-year hold.

This cluster provides deep, community-level analysis for Dubai's key investment zones. These are not neighbourhood lifestyle guides — they are investor-grade assessments that examine supply pipelines, historical price movements, rental demand drivers, infrastructure developments, and the specific factors that make each community suitable for particular investment strategies.

Dubai Creek Harbour represents one of the most significant master-planned developments of the current cycle, and our assessment examines whether it genuinely threatens Downtown's dominance or whether the "next Downtown" narrative outpaces the fundamentals.

Jumeirah Village Circle is Dubai's highest-yielding mainstream community — but high yield comes with high supply, and our analysis of whether JVC remains a sound investment in 2026 addresses the supply risk that yield-focused investors must understand.

For buyers in the villa segment, our guide to Dubai's prime villa communities covers the established neighbourhoods where the city's wealthiest residents actually live — with pricing data, community character assessments, and the factors that drive long-term value in the low-density luxury segment.

Dubai South, anchored by the Al Maktoum International Airport expansion, represents a decade-long growth corridor bet. Our analysis helps you evaluate whether the infrastructure thesis justifies early investment at current price points.`,
  },
];

/** Look up a cluster definition by its slug. */
export function getCluster(slug: string): TopicCluster | undefined {
  return TOPIC_CLUSTER_DATA.find((c) => c.slug === slug);
}
