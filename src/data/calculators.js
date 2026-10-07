/**
 * Single source of truth for the calculator list.
 * Used by the header mega menu, the mobile menu, the footer and the homepage,
 * so a calculator added here appears everywhere at once.
 * `navDesc` and `short` are for navigation; `desc` and `metric` are homepage card copy.
 */

// 24px viewBox, 2px stroke, single path each (category icons from the design handoff)
export const catIcons = {
  roi: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  budget: 'M12 3v9h9M21 12a9 9 0 1 1-9-9',
  ads: 'M4 10v4h3l6 4V6L7 10H4zM16.5 9a4 4 0 0 1 0 6',
  career: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
};

// Inner SVG markup for individual tool icons (24px viewBox)
export const toolIcons = {
  trend: '<polyline points="3 17 9 11 13 15 21 7"></polyline><polyline points="14 7 21 7 21 14"></polyline>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22 6 12 13 2 6"></polyline>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
  refresh: '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
  pieChart: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>',
  share: '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>',
  funnel: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>',
  target: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>',
  cursor: '<path d="M4 4l7 17 2-7 7-2z"></path>',
  playCirc: '<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>',
  brief: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
  building: '<line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><polygon points="12 2 20 7 4 7 12 2"></polygon>',
};

export const categories = [
  {
    id: 'roi', icon: 'roi', navName: 'ROI & Performance',
    title: 'ROI & Performance Calculators',
    subtitle: '5 calculators — measure what your marketing actually returns',
    blurb: 'Measure return on spend and what each customer costs.',
    tools: [
      { href: '/marketing-roi-calculator/', name: 'Marketing ROI Calculator', short: 'ROI', navDesc: 'Return on any campaign', icon: 'trend',
        desc: 'Computes ROMI and gross-profit ROI with COGS. Channel presets included.',
        metric: '500% (5:1) target ROI', badge: 'popular' },
      { href: '/cac-calculator/', name: 'CAC Calculator', short: 'CAC', navDesc: 'Cost to win a customer', icon: 'userPlus',
        desc: 'Customer acquisition cost from spend and new customers, plus payback period.',
        metric: '$390 planning CAC (B2B SMB)', badge: 'new' },
      { href: '/email-marketing-roi-calculator/', name: 'Email Marketing ROI', short: 'Email ROI', navDesc: 'Return on email spend', icon: 'mail',
        desc: 'Email ROMI from list size, open rate, click rate, and platform cost.',
        metric: '$36–$42 per $1 (quoted)', badge: '' },
      { href: '/marketing-automation-roi-calculator/', name: 'Marketing Automation ROI', short: 'Automation', navDesc: 'Platform payback and lead lift', icon: 'zap',
        desc: 'Time savings, lead lift %, and platform cost. Built for B2B.',
        metric: '544% 3-year ROI (Nucleus)', badge: '' },
      { href: '/conversion-rate-calculator/', name: 'Conversion Rate Calculator', short: 'Conversion', navDesc: 'CVR and traffic needed', icon: 'refresh',
        desc: 'CVR, reverse-computed traffic needed for a revenue goal, by channel.',
        metric: '3.5% avg CVR (organic)', badge: '' },
    ],
  },
  {
    id: 'budget', icon: 'budget', navName: 'Budget & Planning',
    title: 'Budget & Planning Calculators',
    subtitle: '4 calculators — plan spend before you commit it',
    blurb: 'Plan spend by revenue, channel and funnel goal.',
    tools: [
      { href: '/marketing-budget-calculator/', name: 'Marketing Budget Calculator', short: 'Budget', navDesc: 'Plan spend from revenue', icon: 'pieChart',
        desc: 'Recommends budget from annual revenue and industry, with 9-sector planning benchmarks.',
        metric: '7.8% of revenue (Gartner)', badge: '' },
      { href: '/digital-marketing-budget-calculator/', name: 'Digital Marketing Budget Calculator', short: 'Digital split', navDesc: 'Monthly split across six channels', icon: 'layers',
        desc: 'Splits a marketing budget into a digital budget and a monthly allocation across six channels.',
        metric: '61.1% digital share (Gartner)', badge: 'new' },
      { href: '/social-media-budget-calculator/', name: 'Social Media Budget Calculator', short: 'Social', navDesc: 'Spend by platform and goal', icon: 'share',
        desc: 'Paid and organic social budget by platform and campaign goal.',
        metric: '$8.50 avg CPM (FB/IG)', badge: '' },
      { href: '/inbound-marketing-calculator/', name: 'Inbound Marketing Calculator', short: 'Inbound', navDesc: 'Revenue goal to traffic', icon: 'funnel',
        desc: 'Reverse-funnel: enter a revenue goal, get traffic, MQL, and lead targets.',
        metric: '2–4% visitor-to-lead', badge: '' },
    ],
  },
  {
    id: 'ads', icon: 'ads', navName: 'Advertising Metrics',
    title: 'Advertising Metric Calculators',
    subtitle: '5 calculators — the numbers behind every ad platform',
    blurb: 'Price media and compare campaign costs.',
    tools: [
      { href: '/roas-calculator/', name: 'ROAS Calculator', short: 'ROAS', navDesc: 'Revenue per ad dollar', icon: 'target',
        desc: 'Return on ad spend as % and multiplier, Target ROAS mode.',
        metric: '400% (4x) target ROAS', badge: 'new' },
      { href: '/digital-marketing-calculator/', name: 'Digital Marketing Calculator', short: 'Metrics', navDesc: 'CPM, CPC, CTR, ROAS, CPA', icon: 'layers',
        desc: 'CPM, CPC, CTR, ROAS, and CPA from a single set of campaign inputs.',
        metric: '5 metrics, 1 input set', badge: '' },
      { href: '/cpm-calculator/', name: 'CPM Calculator', short: 'CPM', navDesc: 'Cost per 1,000 impressions', icon: 'eye',
        desc: 'Cost per thousand impressions, total spend, or total impressions.',
        metric: '$7–$11 CPM (FB/IG)', badge: '' },
      { href: '/cpc-calculator/', name: 'CPC Calculator', short: 'CPC', navDesc: 'Cost per click', icon: 'cursor',
        desc: 'Cost per click, total spend from clicks, or expected clicks from budget.',
        metric: '$1.16–$5.88 CPC', badge: '' },
      { href: '/cpv-calculator/', name: 'CPV Calculator', short: 'CPV', navDesc: 'Cost per video view', icon: 'playCirc',
        desc: 'Cost per view for YouTube, TikTok, and LinkedIn video campaigns.',
        metric: '$0.03–$0.10 CPV (YouTube)', badge: '' },
    ],
  },
  {
    id: 'career', icon: 'career', navName: 'Career & Business',
    title: 'Career & Business Calculators',
    subtitle: '2 calculators — know your number before you negotiate',
    blurb: 'Benchmark pay and value an agency.',
    tools: [
      { href: '/marketing-salary-calculator/', name: 'Marketing Salary Calculator', short: 'Salary', navDesc: 'US pay by role and level', icon: 'brief',
        desc: 'Salary range by role, seniority, and US location.',
        metric: '$72K mid-level estimate', badge: '' },
      { href: '/marketing-agency-valuation-calculator/', name: 'Agency Valuation Calculator', short: 'Valuation', navDesc: 'Agency value from multiples', icon: 'building',
        desc: 'Market value from revenue multiples, EBITDA and retention rate, using 2026 valuation bands.',
        metric: '3–7× EBITDA', badge: '' },
    ],
  },
];

