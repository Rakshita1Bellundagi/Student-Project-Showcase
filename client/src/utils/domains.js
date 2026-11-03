export const DOMAINS = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    shortName: 'AI & ML',
    icon: 'Cpu',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
    description: 'Predictive diagnostics, deep learning models, neural classifiers, and clinical AI assistants.',
    keywords: ['machine learning', 'python', 'fastapi', 'deep learning', 'ai', 'diagnostic', 'clinical', 'telemetry']
  },
  {
    id: 'web',
    name: 'Full-Stack Web Development',
    shortName: 'Full-Stack Web',
    icon: 'Globe',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #38bdf8, #2563eb)',
    description: 'Modern reactive web platforms, headless commerce stores, peer tutoring, and collaborative portals.',
    keywords: ['react', 'next.js', 'node.js', 'express', 'tailwind', 'mongodb', 'postgresql', 'javascript', 'html', 'css', 'chart.js']
  },
  {
    id: 'cloud-devops',
    name: 'Cloud, DevOps & Systems',
    shortName: 'Cloud & DevOps',
    icon: 'Cloud',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    description: 'High-throughput streaming clusters, microservice meshes, telemetry pipelines, and containerization.',
    keywords: ['docker', 'apache', 'websockets', 'redis', 'kafka', 'spark', 'microservices', 'kubernetes', 'streaming']
  },
  {
    id: 'mobile-pwa',
    name: 'Mobile & Progressive Web Apps',
    shortName: 'Mobile & Apps',
    icon: 'Smartphone',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    description: 'Offline-first SQLite Kanban workspaces, responsive cross-platform tools, and touch-optimized apps.',
    keywords: ['sqlite', 'typescript', 'mobile', 'pwa', 'responsive', 'kanban']
  },
  {
    id: 'iot-embedded',
    name: 'IoT & Telemetry Systems',
    shortName: 'IoT & Hardware',
    icon: 'Radio',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    description: 'Geospatial GPS fleet tracking, LoRaWAN soil moisture monitors, and drone telemetry gateways.',
    keywords: ['iot', 'arduino', 'lorawan', 'sensors', 'gps', 'telemetry', 'drone', 'soil']
  },
  {
    id: 'tools-security',
    name: 'Algorithms & Web3 Security',
    shortName: 'Tools & Security',
    icon: 'Terminal',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
    description: 'Static smart contract security auditors, interactive algorithm visualizers, and developer utilities.',
    keywords: ['solidity', 'ethereum', 'web3', 'algorithms', 'canvas', 'security', 'auditor', 'crypto']
  }
];

export function getProjectDomain(project) {
  if (!project) return DOMAINS[1];
  const tagsStr = Array.isArray(project.tags) ? project.tags.join(' ').toLowerCase() : '';
  const text = `${project.title || ''} ${project.description || ''} ${tagsStr}`.toLowerCase();

  for (const domain of DOMAINS) {
    for (const kw of domain.keywords) {
      if (text.includes(kw.toLowerCase())) {
        return domain;
      }
    }
  }
  return DOMAINS[1]; // default to Web
}

