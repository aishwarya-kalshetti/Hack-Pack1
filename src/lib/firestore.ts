import { GrievanceTicket, GrievanceFormData, TicketStatus, DashboardStats } from '@/types';

// Submit a new grievance
export async function submitGrievance(
    formData: GrievanceFormData,
    user: { userId: string; email: string; displayName: string }
): Promise<{ ticketId: string; message: string; aiAnalysis: any }> {
    const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grievanceText: formData.grievanceText,
            location: formData.location,
            block: formData.block,
            isAnonymous: formData.isAnonymous,
            userId: user.userId,
            userEmail: user.email,
            userName: user.displayName
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to submit grievance');
    }

    return {
        ticketId: data.ticketId,
        message: data.message,
        aiAnalysis: data.aiAnalysis
    };
}

// Get user's tickets
export async function getUserTickets(userId: string): Promise<GrievanceTicket[]> {
    const response = await fetch(`/api/tickets?userId=${userId}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tickets');
    }

    return data.tickets.map((ticket: any) => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : undefined
    }));
}

// Get all tickets (for admin)
export async function getAllTickets(): Promise<GrievanceTicket[]> {
    const response = await fetch(`/api/tickets?isAdmin=true`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tickets');
    }

    return data.tickets.map((ticket: any) => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : undefined
    }));
}

// Get single ticket by ID
export async function getTicketById(ticketId: string): Promise<GrievanceTicket | null> {
    const response = await fetch(`/api/tickets?ticketId=${ticketId}`);
    const data = await response.json();

    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(data.error || 'Failed to fetch ticket');
    }

    const ticket = data.ticket;
    return {
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : undefined
    };
}

// Update ticket status (admin)
export async function updateTicketStatus(
    ticketId: string,
    newStatus: TicketStatus,
    adminId: string,
    notes?: string
): Promise<void> {
    const response = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status: newStatus, adminId, notes })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to update ticket');
    }
}

// Get dashboard stats
export async function getDashboardStats(): Promise<DashboardStats> {
    const tickets = await getAllTickets();

    const stats: DashboardStats = {
        totalTickets: tickets.length,
        resolvedTickets: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
        pendingTickets: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
        avgResolutionTime: 0,
        slaCompliance: 0,
        ticketsByCategory: {},
        ticketsByUrgency: {},
        ticketsByStatus: {},
        recentTickets: tickets.slice(0, 5)
    };

    // Calculate distributions
    tickets.forEach(t => {
        const category = t.aiAnalysis?.category || 'other';
        stats.ticketsByCategory[category] = (stats.ticketsByCategory[category] || 0) + 1;

        const urgency = t.aiAnalysis?.urgency || 'medium';
        stats.ticketsByUrgency[urgency] = (stats.ticketsByUrgency[urgency] || 0) + 1;

        stats.ticketsByStatus[t.status] = (stats.ticketsByStatus[t.status] || 0) + 1;
    });

    // Calculate avg resolution time
    const resolvedTickets = tickets.filter(t => t.resolvedAt && t.createdAt);
    if (resolvedTickets.length > 0) {
        const totalHours = resolvedTickets.reduce((sum, t) => {
            const created = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
            const resolved = t.resolvedAt instanceof Date ? t.resolvedAt : new Date(t.resolvedAt!);
            return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
        }, 0);
        stats.avgResolutionTime = Math.round(totalHours / resolvedTickets.length * 10) / 10;
    }

    return stats;
}
