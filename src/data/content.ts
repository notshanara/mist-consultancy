// Repeating website content. Edit the wording here and every page that uses it updates.
import type { IconName } from './icons';

export const stages = [
  {
    name: 'Understand',
    summary:
      'We examine your operation models, analyze work flows, examine records and systems, all to provide comprehensive baselines where our findings allow.',
    note: 'Our assessments can be commissioned on its own.',
  },
  {
    name: 'Improve',
    summary:
      'We design practical changes to your businesses processes, controls, responsibilities, reporting, systems and technology. Your solutions are not just implemetations of technology for its own sake, its catered to your brand and active work processes.',
    note: 'We recommend the simplest workable solution for the problem, which can include automation and AI where they fit.',
  },
  {
    name: 'Implement',
    summary:
      'We work directly with you to help implement agreed upon changes. Our assistance in implementation is tailored to your business.',
    note: 'Implementation support is included where it is agreed before work begins.',
  },
];

export const highlights = [
  {
    scene: 'keyed',
    name: 'The same details, keyed again and again.',
    text: 'Re-keying, document handling and repetitive admin work between systems.',
    alt: 'Diagram: one job entered separately into a job sheet, a system and a spreadsheet.',
  },
  {
    scene: 'invoice',
    name: 'Delivered, but not yet invoiced.',
    text: 'Proof of delivery, job-to-invoice, billing accuracy and cash timing.',
    alt: 'Diagram: a delivery reaches proof of delivery quickly, then waits on paperwork before the invoice.',
  },
  {
    scene: 'empty',
    name: 'Vehicles running empty.',
    text: 'Fleet utilisation, vehicle availability, empty running and cost allocation.',
    alt: 'Diagram: two vehicle routes split into laden and empty stretches.',
  },
  {
    scene: 'kpi',
    name: 'One KPI, three answers.',
    text: 'KPI definitions, data quality and the reports that decisions rely on.',
    alt: 'Diagram: the depot, finance and customer each report a different on-time delivery figure.',
  },
  {
    scene: 'person',
    name: 'It all runs through one person.',
    text: 'Roles, ownership, capacity and key-person dependency.',
    alt: 'Diagram: planning, dispatch, drivers, customers, finance and suppliers all connected through one person.',
  },
];

export const scopes = [
  {
    id: 'scope-assessment',
    label: 'An assessment on its own',
    text: 'A clear picture of how your operation really performs and where to focus first, with an explanation of the findings, their potential implications and the practical options available.',
  },
  {
    id: 'scope-design',
    label: 'Assessment and solution design',
    text: 'The assessment, followed by practical recommendations on the most suitable ways to address the problems it identifies.',
  },
  {
    id: 'scope-full',
    label: 'Through to implementation',
    text: 'All of the above, plus help delivering the agreed improvements, coordinating internal teams and external specialists, and reviewing progress against agreed objectives.',
  },
];

export const engagementSteps = [
  'Initial conversation: we discuss your business, its operations and the issues you want to address.',
  'Define the scope: we agree the areas to be examined, the information required, responsibilities, timescales and expected deliverables.',
  'Gather information: we review relevant records, processes, operational information and other evidence. Where appropriate, this may include discussions with employees and observation of operational activities.',
  'Analyse the operation: we examine the information, identify potential inefficiencies and investigate their underlying causes.',
  'Present findings and recommendations: you receive a clear explanation of the findings, their potential implications and the practical options available.',
  'Support improvement: where it is included in the agreed scope, we support implementation and help your business work towards the intended improvements.',
];

export const industries = ['Transport and fleet operations', 'Logistics', 'Warehousing', 'Distribution'];

