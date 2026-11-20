/**
 * Published research reports. Each report is a static PDF in
 * `public/research/` with a landing page at `/research/:slug`.
 *
 * To publish a new report: add the PDF to `public/research/`, add an entry
 * here, and add `/research/<slug>` to `scripts/prerender.mjs` and
 * `public/sitemap.xml`.
 */

export interface ResearchKeyFigure {
  value: string;
  label: string;
  note: string;
}

export interface ResearchScenario {
  name: string;
  likelihood: string;
  share: number; // indicative %, for the bar
  summary: string;
}

export interface ResearchTheme {
  rank: number;
  sector: string;
  window: string;
  investmentCase: string;
  aiExposure: string;
  downside: string;
}

export interface ResearchReport {
  slug: string;
  reference: string;
  revision: string;
  series: string;
  kicker: string;
  title: string;
  subtitle: string;
  summary: string;
  author: { name: string; position: string };
  publishedAt: string; // ISO date
  classification: string;
  pages: number;
  pdfPath: string;
  pdfSizeKb: number;
  topics: string[];
  coreThesis: string;
  conclusions: { lead: string; body: string }[];
  keyFigures: ResearchKeyFigure[];
  scenarios: ResearchScenario[];
  scenarioNote: string;
  researchCall: string;
  themes: ResearchTheme[];
  contents: string[];
  definingThesis: string;
  disclosure?: string;
  importantInformation: string;
}

