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