export const services = [
  {
    id: 'assessments',
    letter: 'A',
    name: 'Operational Assessments',
    stage: 'Understand',
    summary: 'Evidence-based findings and prioritised recommendations on how your operation performs today.',
    items: [
      'Review existing operational processes and workflows.',
      'Identify bottlenecks, inefficiencies and unnecessary costs.',
      'Examine administrative processes and information flow.',
      'Assess fleet and transport operations.',
      'Review relevant operational KPIs and reporting.',
      'Produce evidence-based findings and prioritised recommendations.',
    ],
  },
  {
    id: 'improvement',
    letter: 'B',
    name: 'Process & Operational Improvement',
    stage: 'Improve',
    summary: 'Redesigned workflows, stronger controls and less repetitive administration.',
    items: [
      'Redesign inefficient workflows.',
      'Improve internal procedures and operational controls.',
      'Reduce repetitive administrative work.',
      'Improve communication and information flow between departments.',
      'Improve resource utilisation and operational coordination.',
    ],
  },
  {
    id: 'technology',
    letter: 'C',
    name: 'Technology, Automation & Systems',
    stage: 'Improve and Implement',
    summary: 'Better use of existing systems, and automation where it is appropriate.',
    items: [
      'Identify opportunities for appropriate automation.',
      'Recommend improvements to existing software and systems.',
      'Explore system integrations and better information management.',
      'Help design solutions that reduce manual work and improve accuracy.',
      'Coordinate specialist technical development where required.',
    ],
  },
  {
    id: 'implementation',
    letter: 'D',
    name: 'Implementation & Ongoing Support',
    stage: 'Implement',
    summary: 'Support introducing agreed changes and monitoring agreed performance measures.',
    items: [
      'Support the introduction of agreed operational changes.',
      'Coordinate implementation projects.',
      'Work with external technical specialists where necessary.',
      'Monitor agreed performance measures.',
      'Provide ongoing operational improvement support where appropriate.',
    ],
  },
];

export const assessmentAreas = [
  {
    name: 'Demand, planning and customer service',
    detail: 'How demand is managed, work is scheduled, capacity is allocated and customer requirements are fulfilled.',
  },
  {
    name: 'Transport, distribution and operational execution',
    detail: 'How transport activities are planned, coordinated and delivered, including route planning, vehicle utilisation, delivery performance and operational communication.',
  },
  {
    name: 'Warehousing, inventory and materials flow',
    detail: 'How stock, materials, storage space and warehouse activities are managed.',
  },
  {
    name: 'Fleet, equipment and maintenance',
    detail: 'How vehicles and equipment are maintained, utilised and managed, including downtime, maintenance planning and associated costs.',
  },
  {
    name: 'Procurement, suppliers and subcontractors',
    detail: 'How purchasing decisions are made, supplier relationships are managed and external services are controlled.',
  },
  {
    name: 'Administration, information and order-to-cash',
    detail: 'How information moves through the business, from receiving work and completing services to processing documentation and raising invoices.',
  },
  {
    name: 'Financial, cost and commercial control',
    detail: 'How operating costs, expenditure, margins and financial information are monitored and used to support decisions.',
  },
  {
    name: 'People, organisation and capability',
    detail: 'How responsibilities, organisational structures, skills and communication affect the operation.',
  },
  {
    name: 'Systems, data and technology',
    detail: 'How business systems, reporting tools and technology support operational activities and decision-making.',
  },
  {
    name: 'Compliance, safety, risk and resilience',
    detail: 'How the business manages regulatory obligations, operational risks, safety requirements and continuity.',
  },
];

export const processStages = [
  {
    stage: 'Understand',
    steps: [
      {
        number: '01',
        name: 'Discovery',
        text: 'Understand the business, its objectives, existing processes and areas of concern.',
      },
      {
        number: '02',
        name: 'Assessment',
        text: 'Examine workflows, systems, records and operational performance. Identify and validate issues.',
      },
    ],
  },
  {
    stage: 'Improve',
    steps: [
      {
        number: '03',
        name: 'Solution Design',
        text: 'Develop practical recommendations and determine the most suitable ways to address the identified problems.',
      },
    ],
  },
  {
    stage: 'Implement',
    steps: [
      {
        number: '04',
        name: 'Implementation',
        text: 'Help deliver the agreed improvements, coordinating internal teams and external specialists where necessary.',
      },
      {
        number: '05',
        name: 'Review',
        text: 'Evaluate progress against agreed objectives and identify opportunities for further improvement.',
      },
    ],
  },
];

export const principles = [
  {
    name: 'Evidence before assumptions.',
    text: 'Findings are evidence-led. We separate verified measurements, direct observation, client statements and assumptions.',
  },
  {
    name: 'Practical solutions over unnecessary complexity.',
    text: 'We recommend the simplest workable solution for the problem, and keep assessment findings separate from proposed solutions.',
  },
  {
    name: 'Technology should solve a problem, not become the objective itself.',
    text: 'Automation and AI can be part of a solution where they fit, alongside changes to process, controls and reporting.',
  },
];

