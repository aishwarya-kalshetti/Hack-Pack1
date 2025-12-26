'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { Navbar, StatsCards, TicketCard } from '@/components';
import { getDashboardStats, getUserTickets } from '@/lib/firestore';
import { DashboardStats, GrievanceTicket } from '@/types';
import { Loader2, Plus, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentTickets, setRecentTickets] = useState<GrievanceTicket[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
        if (!authLoading && isAdmin) {
            router.push('/admin');
        }
    }, [user, authLoading, isAdmin, router]);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            try {
                const tickets = await getUserTickets(user.userId);
                setRecentTickets(tickets.slice(0, 5));

                // Calculate personal stats
                const personalStats: DashboardStats = {
                    totalTickets: tickets.length,
                    resolvedTickets: tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
                    pendingTickets: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
                    avgResolutionTime: 0,
                    slaCompliance: 0,
                    ticketsByCategory: {},
                    ticketsByUrgency: {},
                    ticketsByStatus: {},
                    recentTickets: tickets.slice(0, 5)
                };

                tickets.forEach(t => {
                    const category = t.aiAnalysis?.category || 'other';
                    personalStats.ticketsByCategory[category] = (personalStats.ticketsByCategory[category] || 0) + 1;
                });

                setStats(personalStats);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchData();
        }
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t('dashboard.welcome')}, {user.displayName}! 👋
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {t('dashboard.overview')}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <Link
                        href="/student/new"
                        className="flex items-center gap-4 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white hover:shadow-lg transition-all group"
                    >
                        <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{t('dashboard.newGrievance')}</h3>
                            <p className="text-white/80 text-sm">{t('dashboard.submitComplaint')}</p>
                        </div>
                    </Link>

                    <Link
                        href="/student/tickets"
                        className="flex items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all group"
                    >
                        <div className="p-3 bg-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.myTickets')}</h3>
                            <p className="text-gray-600 text-sm">{t('dashboard.viewSubmissions')}</p>
                        </div>
                    </Link>
                </div>

                {/* Stats */}
                {stats && <StatsCards stats={stats} />}

                {/* Recent Tickets */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.recentTickets')}</h2>
                        <Link href="/student/tickets" className="text-sm text-indigo-600 hover:text-indigo-700">
                            {t('dashboard.viewAll')} →
                        </Link>
                    </div>

                    {recentTickets.length > 0 ? (
                        <div className="grid gap-4">
                            {recentTickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.ticketId}
                                    ticket={ticket}
                                    onClick={() => router.push(`/student/tickets/${ticket.ticketId}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.noTickets')}</h3>
                            <p className="text-gray-600 mb-4">{t('dashboard.submitFirst')}</p>
                            <Link
                                href="/student/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                {t('dashboard.newGrievance')}
                            </Link>
                        </div>
                    )}
                </div>

                {/* AI Feature Highlight */}
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{t('dashboard.aiPowered')}</h3>
                            <p className="text-gray-600 text-sm">
                                {t('dashboard.aiDescription')}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
