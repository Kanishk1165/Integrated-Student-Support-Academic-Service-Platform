/**
 * Security Test Suite for UniSupport Portal
 * Test various security scenarios
 */

const ADMIN_TOKEN = 'your-admin-jwt-token-here';
const STUDENT_TOKEN = 'your-student-jwt-token-here';
const DEPARTMENT_TOKEN = 'your-department-jwt-token-here';
const BASE_URL = 'http://localhost:5000/api';

const securityTests = [
    {
        name: "1. Test student cannot access admin-only getAllTickets",
        test: async () => {
            const response = await fetch(`${BASE_URL}/tickets`, {
                headers: { 'Authorization': `Bearer ${STUDENT_TOKEN}` }
            });
            console.log(`Status: ${response.status} (Should be 403)`);
        }
    },
    {
        name: "2. Test department cannot create tickets",
        test: async () => {
            const response = await fetch(`${BASE_URL}/tickets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${DEPARTMENT_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'Test Ticket',
                    description: 'This should fail',
                    category: 'Other'
                })
            });
            console.log(`Status: ${response.status} (Should be 403)`);
        }
    },
    {
        name: "3. Test studentId injection attack",
        test: async () => {
            const response = await fetch(`${BASE_URL}/tickets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${STUDENT_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'Test Ticket',
                    description: 'Testing injection',
                    category: 'Other',
                    studentId: 'different-student-id' // This should be blocked
                })
            });
            console.log(`Status: ${response.status} (Should be 400)`);
        }
    },
    {
        name: "4. Test NoSQL injection in filters",
        test: async () => {
            const response = await fetch(`${BASE_URL}/tickets/my?status[$ne]=open`, {
                headers: { 'Authorization': `Bearer ${STUDENT_TOKEN}` }
            });
            console.log(`Status: ${response.status} (Should work but sanitized)`);
        }
    },
    {
        name: "5. Test invalid status transitions",
        test: async () => {
            const response = await fetch(`${BASE_URL}/tickets/test-ticket-id/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${DEPARTMENT_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'open' // Invalid: cannot go from any status back to open
                })
            });
            console.log(`Status: ${response.status} (Should be 400)`);
        }
    },
    {
        name: "6. Test XSS prevention",
        test: async () => {
            const response = await fetch(`${BASE_URL}/tickets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${STUDENT_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: '<script>alert("XSS")</script>',
                    description: 'Test XSS <img src=x onerror=alert(1)>',
                    category: 'Other'
                })
            });
            console.log(`Status: ${response.status} (Should be 201 but content escaped)`);
        }
    }
];

// Run all tests
async function runSecurityTests() {
    console.log('🔒 Running Security Tests for UniSupport Portal\n');
    
    for (const test of securityTests) {
        console.log(`\n${test.name}:`);
        try {
            await test.test();
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }
}

// Note: Replace tokens with actual JWT tokens for testing
console.log('⚠️  Update ADMIN_TOKEN, STUDENT_TOKEN, and DEPARTMENT_TOKEN before running tests');

module.exports = { runSecurityTests };
