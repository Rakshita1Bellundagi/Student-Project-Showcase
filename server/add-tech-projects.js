const db = require('./src/database');

const newTechProjects = [
  {
    id: 'proj_localvault_09',
    title: 'LocalVault - Encrypted Offline Password & Secret Manager',
    student_name: 'Pooja Deshmukh',
    description: 'A zero-knowledge, offline-first personal credential and secure note vault utilizing AES-256-GCM encryption with local SQLite relational storage and encrypted auto-backup snapshots.',
    tags: ['SQLite', 'React', 'TypeScript', 'Node.js'],
    github_url: 'https://github.com/poojadeshmukh/localvault-sqlite',
    demo_url: 'https://localvault-demo.vercel.app',
    status: 'approved',
    admin_notes: 'Verified offline storage integrity and client-side encryption.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'proj_eduportal_10',
    title: 'EduPortal - Campus Examination & Registration Engine',
    student_name: 'Siddharth Menon',
    description: 'A high-concurrency university portal handling course enrollment, grade point recalculations, and automated seating hall ticket allocation using a MySQL relational engine with transaction isolation.',
    tags: ['MySQL', 'React', 'Node.js', 'Express'],
    github_url: 'https://github.com/siddharthmenon/eduportal-mysql',
    demo_url: 'https://eduportal-campus.surge.sh',
    status: 'approved',
    admin_notes: 'Excellent relational normalization and database transaction handling.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'proj_logstream_11',
    title: 'LogStream - High-Throughput Log Streaming Pipeline',
    student_name: 'Rishabh Tandon',
    description: 'Distributed telemetry cluster ingesting 50,000 log events/second with partition-balanced streaming, Apache Kafka broker topologies, and Apache Spark batch windowing.',
    tags: ['Apache', 'Docker', 'Python', 'WebSockets'],
    github_url: 'https://github.com/rishabhtandon/logstream-apache',
    demo_url: 'https://logstream-analytics.surge.sh',
    status: 'approved',
    admin_notes: 'Superb enterprise streaming architecture and throughput benchmarks.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'proj_shopsphere_12',
    title: 'ShopSphere - Headless Multi-Vendor Commerce Platform',
    student_name: 'Meera Krishnan',
    description: 'High-performance Next.js 14 e-commerce store with server-side rendering, dynamic inventory caching with MongoDB Atlas, and integrated payment processing webhooks.',
    tags: ['Next.js', 'MongoDB', 'React', 'Tailwind'],
    github_url: 'https://github.com/meerakrishnan/shopsphere-nextjs',
    demo_url: 'https://shopsphere-store.vercel.app',
    status: 'approved',
    admin_notes: 'Fast SSR performance with clean MongoDB aggregation pipelines.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'proj_fleettrack_13',
    title: 'FleetTrack - Real-Time Supply Chain & Logistics Dashboard',
    student_name: 'Divya Sundaram',
    description: 'Supply-chain telemetry dashboard tracking GPS fleet coordinates, geofence breaches, and temperature sensors stored across MongoDB collections with 2dsphere geospatial indices.',
    tags: ['MongoDB', 'Next.js', 'Node.js', 'IoT'],
    github_url: 'https://github.com/divyasundaram/fleettrack-mongo',
    demo_url: 'https://fleettrack-iot.vercel.app',
    status: 'approved',
    admin_notes: 'Impressive geospatial query optimizations and interactive telemetry.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'proj_quicktask_14',
    title: 'QuickTask - Agile Kanban Workspace with Local Persistence',
    student_name: 'Nikhil Rawat',
    description: 'Collaborative project tracking board with instantaneous client-side persistence in SQLite, optimistic UI mutations, and cross-tab multi-user synchronization.',
    tags: ['SQLite', 'Next.js', 'TypeScript', 'Tailwind'],
    github_url: 'https://github.com/nikhilrawat/quicktask-board',
    demo_url: 'https://quicktask-app.netlify.app',
    status: 'approved',
    admin_notes: 'Snappy UI with robust offline-first SQLite synchronization.',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'proj_datapulse_15',
    title: 'DataPulse - Distributed Cluster Monitoring Engine',
    student_name: 'Harsh Vardhan',
    description: 'Monitoring dashboard for enterprise Apache Kafka clusters and Apache Spark streaming jobs with worker node health metrics, consumer group lag, and latency heatmaps.',
    tags: ['Apache', 'MySQL', 'React', 'Node.js'],
    github_url: 'https://github.com/harshvardhan/datapulse-apache',
    demo_url: 'https://datapulse-monitor.surge.sh',
    status: 'approved',
    admin_notes: 'Rich monitoring UI with comprehensive Apache metrics support.',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600000).toISOString()
  }
];

const insert = db.prepare(`
  INSERT OR REPLACE INTO projects (id, title, student_name, description, tags, github_url, demo_url, status, admin_notes, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const p of newTechProjects) {
  insert.run(
    p.id,
    p.title,
    p.student_name,
    p.description,
    JSON.stringify(p.tags),
    p.github_url,
    p.demo_url,
    p.status,
    p.admin_notes,
    p.created_at,
    p.updated_at
  );
  console.log(`Added/Updated project: ${p.title} (${p.tags.join(', ')})`);
}

console.log(`\nSuccessfully added ${newTechProjects.length} new tech stack projects!`);
