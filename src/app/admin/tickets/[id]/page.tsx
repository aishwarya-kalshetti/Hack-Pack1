'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components';
import { getTicketById, updateTicketStatus } from '@/lib/firestore';
import { GrievanceTicket, TicketStatus } from '@/types';
import { appConfig } from '@/lib/config';
import {
    Loader2,
    ArrowLeft,
    Clock,
    MapPin,
    User,
    Tag,
    Calendar,
    CheckCircle,
    AlertCircle,
    Sparkles,
    MessageSquare
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminTicketDetailPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const router = useRouter();
    const params = useParams();
    const ticketId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [ticket, setTicket] = useState<GrievanceTicket | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [statusNote, setStatusNote] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
        if (!authLoading && !isAdmin) {
            router.push('/student');
        }
    }, [user, authLoading, isAdmin, router]);

    useEffect(() => {
        async function fetchTicket() {
            try {
                const data = await getTicketById(ticketId);
                setTicket(data);
            } catch (error) {
                console.error('Error fetching ticket:', error);
                toast.error('Ticket not found');
            } finally {
                setLoading(false);
            }
        }

        if (user && isAdmin && ticketId) {
            fetchTicket();
        }
    }, [user, isAdmin, ticketId]);

    const handleStatusUpdate = async (newStatus: TicketStatus) => {
        if (!ticket || !user) return;

        setUpdating(true);
        try {
            await updateTicketStatus(ticket.ticketId, newStatus, user.userId, statusNote);
            setTicket({ ...ticket, status: newStatus });
            setStatusNote('');
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!user || !isAdmin) return null;

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />
                <main className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h1>
                    <p className="text-gray-600 mb-4">The ticket you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.back()}
                        className="text-indigo-600 hover:text-indigo-700"
                    >
                        ← Go Back
                    </button>
                </main>
            </div>
        );
    }

    const urgencyConfig = appConfig.urgencyLevels.find(u => u.id === ticket.aiAnalysis?.urgency);
    const statusConfig = appConfig.statusOptions.find(s => s.id === ticket.status);
    const departmentConfig = appConfig.departments.find(d => d.id === ticket.assignedDepartment);

    const createdAt = ticket.createdAt instanceof Date ? ticket.createdAt : new Date(ticket.createdAt);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Tickets
                </button>

                {/* Header */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-mono text-gray-500">{ticket.ticketId}</span>
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={{
                                        backgroundColor: urgencyConfig?.bgColor || '#F3F4F6',
                                        color: urgencyConfig?.color || '#6B7280'
                                    }}
                                >
                                    {urgencyConfig?.label || 'Medium'}
                                </span>
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={{
                                        backgroundColor: `${statusConfig?.color}20`,
                                        color: statusConfig?.color
                                    }}
                                >
                                    {statusConfig?.label || ticket.status}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {ticket.aiAnalysis?.summary || 'Grievance Details'}
                            </h1>
                        </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{ticket.isAnonymous ? 'Anonymous' : ticket.studentName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Tag className="w-4 h-4" />
                            <span className="capitalize">{ticket.aiAnalysis?.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span>{departmentConfig?.icon || '📋'}</span>
                            <span>{departmentConfig?.name || ticket.assignedDepartment}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{format(createdAt, 'PPp')}</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Original Grievance */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Original Grievance</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{ticket.originalText}</p>

                            {ticket.location?.block && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4" />
                                    <span>Location: {ticket.location.block}</span>
                                </div>
                            )}
                        </div>

                        {/* AI Analysis */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Category</p>
                                    <p className="font-medium text-gray-900 capitalize">{ticket.aiAnalysis?.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Sentiment</p>
                                    <p className="font-medium text-gray-900 capitalize">{ticket.aiAnalysis?.sentiment}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Confidence</p>
                                    <p className="font-medium text-gray-900">{Math.round((ticket.aiAnalysis?.confidence || 0) * 100)}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Urgency Score</p>
                                    <p className="font-medium text-gray-900">{Math.round((ticket.aiAnalysis?.urgencyScore || 0) * 100)}%</p>
                                </div>
                            </div>

                            {ticket.aiAnalysis?.suggestedAction && (
                                <div className="mt-4 p-4 bg-white/50 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">Suggested Action</p>
                                    <p className="text-gray-900">{ticket.aiAnalysis.suggestedAction}</p>
                                </div>
                            )}

                            {ticket.aiAnalysis?.keywords && ticket.aiAnalysis.keywords.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 mb-2">Keywords</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ticket.aiAnalysis.keywords.map((keyword, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/70 rounded-full text-sm text-gray-700">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Actions */}
                    <div className="space-y-6">
                        {/* Update Status */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>

                            <div className="space-y-3 mb-4">
                                {appConfig.statusOptions.map((status) => (
                                    <button
                                        key={status.id}
                                        onClick={() => handleStatusUpdate(status.id as TicketStatus)}
                                        disabled={updating || ticket.status === status.id}
                                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${ticket.status === status.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            } disabled:opacity-50`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: status.color }}
                                            />
                                            <span className="font-medium">{status.label}</span>
                                        </div>
                                        {ticket.status === status.id && (
                                            <CheckCircle className="w-5 h-5 text-indigo-600" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Add a note (optional)..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
                            />
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Created</p>
                                        <p className="text-sm text-gray-500">
                                            {formatDistanceToNow(createdAt, { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>

                                {ticket.expectedResolutionDate && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Expected Resolution</p>
                                            <p className="text-sm text-gray-500">
                                                {format(new Date(ticket.expectedResolutionDate), 'PPp')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {ticket.resolvedAt && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Resolved</p>
                                            <p className="text-sm text-gray-500">
                                                {formatDistanceToNow(ticket.resolvedAt, { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