// The problems MIST may help solve. Each one is a starting point, not a separate service, and is still examined as
// part of the whole operation. Each gets its own page under Our Approach, written as an illustrative conversation:
// `opener` and `question` are what a business might say, and everything else is MIST's reply.
// In `flow`, `held` marks where work gets held up, and `zone` gives the first and last steps MIST examines.
interface Problem {
  slug: string;
  icon: IconName;
  title: string;
  /** Short name for the tabs. */
  tab: string;
  lead: string;
  opener: string;
  reply: string;
  issuesTitle: string;
  issues: { icon: IconName; text: string }[];
  flowTitle: string;
  flow: { icon: IconName; label: string; note?: string; held?: boolean; outcome?: boolean }[];
  zone: [number, number];
  zoneLabel: string;
  question: string;
  answer: string;
  figures?: { name: string; text: string }[];
  aim: string;
  /** Names from assessmentAreas. */
  areas: string[];
}

export const problems: Problem[] = [
  {
    slug: 'delivery-to-invoice',
    icon: 'receipt',
    title: 'Delivery-to-invoice efficiency',
    tab: 'Delivery to invoice',
    lead: 'What happens after a delivery or job is completed, and before the business is able to issue an accurate invoice.',
    opener: 'Our deliveries go out on time. It’s everything afterwards that drags, and invoices can go out days later than they should.',
    reply: 'Then that’s where we start: what happens between a job being completed and an accurate invoice being raised.',
    issuesTitle: 'Where completed work tends to get held up',
    issues: [
      { icon: 'pod', text: 'Proof of delivery not received, captured or stored promptly' },
      { icon: 'layers', text: 'Missing paperwork or incomplete job records' },
      { icon: 'alert', text: 'Delays in resolving delivery exceptions' },
      { icon: 'search', text: 'Manual checking and reconciliation' },
      { icon: 'message', text: 'Repeated requests for documents or information' },
      { icon: 'clock', text: 'Work completed but not yet invoice-ready' },
      { icon: 'repeat', text: 'Avoidable rework between operations and accounts' },
    ],
    flowTitle: 'Where MIST steps in',
    flow: [
      { icon: 'truck', label: 'Job completed' },
      { icon: 'pod', label: 'Proof of delivery', note: 'Not received, captured or stored promptly', held: true },
      { icon: 'layers', label: 'Job record', note: 'Paperwork missing or incomplete', held: true },
      { icon: 'search', label: 'Checks and exceptions', note: 'Checked by hand, and exceptions slow to resolve', held: true },
      { icon: 'repeat', label: 'Invoice-ready', note: 'Rework between operations and accounts', held: true },
      { icon: 'receipt', label: 'Invoice issued', outcome: true },
    ],
    zone: [1, 4],
    zoneLabel: 'We trace each hold-up to its cause, including the hand-offs between operations and accounts.',
    question: 'So how much is the delay costing us?',
    answer: 'We won’t assume a figure. A delay doesn’t automatically mean lost revenue, so any financial effect is established from the evidence.',
    aim: 'The aim is to identify where the process gets held up, why it happens and what could help completed work move to invoicing more reliably.',
    areas: ['Administration, information and order-to-cash', 'Financial, cost and commercial control'],
  },
  {
    slug: 'fleet-utilisation',
    icon: 'truck',
    title: 'Fleet and resource utilisation',
    tab: 'Fleet utilisation',
    lead: 'Whether vehicles, drivers, equipment and operational capacity are being used effectively.',
    opener: 'Some days we’re short of vehicles. On others, half the fleet seems to be standing still.',
    reply: 'We look at how your vehicles, drivers, equipment and capacity are actually being used, and why.',
    issuesTitle: 'What we look at',
    issues: [
      { icon: 'pause', text: 'Vehicle utilisation and idle time' },
      { icon: 'route', text: 'Empty running and scheduling' },
      { icon: 'clock', text: 'Waiting time and avoidable delays' },
      { icon: 'users', text: 'Allocation of vehicles, drivers and jobs' },
      { icon: 'wrench', text: 'Downtime and maintenance coordination' },
      { icon: 'eye', text: 'Visibility of available capacity' },
    ],
    flowTitle: 'Where MIST steps in',
    flow: [
      { icon: 'calendar', label: 'Jobs planned' },
      { icon: 'users', label: 'Vehicles and drivers allocated', note: 'Without a clear view of the capacity available', held: true },
      { icon: 'truck', label: 'On the road', note: 'Empty running, waiting time and avoidable delays', held: true },
      { icon: 'pause', label: 'Between jobs', note: 'Vehicles and drivers standing idle', held: true },
      { icon: 'wrench', label: 'Maintenance', note: 'Downtime not coordinated with planning', held: true },
    ],
    zone: [1, 4],
    zoneLabel: 'We look at how capacity is used at each point, and the reasons behind any inefficiency.',
    question: 'We already track utilisation. Isn’t that enough?',
    answer: 'Figures show what happened. We look for the reasons behind them, because a utilisation figure without context rarely tells you what to change.',
    aim: 'The focus is on understanding how the operation is used and why, not simply producing utilisation figures.',
    areas: ['Transport, distribution and operational execution', 'Fleet, equipment and maintenance', 'Demand, planning and customer service'],
  },
  {
    slug: 'operational-administration',
    icon: 'checklist',
    title: 'Operational administration',
    tab: 'Administration',
    lead: 'Unnecessary administrative effort, repeated work and information gaps that make operations harder to manage.',
    opener: 'My team spends hours typing the same details into different places and chasing the same paperwork.',
    reply: 'That effort usually points to how information moves through the business, so that is what we look at.',
    issuesTitle: 'Where the effort tends to go',
    issues: [
      { icon: 'keyboard', text: 'Duplicate data entry' },
      { icon: 'checklist', text: 'Manual tracking and reporting' },
      { icon: 'message', text: 'Repeated document chasing' },
      { icon: 'handoff', text: 'Unclear hand-offs between departments' },
      { icon: 'copy', text: 'Re-entering information across different systems' },
      { icon: 'chart', text: 'Reports that take too long to prepare or are not useful for decisions' },
    ],
    flowTitle: 'Where MIST steps in',
    flow: [
      { icon: 'message', label: 'Information received' },
      { icon: 'keyboard', label: 'Entered into a system', note: 'Keyed again into another system or spreadsheet', held: true },
      { icon: 'handoff', label: 'Passed between departments', note: 'Unclear who owns the next step', held: true },
      { icon: 'document', label: 'Documents gathered', note: 'Paperwork chased more than once', held: true },
      { icon: 'chart', label: 'Report prepared', note: 'Slow to prepare, or not used for decisions', held: true },
    ],
    zone: [1, 4],
    zoneLabel: 'We follow information through the business to find where effort is repeated or lost.',
    question: 'Do we need a new system to fix this?',
    answer: 'Not necessarily. The answer is often a clearer process or better use of the systems you already have. We recommend the simplest workable solution.',
    aim: 'The aim is to identify where effort is being repeated or lost, and what would make the operation easier to manage.',
    areas: ['Administration, information and order-to-cash', 'People, organisation and capability', 'Systems, data and technology'],
  },
  {
    slug: 'cost-visibility',
    icon: 'pound',
    title: 'Cost and profitability visibility',
    tab: 'Cost visibility',
    lead: 'Where operational costs arise, and how operational decisions affect commercial performance.',
    opener: 'We’re busy, but I can’t say for certain which jobs or routes actually make money.',
    reply: 'We help you see where operational costs arise and how day-to-day decisions affect your margins.',
    issuesTitle: 'What we look at',
    issues: [
      { icon: 'route', text: 'Job and route costing' },
      { icon: 'coins', text: 'Cost allocation and visibility' },
      { icon: 'chart', text: 'Operational reporting' },
      { icon: 'repeat', text: 'Reconciliation between operational and financial records' },
      { icon: 'falling', text: 'Identification of avoidable expenditure' },
      { icon: 'clock', text: 'The effect of delays, downtime or rework on margins' },
    ],
    flowTitle: 'Where MIST steps in',
    flow: [
      { icon: 'truck', label: 'Job carried out' },
      { icon: 'coins', label: 'Costs recorded', note: 'Not allocated to jobs or routes', held: true },
      { icon: 'document', label: 'Operational records' },
      { icon: 'repeat', label: 'Reconciled with finance', note: 'Operational and financial records do not match', held: true },
      { icon: 'chart', label: 'Margin understood', note: 'The effect of delays, downtime and rework is not visible', held: true },
    ],
    zone: [1, 4],
    zoneLabel: 'We connect operational activity to cost, so you can see what affects your margins.',
    question: 'Will you tell us how much we could save?',
    answer: 'Only where the data and assumptions are reliable enough to support a figure. When we give one, we always say which kind it is.',
    figures: [
      { name: 'Estimate', text: 'Worked out from the available data and stated assumptions.' },
      { name: 'Opportunity', text: 'An improvement that has been identified but not yet made.' },
      { name: 'Realised saving', text: 'Measured once a change is in place.' },
    ],
    aim: 'The aim is to help you understand where costs arise and how operational decisions affect commercial performance.',
    areas: ['Financial, cost and commercial control', 'Transport, distribution and operational execution', 'Administration, information and order-to-cash'],
  },
  {
    slug: 'technology-adoption',
    icon: 'link',
    title: 'Technology adoption and integration',
    tab: 'Technology',
    lead: 'Whether existing systems are being used effectively, and whether technology could solve a clearly understood operational problem.',
    opener: 'Our systems don’t talk to each other. Should we be buying new software?',
    reply: 'Possibly, but not by default. First we establish what is really causing the problem.',
    issuesTitle: 'What we look at',
    issues: [
      { icon: 'window', text: 'Underused features in existing software' },
      { icon: 'disconnected', text: 'Disconnected systems and repeated data entry' },
      { icon: 'database', text: 'Poor data capture or inconsistent records' },
      { icon: 'bolt', text: 'Manual processes that could be simplified or automated' },
      { icon: 'gap', text: 'Technology gaps that genuinely prevent an effective process' },
    ],
    flowTitle: 'What we check first',
    flow: [
      { icon: 'checklist', label: 'Process design', note: 'Is the process itself the cause?' },
      { icon: 'sliders', label: 'System configuration', note: 'Is the system set up for the way you work?' },
      { icon: 'users', label: 'Staff adoption', note: 'Are people able to use what is already there?' },
      { icon: 'database', label: 'Data quality', note: 'Is information captured accurately and consistently?' },
      { icon: 'gap', label: 'Technology limitation', note: 'Is there a genuine gap that prevents an effective process?' },
      { icon: 'bolt', label: 'New or changed technology', note: 'Recommended only where it solves a clearly understood problem', outcome: true },
    ],
    zone: [0, 4],
    zoneLabel: 'We check each possible cause in turn before recommending new software.',
    question: 'And if it does turn out to be the technology?',
    answer: 'Then we recommend what fits the problem and your business, and can coordinate specialist technical development where it is needed.',
    aim: 'Technology should solve a problem, not become the objective itself.',
    areas: ['Systems, data and technology', 'People, organisation and capability'],
  },
];

