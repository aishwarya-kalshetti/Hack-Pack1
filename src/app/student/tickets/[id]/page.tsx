'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components';
import { getTicketById } from '@/lib/firestore';
import { GrievanceTicket } from '@/types';
import { appConfig } from '@/lib/config';
import {
    Loader2,
    ArrowLeft,
    Clock,
    MapPin,
    Tag,
    Calendar,
    CheckCircle,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function StudentTicketDetailPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const ticketId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [ticket, setTicket] = useState<GrievanceTicket | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        async function fetchTicket() {
            try {
                const data = await getTicketById(ticketId);
                setTicket(data);
            } catch (error) {
                console.error('Error fetching ticket:', error);
            } finally {
                setLoading(false);
            }
        }

        if (user && ticketId) {
            fetchTicket();
        }
    }, [user, ticketId]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />
                <main className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h1>
                    <button onClick={() => router.back()} className="text-indigo-600 hover:text-indigo-700">
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
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to My Tickets
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                            <span className="text-sm font-mono text-gray-500">{ticket.ticketId}</span>
                            <h1 className="text-xl font-bold text-gray-900 mt-1">
                                {ticket.aiAnalysis?.summary || 'Grievance Details'}
                            </h1>
                        </div>
                        <div className="flex gap-2">
                            <span
                                className="px-3 py-1 text-xs font-medium rounded-full"
                                style={{ backgroundColor: urgencyConfig?.bgColor, color: urgencyConfig?.color }}
                            >
                                {urgencyConfig?.label}
                            </span>
                            <span
                                className="px-3 py-1 text-xs font-medium rounded-full"
                                style={{ backgroundColor: `${statusConfig?.color}20`, color: statusConfig?.color }}
                            >
                                {statusConfig?.label}
                            </span>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            <span className="capitalize">{ticket.aiAnalysis?.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>{departmentConfig?.icon}</span>
                            <span>{departmentConfig?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(createdAt, 'PPp')}</span>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Grievance</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{ticket.originalText}</p>
                            {ticket.location?.block && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4" />
                                    <span>Location: {ticket.location.block}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Category</p>
                                    <p className="font-medium capitalize">{ticket.aiAnalysis?.category}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Sentiment</p>
                                    <p className="font-medium capitalize">{ticket.aiAnalysis?.sentiment}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Confidence</p>
                                    <p className="font-medium">{Math.round((ticket.aiAnalysis?.confidence || 0) * 100)}%</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Urgency Score</p>
                                    <p className="font-medium">{Math.round((ticket.aiAnalysis?.urgencyScore || 0) * 100)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Created</p>
                                    <p className="text-sm text-gray-500">{formatDistanceToNow(createdAt, { addSuffix: true })}</p>
                                </div>
                            </div>
                            {ticket.resolvedAt && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Resolved</p>
                                        <p className="text-sm text-gray-500">
                                            {formatDistanceToNow(new Date(ticket.resolvedAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
