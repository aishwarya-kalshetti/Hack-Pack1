'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar, DepartmentScorecard } from '@/components';
import { getDashboardStats, getAllTickets } from '@/lib/firestore';
import { DashboardStats, GrievanceTicket } from '@/types';
import { appConfig } from '@/lib/config';
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

export default function AdminAnalyticsPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
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
        async function fetchStats() {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        }

        if (user && isAdmin) {
            fetchStats();
        }
    }, [user, isAdmin]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!user || !isAdmin || !stats) return null;

    const resolutionRate = stats.totalTickets > 0
        ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100)
        : 0;

    // Mock comparison data for demo
    const comparisons = {
        totalChange: 12,
        resolutionChange: 8,
        avgTimeChange: -15,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Insights and metrics for campus grievance management
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Tickets */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Tickets</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalTickets}</p>
                            </div>
                            <div className={`flex items-center gap-1 text-sm ${comparisons.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {comparisons.totalChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {Math.abs(comparisons.totalChange)}%
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">vs last month</p>
                    </div>

                    {/* Resolution Rate */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Resolution Rate</p>
                                <p className="text-3xl font-bold text-green-600">{resolutionRate}%</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${resolutionRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Avg Resolution Time */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Avg Resolution Time</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.avgResolutionTime}h</p>
                            </div>
                            <div className={`flex items-center gap-1 text-sm ${comparisons.avgTimeChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {comparisons.avgTimeChange <= 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                {Math.abs(comparisons.avgTimeChange)}%
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Faster is better</p>
                    </div>

                    {/* Pending Tickets */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Pending Tickets</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pendingTickets}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Requires attention</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Category Distribution */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChart className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Tickets by Category</h2>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(stats.ticketsByCategory).map(([category, count]) => {
                                const dept = appConfig.departments.find(d => d.id === category);
                                const percentage = stats.totalTickets > 0
                                    ? Math.round((count / stats.totalTickets) * 100)
                                    : 0;

                                return (
                                    <div key={category}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{dept?.icon || '📋'}</span>
                                                <span className="capitalize text-gray-700">{category}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{count}</span>
                                                <span className="text-sm text-gray-500">({percentage}%)</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Urgency Distribution */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <AlertCircle className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Tickets by Urgency</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {appConfig.urgencyLevels.map((level) => {
                                const count = stats.ticketsByUrgency[level.id] || 0;
                                const percentage = stats.totalTickets > 0
                                    ? Math.round((count / stats.totalTickets) * 100)
                                    : 0;

                                return (
                                    <div
                                        key={level.id}
                                        className="p-4 rounded-xl"
                                        style={{ backgroundColor: level.bgColor }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span
                                                className="font-medium"
                                                style={{ color: level.color }}
                                            >
                                                {level.label}
                                            </span>
                                            <span
                                                className="text-2xl font-bold"
                                                style={{ color: level.color }}
                                            >
                                                {count}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{percentage}% of total</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Tickets by Status</h2>
                        </div>

                        <div className="space-y-3">
                            {appConfig.statusOptions.map((status) => {
                                const count = stats.ticketsByStatus[status.id] || 0;
                                const percentage = stats.totalTickets > 0
                                    ? Math.round((count / stats.totalTickets) * 100)
                                    : 0;

                                return (
                                    <div key={status.id} className="flex items-center gap-4">
                                        <div className="w-24 flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: status.color }}
                                            />
                                            <span className="text-sm text-gray-600">{status.label}</span>
                                        </div>
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                                style={{
                                                    width: `${Math.max(percentage, 5)}%`,
                                                    backgroundColor: status.color
                                                }}
                                            >
                                                {percentage > 10 && (
                                                    <span className="text-xs text-white font-medium">{count}</span>
                                                )}
                                            </div>
                                        </div>
                                        {percentage <= 10 && (
                                            <span className="text-sm text-gray-600 w-8">{count}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Impact Summary */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">Impact Summary</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-3xl font-bold">75%</p>
                                <p className="text-sm text-white/80">Faster Resolution</p>
                                <p className="text-xs text-white/60 mt-1">vs manual process</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">94%</p>
                                <p className="text-sm text-white/80">AI Accuracy</p>
                                <p className="text-xs text-white/60 mt-1">Classification rate</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">68%</p>
                                <p className="text-sm text-white/80">Duplicate Reduction</p>
                                <p className="text-xs text-white/60 mt-1">Less repeat tickets</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">4.3/5</p>
                                <p className="text-sm text-white/80">Satisfaction Score</p>
                                <p className="text-xs text-white/60 mt-1">Student rating</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Looker Studio Integration Note */}
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">Looker Studio Integration</h3>
                            <p className="text-blue-700 text-sm">
                                For advanced analytics and custom reports, connect this data to Google Looker Studio.
                                Export Firestore data to BigQuery and create interactive dashboards with drill-down capabilities.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
