/**
 * Automated Test Suite for Student Project Showcase Portal API
 * Verifies Acceptance Criteria TC-01 through TC-10 from PRD Section 10
 */

const { app, server } = require('../src/server');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting PRD Acceptance Criteria Test Suite ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, testId, description) {
    if (condition) {
      console.log(`✅ [PASS] ${testId}: ${description}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testId}: ${description}`);
      failed++;
    }
  }

  try {
    // TC-04: Open public gallery with pending/rejected projects in database
    const galleryRes = await fetch(`${BASE_URL}/projects`);
    const galleryData = await galleryRes.json();
    assert(
      galleryRes.status === 200 &&
      Array.isArray(galleryData.projects) &&
      galleryData.projects.every(p => p.status === 'approved') &&
      galleryData.projects.length >= 5,
      'TC-04',
      'Public gallery returns ONLY approved projects (pending and rejected are hidden)'
    );

    // TC-02: Submit form with missing required fields
    const missingRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '', student_name: '' })
    });
    const missingData = await missingRes.json();
    assert(
      missingRes.status === 400 && missingData.errors && missingData.errors.title && missingData.errors.student_name,
      'TC-02',
      'Missing required fields rejected with field-specific validation errors'
    );

    // TC-03: Submit invalid GitHub URL
    const invalidGitRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Quantum Simulator',
        student_name: 'Test Student',
        description: 'Simulating quantum logic gates with wave functions.',
        tags: ['Python', 'Quantum'],
        github_url: 'https://not-github.com/test/repo', // Invalid host
        demo_url: 'https://test-demo.vercel.app'
      })
    });
    const invalidGitData = await invalidGitRes.json();
    assert(
      invalidGitRes.status === 400 && invalidGitData.errors && invalidGitData.errors.github_url,
      'TC-03',
      'Invalid GitHub URL rejected by server before saving'
    );

    // TC-01: Submit a valid project
    const validRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'NeuroVibe - BCI Music Synthesizer',
        student_name: 'Mira Nair',
        description: 'A brain-computer interface synthesizer translating EEG brainwave frequencies into ambient MIDI audio landscapes.',
        tags: ['React', 'WebAudio', 'Python', 'EEG'],
        github_url: 'https://github.com/miranair/neurovibe-bci',
        demo_url: 'https://neurovibe.surge.sh'
      })
    });
    const validData = await validRes.json();
    const createdProjectId = validData.project?.id;
    assert(
      validRes.status === 201 &&
      validData.success === true &&
      validData.project.status === 'pending',
      'TC-01',
      'Valid submission is saved with status pending'
    );

    // Verify it does NOT appear in public gallery yet (TC-04 reinforcement)
    const galleryCheckRes = await fetch(`${BASE_URL}/projects`);
    const galleryCheckData = await galleryCheckRes.json();
    assert(
      !galleryCheckData.projects.some(p => p.id === createdProjectId),
      'TC-04 (Follow-up)',
      'Newly submitted pending project is NOT visible in public gallery'
    );

    // TC-10: Attempt admin action without permission
    const unauthorizedRes = await fetch(`${BASE_URL}/admin/projects`);
    assert(
      unauthorizedRes.status === 401,
      'TC-10',
      'Admin endpoint rejected without valid Bearer token'
    );

    // Admin Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@codenova.edu',
        password: 'Admin@123'
      })
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.token;
    assert(
      loginRes.status === 200 && Boolean(adminToken),
      'AUTH-01',
      'Admin logged in and received valid JWT token'
    );

    // TC-05: Admin approves the pending project
    const approveRes = await fetch(`${BASE_URL}/admin/projects/${createdProjectId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved', admin_notes: 'Verified repository and live demo.' })
    });
    const approveData = await approveRes.json();
    assert(
      approveRes.status === 200 && approveData.project.status === 'approved',
      'TC-05 (Part 1)',
      'Admin successfully approved project'
    );

    // Verify it is now visible in public gallery
    const publicAfterApproveRes = await fetch(`${BASE_URL}/projects`);
    const publicAfterApproveData = await publicAfterApproveRes.json();
    assert(
      publicAfterApproveData.projects.some(p => p.id === createdProjectId),
      'TC-05 (Part 2)',
      'Approved project is now publicly visible in public gallery'
    );

    // TC-06: Admin rejects a project
    const rejectRes = await fetch(`${BASE_URL}/admin/projects/${createdProjectId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'rejected', admin_notes: 'Demo link expired.' })
    });
    const rejectData = await rejectRes.json();
    assert(
      rejectRes.status === 200 && rejectData.project.status === 'rejected',
      'TC-06 (Part 1)',
      'Admin successfully changed status to rejected'
    );

    // Verify it disappears from public gallery
    const publicAfterRejectRes = await fetch(`${BASE_URL}/projects`);
    const publicAfterRejectData = await publicAfterRejectRes.json();
    assert(
      !publicAfterRejectData.projects.some(p => p.id === createdProjectId),
      'TC-06 (Part 2)',
      'Rejected project is immediately hidden from public gallery'
    );

    // TC-07: Search for project title
    const searchRes = await fetch(`${BASE_URL}/projects?search=HealthAI`);
    const searchData = await searchRes.json();
    assert(
      searchRes.status === 200 &&
      searchData.projects.length >= 1 &&
      searchData.projects.every(p => p.title.toLowerCase().includes('healthai')),
      'TC-07',
      'Search query returns matching approved projects'
    );

    // TC-08: Select technology tag
    const tagRes = await fetch(`${BASE_URL}/projects?tag=Python`);
    const tagData = await tagRes.json();
    assert(
      tagRes.status === 200 &&
      tagData.projects.length >= 1 &&
      tagData.projects.every(p => p.tags.map(t => t.toLowerCase()).includes('python')),
      'TC-08',
      'Tag filter returns matching approved projects'
    );

    // TC-09: Combine search and tag filters
    const combinedRes = await fetch(`${BASE_URL}/projects?search=Clinical&tag=FastAPI`);
    const combinedData = await combinedRes.json();
    assert(
      combinedRes.status === 200 &&
      combinedData.projects.length >= 1 &&
      combinedData.projects[0].title.includes('HealthAI'),
      'TC-09',
      'Combined search term and technology tag filter works reactively'
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
    if (server && server.listening) {
      server.close();
    }
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Allow server to listen before test execution
setTimeout(runTests, 400);
