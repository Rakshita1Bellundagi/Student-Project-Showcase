const db = require('./src/database');

console.log('\n========================================================================');
console.log('📊 DATABASE CONTENTS: SHOWCASE.DB (SQLite)');
console.log('========================================================================\n');

console.log('👤 USERS TABLE:');
const users = db.prepare('SELECT id, email, name, role, created_at FROM users').all();
console.table(users);

console.log('\n📚 PROJECTS TABLE:');
const projects = db.prepare('SELECT id, title, student_name, status, created_at FROM projects').all();
console.table(projects);

console.log('\n📈 SUMMARY METRICS:');
const total = db.prepare('SELECT COUNT(*) as total FROM projects').get().total;
const pending = db.prepare("SELECT COUNT(*) as pending FROM projects WHERE status = 'pending'").get().pending;
const approved = db.prepare("SELECT COUNT(*) as approved FROM projects WHERE status = 'approved'").get().approved;
const rejected = db.prepare("SELECT COUNT(*) as rejected FROM projects WHERE status = 'rejected'").get().rejected;

console.table([
  { Metric: 'Total Submissions', Count: total },
  { Metric: 'Pending Review', Count: pending },
  { Metric: 'Approved Showcase', Count: approved },
  { Metric: 'Rejected', Count: rejected }
]);

console.log('========================================================================\n');
