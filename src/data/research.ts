/**
 * Published research reports and insight papers. Each one is a static PDF in
 * `public/research/` with a landing page at `/research/:slug`.
 *
 * To publish a new paper: add the PDF to `public/research/`, add an entry
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
  /** Short tag shown beside the name, e.g. "~50% · About half" or "Already visible". */
  tag: string;
  /** Indicative likelihood in per cent. Only set when the paper assigns one; draws a bar. */
  share?: number;
  summary: string;
}

export interface ResearchTable {
  heading: string;
  intro?: string;
  columns: string[];
  /** First cell of each row is rendered as the row header. */
  rows: string[][];
  note?: string;
}

export interface ResearchReport {
  slug: string;
  reference: string;
  revision: string;
  /** e.g. "Thematic Research / Macro & Technology" */
  series: string;
  /** Short type label for cards, e.g. "Thematic research" or "Insight paper". */
  type: string;
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

  lede: string;
  coreThesisLabel: string;
  coreThesis: string;
  conclusions: { lead: string; body: string }[];

  keyFigures: { heading: string; intro: string; items: ResearchKeyFigure[] };
  scenarios: { heading: string; intro?: string; items: ResearchScenario[]; note?: string };
  researchCall: string;
  table: ResearchTable;

  definingThesis: string;
  /** One or two sentences describing what the full PDF adds beyond the summary. */
  fullReportBlurb: string;
  contents: string[];
  importantInformation: string;
}

