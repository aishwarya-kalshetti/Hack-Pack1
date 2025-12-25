'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar, TicketCard } from '@/components';
import { getAllTickets } from '@/lib/firestore';
import { GrievanceTicket } from '@/types';
import { appConfig } from '@/lib/config';
import {
    Loader2,
    Search,
    FileText,
    Download
} from 'lucide-react';
import toast from 'react-hot-toast';

function AdminTicketsContent() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<GrievanceTicket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<GrievanceTicket[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
        if (!authLoading && !isAdmin) {
            router.push('/student');
        }
    }, [user, authLoading, isAdmin, router]);

    useEffect(() => {
        async function fetchTickets() {
            try {
                const data = await getAllTickets();
                setTickets(data);
                setFilteredTickets(data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                setLoading(false);
            }
        }

        if (user && isAdmin) {
            fetchTickets();
        }
    }, [user, isAdmin]);

    useEffect(() => {
        let result = tickets;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.ticketId.toLowerCase().includes(query) ||
                t.originalText.toLowerCase().includes(query) ||
                t.studentName.toLowerCase().includes(query) ||
                t.aiAnalysis?.summary?.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(t => t.status === statusFilter);
        }

        // Apply department filter
        if (departmentFilter !== 'all') {
            result = result.filter(t => t.assignedDepartment === departmentFilter);
        }

        // Apply urgency filter
        if (urgencyFilter !== 'all') {
            result = result.filter(t => t.aiAnalysis?.urgency === urgencyFilter);
        }

        setFilteredTickets(result);
    }, [tickets, searchQuery, statusFilter, departmentFilter, urgencyFilter]);

    const exportToCSV = () => {
        const headers = ['Ticket ID', 'Student', 'Category', 'Department', 'Urgency', 'Status', 'Created At', 'Summary'];
        const rows = filteredTickets.map(t => [
            t.ticketId,
            t.isAnonymous ? 'Anonymous' : t.studentName,
            t.aiAnalysis?.category || '',
            t.assignedDepartment,
            t.aiAnalysis?.urgency || '',
            t.status,
            new Date(t.createdAt).toLocaleDateString(),
            t.aiAnalysis?.summary || t.originalText.substring(0, 100)
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grievances_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Report exported successfully!');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!user || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Tickets</h1>
                        <p className="text-gray-600 mt-1">
                            {filteredTickets.length} of {tickets.length} tickets
                        </p>
                    </div>

                    <button
                        onClick={exportToCSV}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <Download className="w-5 h-5" />
                        Export CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        {appConfig.statusOptions.map(status => (
                            <option key={status.id} value={status.id}>{status.label}</option>
                        ))}
                    </select>

                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    >
                        <option value="all">All Departments</option>
                        {appConfig.departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>

                    <select
                        value={urgencyFilter}
                        onChange={(e) => setUrgencyFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    >
                        <option value="all">All Urgency</option>
                        {appConfig.urgencyLevels.map(level => (
                            <option key={level.id} value={level.id}>{level.label}</option>
                        ))}
                    </select>
                </div>

                {/* Tickets List */}
                {filteredTickets.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredTickets.map((ticket) => (
                            <TicketCard
                                key={ticket.ticketId}
                                ticket={ticket}
                                onClick={() => router.push(`/admin/tickets/${ticket.ticketId}`)}
                                showActions
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No matching tickets</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function AdminTicketsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        }>
            <AdminTicketsContent />
        </Suspense>
    );
}
