import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { classifyGrievance, generateStudentResponse } from '@/lib/gemini';

// Generate ticket ID
function generateTicketId(): string {
    const year = new Date().getFullYear();

    // Get and increment counter
    const counter = db.prepare('SELECT value FROM counters WHERE name = ?').get('tickets') as any;
    const newValue = (counter?.value || 0) + 1;
    db.prepare('UPDATE counters SET value = ? WHERE name = ?').run(newValue, 'tickets');

    return `GRV-${year}-${String(newValue).padStart(5, '0')}`;
}

// Calculate SLA deadline
function calculateSLADeadline(urgency: string): string {
    const slaHours: Record<string, number> = {
        critical: 4, high: 24, medium: 72, low: 168
    };
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + (slaHours[urgency] || 72));
    return deadline.toISOString();
}

// POST - Create new ticket
export async function POST(request: NextRequest) {
    try {
        const { grievanceText, location, block, isAnonymous, userId, userEmail, userName } = await request.json();

        // Classify grievance using Gemini AI
        const aiAnalysis = await classifyGrievance(grievanceText, location || '', new Date().toISOString());

        // Generate ticket ID
        const ticketId = generateTicketId();

        // Create ticket
        db.prepare(`
      INSERT INTO tickets (
        ticketId, studentId, studentEmail, studentName, originalText,
        aiAnalysis, location, status, assignedDepartment, 
        expectedResolutionDate, isAnonymous, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            ticketId,
            userId,
            userEmail,
            isAnonymous ? 'Anonymous' : userName,
            grievanceText,
            JSON.stringify(aiAnalysis),
            JSON.stringify({ type: aiAnalysis.category, block: block || null }),
            'open',
            aiAnalysis.department,
            calculateSLADeadline(aiAnalysis.urgency),
            isAnonymous ? 1 : 0,
            aiAnalysis.urgency === 'critical' ? 0 : aiAnalysis.urgency === 'high' ? 1 : aiAnalysis.urgency === 'medium' ? 2 : 3
        );

        // Generate acknowledgement
        const response = await generateStudentResponse(
            ticketId,
            isAnonymous ? 'Student' : userName,
            grievanceText,
            aiAnalysis.category,
            aiAnalysis.department,
            aiAnalysis.urgency,
            'acknowledgement'
        );

        return NextResponse.json({
            success: true,
            ticketId,
            message: response.fullMessage,
            aiAnalysis
        });

    } catch (error: any) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET - Get tickets
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        const isAdmin = request.nextUrl.searchParams.get('isAdmin') === 'true';
        const ticketId = request.nextUrl.searchParams.get('ticketId');

        // Get single ticket
        if (ticketId) {
            const ticket = db.prepare('SELECT * FROM tickets WHERE ticketId = ?').get(ticketId) as any;
            if (!ticket) {
                return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
            }
            return NextResponse.json({
                ticket: {
                    ...ticket,
                    aiAnalysis: JSON.parse(ticket.aiAnalysis || '{}'),
                    location: JSON.parse(ticket.location || '{}'),
                    relatedTickets: JSON.parse(ticket.relatedTickets || '[]'),
                    attachments: JSON.parse(ticket.attachments || '[]'),
                    isDuplicate: Boolean(ticket.isDuplicate),
                    isAnonymous: Boolean(ticket.isAnonymous)
                }
            });
        }

        // Get all tickets (admin) or user tickets
        let tickets;
        if (isAdmin) {
            tickets = db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC LIMIT 100').all();
        } else if (userId) {
            tickets = db.prepare('SELECT * FROM tickets WHERE studentId = ? ORDER BY createdAt DESC LIMIT 50').all(userId);
        } else {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Parse JSON fields
        const parsedTickets = (tickets as any[]).map(ticket => ({
            ...ticket,
            aiAnalysis: JSON.parse(ticket.aiAnalysis || '{}'),
            location: JSON.parse(ticket.location || '{}'),
            relatedTickets: JSON.parse(ticket.relatedTickets || '[]'),
            attachments: JSON.parse(ticket.attachments || '[]'),
            isDuplicate: Boolean(ticket.isDuplicate),
            isAnonymous: Boolean(ticket.isAnonymous)
        }));

        return NextResponse.json({ tickets: parsedTickets });

    } catch (error: any) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update ticket status
export async function PATCH(request: NextRequest) {
    try {
        const { ticketId, status, notes, adminId } = await request.json();

        // Get current ticket
        const ticket = db.prepare('SELECT * FROM tickets WHERE ticketId = ?').get(ticketId) as any;
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Update ticket
        const resolvedAt = status === 'resolved' ? new Date().toISOString() : null;
        db.prepare(`
      UPDATE tickets 
      SET status = ?, statusNotes = ?, updatedAt = CURRENT_TIMESTAMP, resolvedAt = COALESCE(?, resolvedAt)
      WHERE ticketId = ?
    `).run(status, notes, resolvedAt, ticketId);

        // Log status history
        db.prepare(`
      INSERT INTO status_history (ticketId, previousStatus, newStatus, changedBy, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(ticketId, ticket.status, status, adminId, notes || '');

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error updating ticket:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