export const researchReports: ResearchReport[] = [
  {
    slug: 'future-of-identity-and-access',
    reference: 'MTP-IP-2026-01',
    revision: '3',
    series: 'Insight Paper / Cybersecurity & Identity',
    type: 'Insight paper',
    kicker: 'Identity on Three Clocks',
    title: 'The Future of Identity & Access',
    subtitle: 'Q-day, the vulnerability flood and the end of patch-first security',
    summary:
      'Identity is becoming the control that has to work when the others fail. Public-key cryptography now has a planning date for its retirement, and software flaws are being found faster than anyone can fix them. Both push weight onto identity and access management — and the next decade of IAM is about making access decisions crypto-agile, continuous and fast enough to contain a breach.',
    author: { name: 'Samuel Odekunle', position: 'Partner, Technology & Cybersecurity' },
    publishedAt: '2026-11-20',
    classification: 'Insight paper',
    pages: 14,
    pdfPath: '/research/mustardtree-partners-future-of-identity-and-access-nov-2026.pdf',
    pdfSizeKb: 213,
    topics: ['Identity & access', 'Post-quantum cryptography', 'Vulnerability management', 'AI', 'Regulation'],

    lede: 'Identity is becoming the control that has to work when the others fail. It is also exposed to both of the forces that are making them fail.',
    coreThesisLabel: 'Core thesis',
    coreThesis:
      'Two things security has treated as fixed are coming loose. Public-key cryptography now has a planning date for its retirement, and software flaws are being found faster than anyone can fix them. Both push weight onto identity and access management: when the signature cannot be trusted for ever and the system cannot be patched in time, what remains is deciding who and what may do what. The next decade of IAM is about making that decision crypto-agile, continuous and fast enough to contain a breach.',
    conclusions: [
      {
        lead: 'Q-day has moved from physics to planning.',
        body: 'The estimated size of a machine able to break RSA-2048 has fallen 200-fold in seven years. No such machine exists, but regulators and two of the largest internet operators now plan around 2029 to 2030.',
      },
      {
        lead: 'Authentication is the harder half of the migration.',
        body: 'Encryption in transit is already mostly quantum-safe on one large network. Signatures, which carry certificates, tokens and passkeys, have barely started, and SAML has no post-quantum standard at all.',
      },
      {
        lead: 'Exploited flaws have overtaken stolen credentials as the way in.',
        body: 'Most of those flaws need no authentication, so stronger login does not stop them. Identity is what the attacker uses next.',
      },
      {
        lead: 'The flood is real and it is AI-driven.',
        body: 'More than 100,000 vulnerabilities were published in 2026 by mid-November, over twice the whole of 2025. Finding one now costs under $50 in compute. Fixing one costs what it always did.',
      },
      {
        lead: 'Patch-first security is finished as a primary strategy.',
        body: 'On average, exploitation now begins before a fix exists, while the time taken to patch is rising. Containment is identity work: least privilege, short-lived credentials and fast revocation.',
      },
      {
        lead: 'Identity platforms are in the flood too.',
        body: 'A maximum-severity flaw in a major cloud identity service was disclosed in August and fixed by the vendor before customers could act or verify.',
      },
    ],

    keyFigures: {
      heading: 'The three clocks in numbers',
      intro:
        'No machine can break RSA today. What changed is the estimate of how large one needs to be — and, at the same time, how fast software flaws are now being found.',
      items: [
        {
          value: '<100,000',
          label: 'Physical qubits estimated to factor RSA-2048',
          note: 'February 2026 preprint; the 2019 estimate was 20 million',
        },
        {
          value: '100,009',
          label: 'Vulnerabilities published in 2026',
          note: '1 January to 18 November — 2.1 times the whole of 2025',
        },
        {
          value: '−7 days',
          label: 'Mean time to exploit',
          note: 'On average, exploitation now starts before a patch exists',
        },
      ],
    },
    scenarios: {
      heading: 'Three planning scenarios',
      intro:
        'Three different futures lead to the same decisions. We have not assigned likelihoods to the scenarios.',
      items: [
        {
          name: 'Slow quantum, fast AI',
          tag: 'Already visible',
          summary:
            'A code-breaking machine stays more than a decade away while AI makes findings far cheaper. The main risk is exhaustion. Emphasis: short-lived credentials, attack-path-aware prioritisation and remediation capacity, with cryptographic migration through normal refresh cycles.',
        },
        {
          name: 'Fast quantum',
          tag: 'Lower confidence, higher cost',
          summary:
            'A credible advance pulls the timeline into the early 2030s. Organisations that have finished discovery and built agility can accelerate; the rest face emergency procurement, certificate reissue and hardware replacement at once. Emphasis: inventory and agility now.',
        },
        {
          name: 'Identity-systemic failure',
          tag: 'Needs no breakthrough',
          summary:
            'An attacker compromises a major identity provider, federation signer or agent control plane and moves through well-patched systems with valid-looking tokens. Emphasis: signing-key protection, token binding, revocation and independent detection.',
        },
      ],
      note: 'Quantum readiness, identity modernisation and vulnerability reform draw on the same foundations: inventories, named owners, key and certificate discovery, entitlement maps and short-lived credentials. Funding them separately buys the inventory three times.',
    },
    researchCall:
      'Treat identity as resilience infrastructure, and run quantum readiness, identity modernisation and vulnerability reform as one programme, since they share the same inventories and owners. Inventory cryptographic dependencies now and move federation signing first. Cut standing privilege as the compensating control for systems that cannot be patched in time. Test whether the organisation can keep operating through a compromise of its identity provider.',
    table: {
      heading: 'What good looks like by 2030',
      intro: 'Our judgement of typical practice today and a reasonable target.',
      columns: ['Measure', 'Typical today', 'Target'],
      rows: [
        ['Federation trust on post-quantum signatures', 'None', 'All high-value applications by 2030'],
        ['Certificate renewal automated', 'Partial', 'All public certificates before March 2029'],
        ['Standing privileged access', 'Common', 'Emergency accounts only'],
        ['Workload credential lifetime', 'Months or unlimited', 'Hours'],
        ['Time to revoke a session estate-wide', "Up to the token's lifetime", 'Minutes'],
        ['Identity-provider failure exercise', 'Rare', 'Annual'],
      ],
    },

    definingThesis:
      'When the signature has an expiry date and the patch arrives too late, access control is what is left. The future of identity is not stronger login. It is the ability to decide, continuously and at machine speed, what each identity may do, and to change the cryptography underneath without rebuilding the system on top.',
    fullReportBlurb:
      'The full paper covers what Q-day breaks in identity component by component, a six-step migration sequence, how attackers get in now, vulnerability exhaustion and an identity-weighted exposure model, the regulatory picture, a 90-day-to-2030 action plan and the indicators we are watching, with full source notes.',
    contents: [
      'Executive assessment',
      'Q-day: from physics to planning',
      'What Q-day breaks in identity',
      'The migration: where identity stands',
      'Vulnerabilities: how attackers get in now',
      'Vulnerability exhaustion',
      'What exhaustion does to identity',
      'Prioritising in a flood',
      'The shape of identity in 2030',
      'Regulation and three planning scenarios',
      'What to do, and what to watch',
      'Closing perspective and methodology',
      'Sources and reference notes',
    ],
    importantInformation:
      "This publication is general information for discussion. It is not professional advice on any organisation's security, legal or regulatory position, and it should not be relied on as a substitute for an assessment of specific systems. Forward-looking statements are uncertain and may not materialise. Mustardtree Partners is not affiliated with the external sources cited and does not independently audit third-party data.",
  },
  {
    slug: 'after-the-ai-bubble',
    reference: 'MTP-RS-2026-11',
    revision: '2.3',
    series: 'Thematic Research / Macro & Technology',
    type: 'Thematic research',
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

    lede: 'The AI build-out is now spending more cash than it generates. We think a repricing is more likely than not, and that it has already begun.',
    coreThesisLabel: 'Core investment thesis',
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

    keyFigures: {
      heading: 'The AI cycle: where the cash stands',
      intro:
        'Between the second and third quarters, the four largest hyperscalers moved, in aggregate, from funding the build-out out of cash flow to funding it with borrowing.',
      items: [
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
    },
    scenarios: {
      heading: 'Three paths, ranked',
      items: [
        {
          name: 'Contained repricing',
          tag: '~50% · About half',
          share: 50,
          summary:
            'Capex growth slows through 2027, valuations fall and the weakest borrowers restructure, without a systemic credit event.',
        },
        {
          name: 'Financing-led correction',
          tag: '~30% · About three in ten',
          share: 30,
          summary:
            'Refinancing pressure forces asset sales, project cancellations and consolidation, and losses reach private credit and bank balance sheets.',
        },
        {
          name: 'Sustained expansion',
          tag: '~20% · About one in five',
          share: 20,
          summary:
            'Demand and margins catch up and the investment proves justified for longer than sceptics expect.',
        },
      ],
      note: 'Likelihoods are Mustardtree Partners analyst judgements as at 19 November 2026, rounded to the nearest ten points. They are intended to make the view testable, not to imply precision.',
    },
    researchCall:
      'Prepare for a repricing in AI infrastructure and selected software multiples. Seek businesses with independent demand, durable cash flows and demonstrable returns on invested capital. Hold exposure to firms that use AI productively, not only to firms that supply compute.',
    table: {
      heading: 'The post-AI opportunity map',
      intro:
        'We rank six themes on end-market need, commercial readiness, dependence on AI budgets and the time required to monetise.',
      columns: ['Rank / sector', 'Window', 'Core investment case', 'Exposure to AI budgets', 'Key downside'],
      rows: [
        ['1 Energy & grids', '2027–2035', 'Power scarcity, network upgrades, flexibility and electrification.', 'Low globally; high in the US.', 'Regulation, rate sensitivity, order cancellations.'],
        ['2 Robotics', '2028–2038', 'Industrial productivity, logistics and safety.', 'Low. Demand is led by manufacturing.', 'Integration cost, Chinese competition.'],
        ['3 Digital trust', '2027–2033', 'Identity, authorisation and audit for autonomous software.', 'Mixed. Agent security is tied to adoption; cryptographic migration is not.', 'Platform bundling, vendor consolidation.'],
        ['4 Advanced industry', '2027–2037', 'Resilient supply chains, precision production, materials.', 'Medium, through semiconductors.', 'Capital intensity, trade policy, cyclicality.'],
        ['5 Programmable biology', '2029–2040+', 'Experiment-driven discovery, treatments and bio-manufacturing.', 'Low. Benefits from cheaper compute.', 'Clinical attrition, regulation, funding needs.'],
        ['6 Quantum technologies', '2030–2040+', 'Potential acceleration of selected scientific workloads.', 'Low.', 'Uncertain useful advantage and timelines.'],
      ],
      note: "Windows are the periods in which we expect each theme's economics to be tested, based on current deployment lead times and published forecasts. They are not return forecasts.",
    },

    definingThesis:
      'The first wave of AI is about producing intelligence. The next cycle is about converting intelligence into reliable physical productivity. The investment challenge is to own the economics of that transition, not its narrative.',
    fullReportBlurb:
      'The full report includes the case against our thesis, deep dives on energy, robotics, digital trust, advanced industry, biology and quantum, a three-phase transition to 2040, a nine-indicator monitoring dashboard with thresholds, and full source notes.',
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
    importantInformation:
      'This publication is general information for discussion. It is not a solicitation, an offer to buy or sell securities, or personalised investment advice, and it does not assess individual securities, entry prices, suitability, tax or the circumstances of any investor. Mustardtree Partners is not authorised to give regulated investment advice and asserts no performance record. Forward-looking statements are uncertain and may not materialise. Mustardtree Partners is not affiliated with the external sources cited.',
  },
];

export function getResearchReport(slug: string): ResearchReport | undefined {
  return researchReports.find((r) => r.slug === slug);
}

/** Newest first. */
export function sortedResearchReports(): ResearchReport[] {
  return [...researchReports].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function formatResearchDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
