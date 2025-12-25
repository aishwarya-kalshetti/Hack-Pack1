// User types
export interface User {
    userId: string;
    email: string;
    displayName: string;
    role: 'student' | 'admin' | 'super_admin';
    department?: string;
    studentId?: string;
    hostelBlock?: string;
    roomNumber?: string;
    phoneNumber?: string;
    createdAt: Date;
    lastLoginAt: Date;
    isActive: boolean;
    permissions?: string[];
    preferences?: {
        emailNotifications: boolean;
        smsNotifications: boolean;
    };
}

// AI Analysis types
export interface AIAnalysis {
    category: string;
    subCategory: string;
    department: string;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    urgencyScore: number;
    summary: string;
    suggestedAction: string;
    keywords: string[];
    sentiment: string;
    confidence: number;
    requiresImmediate?: boolean;
}

// Location types
export interface GrievanceLocation {
    type: string;
    block?: string;
    floor?: string;
    room?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

// Grievance Ticket types
export interface GrievanceTicket {
    ticketId: string;
    studentId: string;
    studentEmail: string;
    studentName: string;
    originalText: string;
    aiAnalysis: AIAnalysis;
    location?: GrievanceLocation;
    status: TicketStatus;
    assignedTo?: string;
    assignedDepartment: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    expectedResolutionDate?: string;
    isDuplicate: boolean;
    duplicateOf?: string;
    relatedTickets: string[];
    attachments: string[];
    isAnonymous: boolean;
    priority: number;
    statusNotes?: string;
}

export type TicketStatus =
    | 'open'
    | 'assigned'
    | 'in_progress'
    | 'pending_info'
    | 'escalated'
    | 'resolved'
    | 'closed'
    | 'reopened';

// Department types
export interface Department {
    departmentId: string;
    name: string;
    description: string;
    categories: string[];
    adminIds: string[];
    headId: string;
    email: string;
    slaHours: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    isActive: boolean;
    keywords: string[];
    icon?: string;
}

// Status History types
export interface StatusHistory {
    historyId: string;
    ticketId: string;
    previousStatus: TicketStatus;
    newStatus: TicketStatus;
    changedBy: string;
    changedByName?: string;
    changedAt: Date;
    notes?: string;
    isAutomatic: boolean;
    aiGeneratedResponse?: string;
}

// Resolution Metrics types
export interface ResolutionMetrics {
    metricId: string;
    period: 'daily' | 'weekly' | 'monthly';
    year: number;
    month: number;
    department: string;
    totalTickets: number;
    resolvedTickets: number;
    pendingTickets: number;
    avgResolutionHours: number;
    slaCompliance: number;
    byCategory: Record<string, number>;
    byUrgency: Record<string, number>;
    satisfactionScore?: number;
    duplicateRate?: number;
    reopenRate?: number;
    calculatedAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
    totalTickets: number;
    resolvedTickets: number;
    pendingTickets: number;
    avgResolutionTime: number;
    slaCompliance: number;
    ticketsByCategory: Record<string, number>;
    ticketsByUrgency: Record<string, number>;
    ticketsByStatus: Record<string, number>;
    recentTickets: GrievanceTicket[];
}

// Form Data
export interface GrievanceFormData {
    grievanceText: string;
    location?: string;
    block?: string;
    isAnonymous: boolean;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface SubmitGrievanceResponse {
    ticketId: string;
    message: string;
    estimatedResolution: string;
    aiAnalysis: AIAnalysis;
}
