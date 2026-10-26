const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_FILE = path.join(DB_DIR, 'showcase.db');
const db = new Database(DB_FILE);

// Enable WAL mode for high performance and durability
db.pragma('journal_mode = WAL');

function initializeDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      student_name TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT NOT NULL, -- JSON array of tags
      github_url TEXT NOT NULL,
      demo_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
  `);

  // Seed default admin if not exists
  const adminCheck = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@codenova.edu');
  if (!adminCheck) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Admin@123', salt);
    const adminId = 'usr_admin_' + Date.now();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminId, 'admin@codenova.edu', passwordHash, 'CodeNova Lead Moderator', 'admin', new Date().toISOString());
    console.log('[Database] Default admin user initialized: admin@codenova.edu / Admin@123');
  }

  // Seed initial projects if empty
  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
  if (projectCount === 0) {
    seedProjects();
  }
}

function seedProjects() {
  const seedList = [
    {
      id: 'proj_healthai_01',
      title: 'HealthAI - Predictive Diagnostic Assistant',
      student_name: 'Aarav Sharma',
      description: 'An AI-powered clinical risk assessment web application that processes patient vitals and symptoms to generate triaging recommendations for rural health centers.',
      tags: ['React', 'Python', 'Machine Learning', 'FastAPI'],
      github_url: 'https://github.com/aaravsharma/healthai-diagnostic',
      demo_url: 'https://healthai-demo.vercel.app',
      status: 'approved',
      admin_notes: 'Exceptional submission with clear clinical safety disclaimers.',
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'proj_ecotrack_02',
      title: 'EcoTrack - Campus Carbon Footprint Visualizer',
      student_name: 'Ananya Iyer',
      description: 'Interactive dashboard analyzing energy consumption, commuting habits, and cafeteria food waste across university campuses with gamified reduction targets.',
      tags: ['React', 'Node.js', 'Chart.js', 'MongoDB'],
      github_url: 'https://github.com/ananyaiyer/ecotrack-campus',
      demo_url: 'https://ecotrack-campus.netlify.app',
      status: 'approved',
      admin_notes: 'Great UI charts and impactful sustainability data.',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'proj_algolens_03',
      title: 'AlgoLens - Interactive Data Structures & Algorithms',
      student_name: 'Rohan Patel',
      description: 'Step-by-step visualizer for graph algorithms, dynamic programming, sorting, and tree balance rotations with custom test-case editors and playback controls.',
      tags: ['JavaScript', 'Canvas', 'React', 'Algorithms'],
      github_url: 'https://github.com/rohanpatel/algolens-visualizer',
      demo_url: 'https://algolens.surge.sh',
      status: 'approved',
      admin_notes: 'Super useful pedagogical tool for CS undergraduates.',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'proj_campusflow_04',
      title: 'CampusFlow - Peer Tutoring & Resource Exchange',
      student_name: 'Sneha Kulkarni',
      description: 'Centralized peer study platform featuring verified course notes, scheduled 1-on-1 tutoring sessions with calendar synchronization, and anonymous Q&A.',
      tags: ['React', 'Express', 'Tailwind', 'PostgreSQL'],
      github_url: 'https://github.com/snehak/campusflow-study',
      demo_url: 'https://campusflow.vercel.app',
      status: 'approved',
      admin_notes: 'Clean code architecture and responsive mobile layout.',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'proj_devcollab_05',
      title: 'DevCollab - Real-Time Code Pairing Sandbox',
      student_name: 'Vikram Sengupta',
      description: 'Browser-based collaborative code editor supporting syntax highlighting for 12 languages, WebRTC audio rooms, and containerized code execution output.',
      tags: ['WebSockets', 'React', 'Node.js', 'Docker'],
      github_url: 'https://github.com/vikramsengupta/devcollab-sandbox',
      demo_url: 'https://devcollab-pairing.vercel.app',
      status: 'approved',
      admin_notes: 'High technical complexity; well-implemented concurrency handling.',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'proj_crypto_06',
      title: 'BlockWatch - Decentralized Smart Contract Auditor',
      student_name: 'Kavya Nair',
      description: 'Static analysis parser for Solidity smart contracts highlighting reentrancy vulnerabilities, gas optimization opportunities, and integer overflow checks.',
      tags: ['Solidity', 'Ethereum', 'Python', 'Web3'],
      github_url: 'https://github.com/kavyanair/blockwatch-auditor',
      demo_url: 'https://blockwatch-audit.eth.limo',
      status: 'pending',
      admin_notes: null,
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 18 * 3600000).toISOString()
    },
    {
      id: 'proj_agritech_07',
      title: 'KisanMitra - Soil Moisture & Crop Advisory IoT',
      student_name: 'Deepak Verma',
      description: 'IoT telemetry gateway collecting NPK soil sensor metrics via LoRaWAN with vernacular audio advisories for regional smallholder farmers.',
      tags: ['IoT', 'Node.js', 'Arduino', 'Machine Learning'],
      github_url: 'https://github.com/deepakverma/kisanmitra-soil-iot',
      demo_url: 'https://kisanmitra-advisory.org',
      status: 'pending',
      admin_notes: null,
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600000).toISOString()
    },
    {
      id: 'proj_broken_08',
      title: 'Simple Portfolio Template v1',
      student_name: 'Unknown User',
      description: 'Basic HTML CSS template lacking live documentation or complete features.',
      tags: ['HTML', 'CSS'],
      github_url: 'https://github.com/unknown/portfolio-test',
      demo_url: 'https://portfolio-test.example.com',
      status: 'rejected',
      admin_notes: 'Incomplete project description and repository contains unpopulated boilerplate.',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 86400000).toISOString()
    },
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
    INSERT INTO projects (id, title, student_name, description, tags, github_url, demo_url, status, admin_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of seedList) {
    insert.run(
      item.id,
      item.title,
      item.student_name,
      item.description,
      JSON.stringify(item.tags),
      item.github_url,
      item.demo_url,
      item.status,
      item.admin_notes,
      item.created_at,
      item.updated_at
    );
  }

  console.log(`[Database] Seeded ${seedList.length} initial projects (Approved, Pending, and Rejected).`);
}

initializeDatabase();

module.exports = db;
