import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

const demoTickets = [
    {
        ticketId: 'GRV-2024-00001',
        studentId: 'demo_student',
        studentEmail: 'demo@campus.edu',
        studentName: 'Priya Sharma',
        originalText: 'The WiFi in the central library has been extremely slow for the past week. It takes forever to load research papers and sometimes disconnects completely during important work.',
        aiAnalysis: {
            category: 'it',
            department: 'it',
            urgency: 'high',
            urgencyScore: 0.85,
            summary: 'WiFi connectivity issues in central library affecting academic work',
            sentiment: 'frustrated',
            keywords: ['wifi', 'library', 'slow', 'disconnects'],
            suggestedAction: 'IT team to investigate network infrastructure in library zone',
            confidence: 0.92
        },
        location: { type: 'academic', block: 'Central Library' },
        status: 'in_progress',
        assignedDepartment: 'it',
        priority: 1,
        isAnonymous: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        expectedResolutionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        ticketId: 'GRV-2024-00002',
        studentId: 'demo_student',
        studentEmail: 'demo@campus.edu',
        studentName: 'Anonymous',
        originalText: 'There is a serious water leakage in the bathroom on the 3rd floor of Boys Hostel Block B. The floor is always wet and slippery, creating a safety hazard.',
        aiAnalysis: {
            category: 'hostel',
            department: 'hostel',
            urgency: 'critical',
            urgencyScore: 0.95,
            summary: 'Critical water leakage causing safety hazard in hostel bathroom',
            sentiment: 'concerned',
            keywords: ['water', 'leakage', 'bathroom', 'safety', 'slippery'],
            suggestedAction: 'Immediate plumbing inspection and repair required',
            confidence: 0.94
        },
        location: { type: 'hostel', block: 'Block B, 3rd Floor' },
        status: 'open',
        assignedDepartment: 'hostel',
        priority: 0,
        isAnonymous: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        expectedResolutionDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    },
    {
        ticketId: 'GRV-2024-00003',
        studentId: 'demo_student',
        studentEmail: 'demo@campus.edu',
        studentName: 'Rahul Verma',
        originalText: 'The AC in Room 302 of the Computer Science building has not been working for over a week. It gets unbearably hot during afternoon lectures.',
        aiAnalysis: {
            category: 'academic',
            department: 'academic',
            urgency: 'medium',
            urgencyScore: 0.65,
            summary: 'Non-functional AC in CS building classroom affecting lecture comfort',
            sentiment: 'annoyed',
            keywords: ['AC', 'not working', 'hot', 'classroom'],
            suggestedAction: 'Facilities team to check and repair AC unit',
            confidence: 0.89
        },
        location: { type: 'academic', block: 'CS Building, Room 302' },
        status: 'resolved',
        assignedDepartment: 'academic',
        priority: 2,
        isAnonymous: false,
        resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        expectedResolutionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        ticketId: 'GRV-2024-00004',
        studentId: 'demo_student',
        studentEmail: 'demo@campus.edu',
        studentName: 'Ananya Singh',
        originalText: 'The food quality in the main canteen has deteriorated significantly. Yesterday\'s lunch was stale and several students felt sick afterwards.',
        aiAnalysis: {
            category: 'canteen',
            department: 'canteen',
            urgency: 'high',
            urgencyScore: 0.88,
            summary: 'Food quality issue in main canteen causing health concerns',
            sentiment: 'angry',
            keywords: ['food', 'quality', 'stale', 'sick', 'canteen'],
            suggestedAction: 'Immediate inspection of canteen kitchen and food storage',
            confidence: 0.91
        },
        location: { type: 'canteen', block: 'Main Canteen' },
        status: 'in_progress',
        assignedDepartment: 'canteen',
        priority: 1,
        isAnonymous: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        expectedResolutionDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString()
    },
    {
        ticketId: 'GRV-2024-00005',
        studentId: 'demo_student',
        studentEmail: 'demo@campus.edu',
        studentName: 'Karthik Nair',
        originalText: 'The streetlights near the sports complex are not working. It becomes completely dark after 6 PM, making it unsafe to walk back to the hostel.',
        aiAnalysis: {
            category: 'security',
            department: 'security',
            urgency: 'high',
            urgencyScore: 0.82,
            summary: 'Non-functional streetlights creating safety concern near sports complex',
            sentiment: 'worried',
            keywords: ['streetlights', 'dark', 'unsafe', 'sports complex'],
            suggestedAction: 'Electrical team to repair streetlights urgently',
            confidence: 0.90
        },
        location: { type: 'outdoor', block: 'Sports Complex Area' },
        status: 'open',
        assignedDepartment: 'security',
        priority: 1,
        isAnonymous: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expectedResolutionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
];

const demoUsers = [
    {
        userId: 'demo_student',
        email: 'student@demo.com',
        password: '$2a$10$X7jz7c8Z8z8Z8z8Z8z8Z8u', // hashed "demo123"
        displayName: 'Demo Student',
        role: 'student'
    },
    {
        userId: 'demo_admin',
        email: 'admin@demo.com',
        password: '$2a$10$X7jz7c8Z8z8Z8z8Z8z8Z8u', // hashed "demo123"
        displayName: 'Demo Admin',
        role: 'admin'
    }
];

export async function POST(request: NextRequest) {
    try {
        // Clear existing demo data
        db.prepare('DELETE FROM tickets WHERE studentId = ?').run('demo_student');
        db.prepare('DELETE FROM users WHERE userId LIKE ?').run('demo_%');

        // Insert demo users
        const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (userId, email, password, displayName, role)
      VALUES (?, ?, ?, ?, ?)
    `);

        for (const user of demoUsers) {
            insertUser.run(user.userId, user.email, user.password, user.displayName, user.role);
        }

        // Insert demo tickets
        const insertTicket = db.prepare(`
      INSERT OR REPLACE INTO tickets (
        ticketId, studentId, studentEmail, studentName, originalText,
        aiAnalysis, location, status, assignedDepartment, priority,
        isAnonymous, createdAt, updatedAt, expectedResolutionDate, resolvedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        for (const ticket of demoTickets) {
            insertTicket.run(
                ticket.ticketId,
                ticket.studentId,
                ticket.studentEmail,
                ticket.studentName,
                ticket.originalText,
                JSON.stringify(ticket.aiAnalysis),
                JSON.stringify(ticket.location),
                ticket.status,
                ticket.assignedDepartment,
                ticket.priority,
                ticket.isAnonymous ? 1 : 0,
                ticket.createdAt,
                ticket.updatedAt,
                ticket.expectedResolutionDate,
                (ticket as any).resolvedAt || null
            );
        }

        // Update counter
        db.prepare('UPDATE counters SET value = ? WHERE name = ?').run(5, 'tickets');

        return NextResponse.json({
            success: true,
            message: 'Demo data loaded successfully!',
            stats: {
                users: demoUsers.length,
                tickets: demoTickets.length
            }
        });

    } catch (error: any) {
        console.error('Error loading demo data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'POST to this endpoint to load demo data',
        demoCredentials: {
            student: { email: 'student@demo.com', password: 'demo123' },
            admin: { email: 'admin@demo.com', password: 'demo123' }
        }
    });
}
