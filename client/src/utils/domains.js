export const DOMAINS = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    shortName: 'AI & ML',
    icon: 'Cpu',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
    description: 'Predictive diagnostics, deep learning models, neural classifiers, and clinical AI assistants.',
    // Weighted: strong AI-only signals score 2, generic ones score 1
    keywords: [
      { word: 'machine learning', weight: 3 },
      { word: 'deep learning',    weight: 3 },
      { word: 'neural',           weight: 3 },
      { word: 'ai assistant',     weight: 3 },
      { word: 'nlp',              weight: 3 },
      { word: 'computer vision',  weight: 3 },
      { word: 'fastapi',          weight: 2 },
      { word: 'diagnostic',       weight: 2 },
      { word: 'clinical',         weight: 2 },
      { word: 'python',           weight: 1 }, // generic — overridden by web signals
    ]
  },
  {
    id: 'web',
    name: 'Full-Stack Web Development',
    shortName: 'Full-Stack Web',
    icon: 'Globe',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #38bdf8, #2563eb)',
    description: 'Modern reactive web platforms, headless commerce stores, peer tutoring, and collaborative portals.',
    keywords: [
      { word: 'react',       weight: 2 },
      { word: 'next.js',     weight: 2 },
      { word: 'node.js',     weight: 2 },
      { word: 'express',     weight: 2 },
      { word: 'mongodb',     weight: 2 },
      { word: 'postgresql',  weight: 2 },
      { word: 'tailwind',    weight: 1 },
      { word: 'javascript',  weight: 1 },
      { word: 'chart.js',    weight: 1 },
      { word: 'html',        weight: 1 },
      { word: 'css',         weight: 1 },
    ]
  },
  {
    id: 'cloud-devops',
    name: 'Cloud, DevOps & Systems',
    shortName: 'Cloud & DevOps',
    icon: 'Cloud',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    description: 'High-throughput streaming clusters, microservice meshes, telemetry pipelines, and containerization.',
    keywords: [
      { word: 'docker',          weight: 3 },
      { word: 'kafka',           weight: 3 },
      { word: 'kubernetes',      weight: 3 },
      { word: 'microservices',   weight: 3 },
      { word: 'apache',          weight: 2 },
      { word: 'spark',           weight: 2 },
      { word: 'streaming',       weight: 2 },
      { word: 'redis',           weight: 2 },
      { word: 'websockets',      weight: 1 },
    ]
  },
  {
    id: 'mobile-pwa',
    name: 'Mobile & Progressive Web Apps',
    shortName: 'Mobile & Apps',
    icon: 'Smartphone',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    description: 'Offline-first SQLite Kanban workspaces, responsive cross-platform tools, and touch-optimized apps.',
    keywords: [
      { word: 'sqlite',       weight: 3 },
      { word: 'mobile',       weight: 3 },
      { word: 'pwa',          weight: 3 },
      { word: 'kanban',       weight: 2 },
      { word: 'typescript',   weight: 1 },
      { word: 'responsive',   weight: 1 },
    ]
  },
  {
    id: 'iot-embedded',
    name: 'IoT & Telemetry Systems',
    shortName: 'IoT & Hardware',
    icon: 'Radio',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    description: 'Geospatial GPS fleet tracking, LoRaWAN soil moisture monitors, and drone telemetry gateways.',
    keywords: [
      { word: 'iot',        weight: 3 },
      { word: 'arduino',    weight: 3 },
      { word: 'lorawan',    weight: 3 },
      { word: 'drone',      weight: 3 },
      { word: 'sensors',    weight: 2 },
      { word: 'gps',        weight: 2 },
      { word: 'soil',       weight: 2 },
      { word: 'telemetry',  weight: 1 },
    ]
  },
  {
    id: 'tools-security',
    name: 'Algorithms & Web3 Security',
    shortName: 'Tools & Security',
    icon: 'Terminal',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
    description: 'Static smart contract security auditors, interactive algorithm visualizers, and developer utilities.',
    keywords: [
      { word: 'solidity',    weight: 3 },
      { word: 'ethereum',    weight: 3 },
      { word: 'web3',        weight: 3 },
      { word: 'algorithms',  weight: 3 },
      { word: 'security',    weight: 2 },
      { word: 'auditor',     weight: 2 },
      { word: 'crypto',      weight: 2 },
      { word: 'canvas',      weight: 1 },
    ]
  }
];

/**
 * Classify a project into a domain using weighted keyword scoring.
 * Each domain keyword has a weight; the domain with the highest total
 * score wins — so a project with React(2) + Node.js(2) beats Python(1)
 * and correctly lands in Full-Stack Web instead of AI & ML.
 */
export function getProjectDomain(project) {
  if (!project) return DOMAINS[1];

  const tagsStr = Array.isArray(project.tags) ? project.tags.join(' ').toLowerCase() : '';
  const text = `${project.title || ''} ${project.description || ''} ${tagsStr}`.toLowerCase();

  let bestDomain = DOMAINS[1]; // default: Full-Stack Web
  let bestScore  = 0;

  for (const domain of DOMAINS) {
    let score = 0;
    for (const kw of domain.keywords) {
      if (text.includes(kw.word)) {
        score += kw.weight;
      }
    }
    if (score > bestScore) {
      bestScore  = score;
      bestDomain = domain;
    }
  }

  return bestDomain;
}