export const reasons = [
  {
    name: 'Independent',
    text: 'We are a consultancy, not a software vendor. Our recommendations are not tied to a product.',
  },
  {
    name: 'Evidence before assumptions',
    text: 'We separate verified measurements, direct observation, client statements and assumptions, so you can see what each finding rests on.',
  },
  {
    name: 'Practical first',
    text: 'We recommend the simplest workable solution for the problem, not technology for its own sake.',
  },
  {
    name: 'Beyond the report',
    text: 'We do not have to stop at findings. Where you want us to, we design the changes and help put them into practice.',
  },
  {
    name: 'Focused on processes',
    text: 'We assess processes, not individual employees or isolated incidents.',
  },
  {
    name: 'Straight about results',
    text: 'We don’t promise savings or outcomes we can’t support.',
  },
];

// What MOAT does, in broad terms only. Its scoring, procedures, calculations and full methodology stay confidential.
export const moatParts = [
  {
    name: 'Examining the business',
    text: 'A consistent structure for examining how a business operates.',
  },
  {
    name: 'Reviewing information',
    text: 'A consistent way of reviewing processes, records and operational information.',
  },
  {
    name: 'Seeing the connections',
    text: 'How different parts of the operation interact, rather than each problem in isolation.',
  },
  {
    name: 'Identifying improvements',
    text: 'Where improvements can be made, and which are practical and proportionate for the business.',
  },
  {
    name: 'Presenting findings',
    text: 'Findings presented clearly and consistently, with the information that supports them.',
  },
];
