'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar, StatsCards, TicketCard, CampusHeatmap, TrendPrediction } from '@/components';
import { getDashboardStats, getAllTickets } from '@/lib/firestore';
import { DashboardStats, GrievanceTicket } from '@/types';
import { appConfig } from '@/lib/config';
import {
    Loader2,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentTickets, setRecentTickets] = useState<GrievanceTicket[]>([]);
    const [allTickets, setAllTickets] = useState<GrievanceTicket[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
        if (!authLoading && !isAdmin) {
            router.push('/student');
        }
    }, [user, authLoading, isAdmin, router]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [dashStats, tickets] = await Promise.all([
                    getDashboardStats(),
                    getAllTickets()
                ]);
                setStats(dashStats);
                setAllTickets(tickets);
                setRecentTickets(tickets.slice(0, 5));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        if (user && isAdmin) {
            fetchData();
        }
    }, [user, isAdmin]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!user || !isAdmin) return null;

    // Count urgent tickets
    const urgentCount = recentTickets.filter(
        t => t.aiAnalysis?.urgency === 'critical' || t.aiAnalysis?.urgency === 'high'
    ).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Overview of all campus grievances
                        </p>
                    </div>

                    {urgentCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-700 font-medium">
                                {urgentCount} urgent ticket{urgentCount > 1 ? 's' : ''} need attention
                            </span>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                {stats && <StatsCards stats={stats} />}

                {/* Campus Heatmap & Trend Prediction */}
                <div className="grid lg:grid-cols-2 gap-6 mt-8">
                    <CampusHeatmap tickets={allTickets} />
                    <TrendPrediction tickets={allTickets} />
                </div>

                {/* Quick Links */}
                <div className="grid sm:grid-cols-3 gap-4 mt-8">
                    <Link
                        href="/admin/tickets?status=open"
                        className="p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.ticketsByStatus?.open || 0}</p>
                                <p className="text-sm text-gray-500">Open Tickets</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/tickets?status=in_progress"
                        className="p-5 bg-white rounded-xl border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg group-hover:scale-110 transition-transform">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.ticketsByStatus?.in_progress || 0}</p>
                                <p className="text-sm text-gray-500">In Progress</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/tickets?status=resolved"
                        className="p-5 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.ticketsByStatus?.resolved || 0}</p>
                                <p className="text-sm text-gray-500">Resolved</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Category Distribution */}
                {stats && Object.keys(stats.ticketsByCategory).length > 0 && (
                    <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Category</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(stats.ticketsByCategory).map(([category, count]) => {
                                const dept = appConfig.departments.find(d => d.id === category);
                                return (
                                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{dept?.icon || '📋'}</span>
                                            <span className="capitalize text-gray-700">{category}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Tickets */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
                        <Link href="/admin/tickets" className="text-sm text-indigo-600 hover:text-indigo-700">
                            View all →
                        </Link>
                    </div>

                    {recentTickets.length > 0 ? (
                        <div className="grid gap-4">
                            {recentTickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.ticketId}
                                    ticket={ticket}
                                    onClick={() => router.push(`/admin/tickets/${ticket.ticketId}`)}
                                    showActions
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                            <p className="text-gray-600">New grievances will appear here</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