export const researchReports: ResearchReport[] = [
  {
    slug: 'after-the-ai-bubble',
    reference: 'MTP-RS-2026-11',
    revision: '2.3',
    series: 'Thematic Research / Macro & Technology',
    kicker: 'After the AI Bubble',
    title: 'What Comes After AI?',
    subtitle:
      'Capital rotation, the physical economy and the next technology investment cycle',
    summary:
      'The AI build-out is now spending more cash than it generates. We think a repricing is more likely than not, and that it has already begun. A correction would not end AI adoption — it would favour firms that turn cheaper intelligence into verified outcomes in energy, industrial automation, digital trust, advanced manufacturing and the life sciences.',
    author: { name: 'Alice Warren', position: 'Technology Analyst, Mustardtree Group' },
    publishedAt: '2026-11-19',
    classification: 'Strategic thematic outlook',
    pages: 13,
    pdfPath: '/research/mustardtree-partners-after-the-ai-bubble-nov-2026.pdf',
    pdfSizeKb: 218,
    topics: ['AI', 'Capital markets', 'Energy', 'Robotics', 'Digital trust'],
    coreThesis:
      'An AI-market correction would not end AI adoption. It would favour firms that turn cheaper intelligence into verified outcomes in energy, industrial automation, digital trust, advanced manufacturing and the life sciences. The next secular opportunity is a convergence of technologies, not a single successor to AI.',
    conclusions: [
      {
        lead: 'The cash position turned in the third quarter.',
        body: 'The four largest US hyperscalers spent $202bn on capex against $176bn of operating cash flow. A quarter earlier they were still cash-positive in aggregate.',
      },
      {
        lead: 'Credit is where the stress shows.',
        body: 'Default protection on the weakest AI borrower costs about eight times that on Nvidia, and fund managers cut technology exposure in November by the most since 2006.',
      },
      {
        lead: 'The demand is real, which is why this is not 2000.',
        body: "The two leading AI labs booked roughly $27bn of revenue in the third quarter, and Nvidia's revenue doubled year on year. A bubble in financing can sit on top of a working product.",
      },
      {
        lead: 'The first post-correction trade is defensive.',
        body: 'A risk-off event pressures the eventual winners too. Rotation into the next cycle follows the repricing; it does not accompany it.',
      },
      {
        lead: 'Energy, robotics and digital trust have the clearest foundations.',
        body: 'Each has demand that does not depend on AI budgets, though each is more exposed to them than it first appears.',
      },
      {
        lead: 'Biology and quantum are longer-duration options',
        body: 'with meaningful technical, regulatory and capital risk.',
      },
    ],
    keyFigures: [
      {
        value: '$202bn',
        label: 'Q3 2026 hyperscaler cash capex',
        note: 'Microsoft, Alphabet, Amazon and Meta — up 108% year on year',
      },
      {
        value: '115%',
        label: 'Capex as a share of operating cash flow',
        note: 'Up from 61% in Q3 2025',
      },
      {
        value: '−$26bn',
        label: 'Operating cash flow less capex',
        note: 'Q3 2026, against about +$6.5bn in Q2 2026',
      },
    ],
    scenarios: [
      {
        name: 'Contained repricing',
        likelihood: 'About half',
        share: 50,
        summary:
          'Capex growth slows through 2027, valuations fall and the weakest borrowers restructure, without a systemic credit event.',
      },
      {
        name: 'Financing-led correction',
        likelihood: 'About three in ten',
        share: 30,
        summary:
          'Refinancing pressure forces asset sales, project cancellations and consolidation, and losses reach private credit and bank balance sheets.',
      },
      {
        name: 'Sustained expansion',
        likelihood: 'About one in five',
        share: 20,
        summary:
          'Demand and margins catch up and the investment proves justified for longer than sceptics expect.',
      },
    ],
    scenarioNote:
      'Likelihoods are Mustardtree Partners analyst judgements as at 19 November 2026, rounded to the nearest ten points. They are intended to make the view testable, not to imply precision.',
    researchCall:
      'Prepare for a repricing in AI infrastructure and selected software multiples. Seek businesses with independent demand, durable cash flows and demonstrable returns on invested capital. Hold exposure to firms that use AI productively, not only to firms that supply compute.',
    themes: [
      {
        rank: 1,
        sector: 'Energy & grids',
        window: '2027–2035',
        investmentCase: 'Power scarcity, network upgrades, flexibility and electrification.',
        aiExposure: 'Low globally; high in the US.',
        downside: 'Regulation, rate sensitivity, order cancellations.',
      },
      {
        rank: 2,
        sector: 'Robotics',
        window: '2028–2038',
        investmentCase: 'Industrial productivity, logistics and safety.',
        aiExposure: 'Low. Demand is led by manufacturing.',
        downside: 'Integration cost, Chinese competition.',
      },
      {
        rank: 3,
        sector: 'Digital trust',
        window: '2027–2033',
        investmentCase: 'Identity, authorisation and audit for autonomous software.',
        aiExposure: 'Mixed. Agent security is tied to adoption; cryptographic migration is not.',
        downside: 'Platform bundling, vendor consolidation.',
      },
      {
        rank: 4,
        sector: 'Advanced industry',
        window: '2027–2037',
        investmentCase: 'Resilient supply chains, precision production, materials.',
        aiExposure: 'Medium, through semiconductors.',
        downside: 'Capital intensity, trade policy, cyclicality.',
      },
      {
        rank: 5,
        sector: 'Programmable biology',
        window: '2029–2040+',
        investmentCase: 'Experiment-driven discovery, treatments and bio-manufacturing.',
        aiExposure: 'Low. Benefits from cheaper compute.',
        downside: 'Clinical attrition, regulation, funding needs.',
      },
      {
        rank: 6,
        sector: 'Quantum technologies',
        window: '2030–2040+',
        investmentCase: 'Potential acceleration of selected scientific workloads.',
        aiExposure: 'Low.',
        downside: 'Uncertain useful advantage and timelines.',
      },
    ],
    contents: [
      'Executive assessment',
      'The AI cycle: where the cash stands',
      'The case against our thesis',
      'Three paths, ranked',
      'The post-AI opportunity map',
      'Deep dive: energy and robotics',
      'Deep dive: digital trust',
      'Deep dive: industry, biology and quantum',
      'A three-phase transition, 2027–2040',
      'Monitoring dashboard',
      'Closing perspective and methodology',
      'Sources and reference notes',
    ],
    definingThesis:
      'The first wave of AI is about producing intelligence. The next cycle is about converting intelligence into reliable physical productivity. The investment challenge is to own the economics of that transition, not its narrative.',
    disclosure:
      'Mustardtree Partners advises clients on identity and access management. Readers should weigh the digital trust section of this report with that in mind.',
    importantInformation:
      'This publication is general information for discussion. It is not a solicitation, an offer to buy or sell securities, or personalised investment advice, and it does not assess individual securities, entry prices, suitability, tax or the circumstances of any investor. Mustardtree Partners is not authorised to give regulated investment advice and asserts no performance record. Forward-looking statements are uncertain and may not materialise. Mustardtree Partners is not affiliated with the external sources cited.',
  },
];

export function getResearchReport(slug: string): ResearchReport | undefined {
  return researchReports.find((r) => r.slug === slug);
}

export function formatResearchDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
