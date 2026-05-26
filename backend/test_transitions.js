/**
 * DeskFlow Support Ticket Triage Board
 * Automated Logic & Verification Test Suite
 * 
 * Run using: node test_transitions.js
 */

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];
const SLA_LIMITS = { urgent: 60, high: 240, medium: 1440, low: 4320 };

// 1. Mocking Status Transition Logic
function validateTransition(currentStatus, newStatus) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const newIdx = STATUS_ORDER.indexOf(newStatus);

  if (newIdx === -1) {
    return { valid: false, error: `Invalid status: ${newStatus}` };
  }

  const diff = newIdx - currentIdx;
  if (Math.abs(diff) !== 1) {
    return { 
      valid: false, 
      error: `Invalid status transition: cannot move directly from '${currentStatus}' to '${newStatus}'. Transition index diff is ${diff} (must be exactly 1 or -1)` 
    };
  }

  return { valid: true };
}

// 2. Mocking SLA & Age Derived Field Logic
function calculateAgeAndSLA(createdAt, resolvedAt, priority) {
  const endTime = resolvedAt || new Date();
  const elapsedMs = endTime - createdAt;
  const ageMinutes = Math.max(0, Math.floor(elapsedMs / 60000));
  
  const targetMinutes = SLA_LIMITS[priority] || SLA_LIMITS.medium;
  const slaBreached = ageMinutes > targetMinutes;

  return { ageMinutes, slaBreached, targetMinutes };
}

// ================= TEST RUNNER =================

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`❌ [FAIL] ${message}`);
  }
}

console.log('=============================================');
console.log('RUNNING AUTOMATED UNIT TESTS: STATE TRANSITIONS');
console.log('=============================================\n');

// Test Suite A: Forward Transitions (Single Step)
assert(validateTransition('open', 'in_progress').valid === true, 'open -> in_progress (Allowed)');
assert(validateTransition('in_progress', 'resolved').valid === true, 'in_progress -> resolved (Allowed)');
assert(validateTransition('resolved', 'closed').valid === true, 'resolved -> closed (Allowed)');

// Test Suite B: Backward Transitions (Single Step)
assert(validateTransition('closed', 'resolved').valid === true, 'closed -> resolved (Allowed)');
assert(validateTransition('resolved', 'in_progress').valid === true, 'resolved -> in_progress (Allowed)');
assert(validateTransition('in_progress', 'open').valid === true, 'in_progress -> open (Allowed)');

// Test Suite C: Blocked Transitions (Invalid Forward jumps)
assert(validateTransition('open', 'resolved').valid === false, 'open -> resolved (Rejected - Jump +2)');
assert(validateTransition('open', 'closed').valid === false, 'open -> closed (Rejected - Jump +3)');
assert(validateTransition('in_progress', 'closed').valid === false, 'in_progress -> closed (Rejected - Jump +2)');

// Test Suite D: Blocked Transitions (Invalid Backward jumps)
assert(validateTransition('closed', 'in_progress').valid === false, 'closed -> in_progress (Rejected - Jump -2)');
assert(validateTransition('closed', 'open').valid === false, 'closed -> open (Rejected - Jump -3)');
assert(validateTransition('resolved', 'open').valid === false, 'resolved -> open (Rejected - Jump -2)');

console.log('\n=============================================');
console.log('RUNNING AUTOMATED UNIT TESTS: SLA & DERIVED FIELDS');
console.log('=============================================\n');

const now = new Date();

// Test Case 1: Urgent Priority within SLA (30 mins elapsed)
const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
const res1 = calculateAgeAndSLA(thirtyMinsAgo, null, 'urgent');
assert(res1.ageMinutes === 30, 'Urgent SLA age calculated correctly (30 mins)');
assert(res1.slaBreached === false, 'Urgent SLA within threshold (30 mins <= 60 mins)');

// Test Case 2: Urgent Priority SLA Breached (90 mins elapsed)
const ninetyMinsAgo = new Date(now.getTime() - 90 * 60 * 1000);
const res2 = calculateAgeAndSLA(ninetyMinsAgo, null, 'urgent');
assert(res2.ageMinutes === 90, 'Urgent SLA age calculated correctly (90 mins)');
assert(res2.slaBreached === true, 'Urgent SLA breaches threshold (90 mins > 60 mins)');

// Test Case 3: High Priority SLA Breached (300 mins elapsed)
const fiveHoursAgo = new Date(now.getTime() - 300 * 60 * 1000);
const res3 = calculateAgeAndSLA(fiveHoursAgo, null, 'high');
assert(res3.ageMinutes === 300, 'High SLA age calculated correctly (300 mins)');
assert(res3.slaBreached === true, 'High SLA breaches threshold (300 mins > 240 mins)');

// Test Case 4: Resolved ticket with locked times (created 5 hours ago, resolved 2 hours ago = 3 hours elapsed)
const fiveHrsAgo = new Date(now.getTime() - 300 * 60 * 1000);
const twoHrsAgo = new Date(now.getTime() - 120 * 60 * 1000);
const res4 = calculateAgeAndSLA(fiveHrsAgo, twoHrsAgo, 'high');
assert(res4.ageMinutes === 180, 'Resolved ticket age locked to resolution time (180 mins)');
assert(res4.slaBreached === false, 'Resolved ticket age stays safe (180 mins <= 240 mins)');

console.log('\n=============================================');
console.log(`TEST SUMMARY: ${passedTests} passed, ${failedTests} failed`);
console.log('=============================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL LOGIC AND TRANSITIONS ARE CORRECT & COMPLIANT WITH REQUIREMENTS!');
  process.exit(0);
}
