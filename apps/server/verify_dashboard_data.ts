
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

async function verify() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'Test123!'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log('   Logged in successfully.');

        console.log('2. Creating project...');
        const projectRes = await fetch(`${API_URL}/v1/projects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Verification Project', url: 'https://verify.com' })
        });

        if (!projectRes.ok) throw new Error(`Create project failed: ${projectRes.statusText}`);
        const projectData = await projectRes.json();
        const projectId = projectData.id;
        console.log(`   Project created: ${projectId}`);

        console.log('3. Updating project stats in DB...');
        await prisma.project.update({
            where: { id: projectId },
            data: {
                onPageScore: 88,
                totalIssues: 5,
                totalPages: 120
            }
        });
        console.log('   DB updated.');

        console.log('4. Fetching project from API...');
        const getRes = await fetch(`${API_URL}/v1/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!getRes.ok) throw new Error(`Get project failed: ${getRes.statusText}`);
        const project = await getRes.json();
        console.log('   Project data received:', project);

        if (
            project.onPageScore === '88%' &&
            project.problems === '5' &&
            project.pages === '120'
        ) {
            console.log('✅ VERIFICATION SUCCESSFUL: API returns correct stats!');
        } else {
            console.error('❌ VERIFICATION FAILED: API returned incorrect stats.');
            console.log('Expected: 88%, 5, 120');
            console.log(`Actual: ${project.onPageScore}, ${project.problems}, ${project.pages}`);
        }

    } catch (error: any) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
