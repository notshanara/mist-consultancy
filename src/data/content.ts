// Repeating website content. Edit the wording here and every page that uses it updates.

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
    note: 'Solution design and implementation are agreed as separately scoped work.',
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
    text: 'A clear picture of how your operation really performs and where to focus first, delivered as a client report with evidence-based findings and prioritised recommendations.',
  },
  {
    id: 'scope-design',
    label: 'Assessment and solution design',
    text: 'The assessment, followed by practical recommendations on the most suitable ways to address the problems it identifies. Solution design is agreed as a separate scope.',
  },
  {
    id: 'scope-full',
    label: 'Through to implementation',
    text: 'All of the above, plus help delivering the agreed improvements, coordinating internal teams and external specialists, and reviewing progress against agreed objectives.',
  },
];

export const engagementSteps = [
  'Understand the business: agree objectives, sites, time period, workflows and exclusions.',
  'Select the areas to assess that are relevant to your operation.',
  'Run discovery sessions, map how work actually moves, and collect evidence.',
  'Validate sources and establish baselines.',
  'Record findings with clear evidence references, and score the areas that were assessed.',
  'Deliver a client report.',
  'Optional: if you want help fixing the issues, agree a separate scope for solution design or implementation, with objectives, responsibilities, deliverables, fees and acceptance criteria.',
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
    name: 'Delivery and service performance',
    detail: 'Dispatch, collection and delivery reliability, proof of delivery, service failures and customer experience.',
  },
  {
    name: 'Invoicing and financial administration',
    detail: 'Job-to-invoice, supplier invoice matching, billing accuracy, disputes, reconciliation and cash timing.',
  },
  {
    name: 'Fleet and transport costs',
    detail: 'Fleet utilisation, vehicle availability, fuel, maintenance, cost allocation, empty running and subcontracted transport.',
  },
  {
    name: 'Warehouse and inventory',
    detail: 'Receiving, put-away, stock accuracy, storage, picking, packing, dispatch, returns and inventory control.',
  },
  {
    name: 'Administration and information flow',
    detail: 'Re-keying, document handling, record retrieval, hand-offs and repetitive admin work.',
  },
  {
    name: 'Reporting and performance management',
    detail: 'KPI definitions, data quality, reporting routines, targets and decision-making.',
  },
  {
    name: 'Process and workflow control',
    detail: 'End-to-end process design, standard work, scheduling, bottlenecks, cycle time and rework.',
  },
  {
    name: 'Systems and technology',
    detail: 'Transport, warehouse, ERP, telematics and finance systems, spreadsheets, integrations, adoption and data reliability.',
  },
  {
    name: 'People and organisation',
    detail: 'Roles, ownership, skills, training, capacity, supervision, communication and key-person dependency.',
  },
  {
    name: 'Exceptions and resilience',
    detail: 'Disruptions, breakdowns, late work, claims, escalation, root causes and recovery.',
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

export const moatParts = [
  {
    name: 'Business profile',
    text: 'Agrees objectives, sites, period, workflows and exclusions before any fieldwork begins.',
  },
  {
    name: 'Guided discovery',
    text: 'A structured process for mapping how work actually moves and collecting evidence.',
  },
  {
    name: 'Specialist fieldwork modules',
    text: 'Such as the proof-of-delivery to invoice review, used only where the workflow is in scope.',
  },
  {
    name: 'Scoring rubric',
    text: 'Clear 1-5 definitions for each area, applied only where the evidence supports it.',
  },
  {
    name: 'Quality checks and client report',
    text: 'Checks completed before any findings are shared, and a clear client report.',
  },
];