export const calculatorCount = categories.reduce((n, c) => n + c.tools.length, 0);

export const guides = [
  { href: '/marketing-budget-benchmarks/', name: 'Marketing Budget Benchmarks', tag: 'Benchmarks', desc: 'Budget as a percentage of revenue: Gartner 7.8% average, B2B vs B2C survey figures and industry planning ranges.' },
  { href: '/blog/what-is-a-good-marketing-roi/', name: 'What Is a Good Marketing ROI?', tag: 'ROI', desc: 'ROI benchmarks by channel and the 5:1 rule of thumb, with sources.' },
  { href: '/blog/romi-calculator-formula/', name: 'ROMI Formula', tag: 'ROI', desc: 'How to calculate return on marketing investment, with worked examples.' },
  { href: '/blog/digital-marketing-metrics-guide/', name: 'Digital Marketing Metrics Guide', tag: 'Advertising', desc: 'CPM, CPC, CTR, ROAS and CPA defined, with formulas and 2026 spend context.' },
  { href: '/blog/marketing-automation-roi/', name: 'Marketing Automation ROI', tag: 'ROI', desc: 'Formula, four ROI scenarios and platform costs for marketing automation.' },
  { href: '/blog/inbound-marketing-cost/', name: 'Inbound Marketing Cost', tag: 'Budget', desc: '2026 pricing by model and channel, with three sample budgets.' },
  { href: '/blog/marketing-agency-valuation-multiples/', name: 'Agency Valuation Multiples', tag: 'Career & business', desc: 'EBITDA and revenue multiples by agency size, with adjustments for retainers and client concentration.' },
  { href: '/blog/email-marketing-roi-benchmarks/', name: 'Email Marketing ROI Benchmarks', tag: 'ROI', desc: 'Where the $36–$42 per $1 figure comes from and current Mailchimp averages.' },
];
