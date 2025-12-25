'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar, TicketCard } from '@/components';
import { getUserTickets } from '@/lib/firestore';
import { GrievanceTicket, TicketStatus } from '@/types';
import { appConfig } from '@/lib/config';
import { Loader2, Search, Filter, FileText } from 'lucide-react';

export default function StudentTicketsPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<GrievanceTicket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<GrievanceTicket[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
        if (!authLoading && isAdmin) {
            router.push('/admin');
        }
    }, [user, authLoading, isAdmin, router]);

    useEffect(() => {
        async function fetchTickets() {
            if (!user) return;
            try {
                const data = await getUserTickets(user.userId);
                setTickets(data);
                setFilteredTickets(data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchTickets();
        }
    }, [user]);

    useEffect(() => {
        let result = tickets;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.ticketId.toLowerCase().includes(query) ||
                t.originalText.toLowerCase().includes(query) ||
                t.aiAnalysis?.summary?.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(t => t.status === statusFilter);
        }

        setFilteredTickets(result);
    }, [tickets, searchQuery, statusFilter]);

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
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
                    <p className="text-gray-600 mt-1">
                        Track the status of all your grievance submissions
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ticket ID or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-12 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            {appConfig.statusOptions.map(status => (
                                <option key={status.id} value={status.id}>{status.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tickets List */}
                {filteredTickets.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredTickets.map((ticket) => (
                            <TicketCard
                                key={ticket.ticketId}
                                ticket={ticket}
                                onClick={() => router.push(`/student/tickets/${ticket.ticketId}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery || statusFilter !== 'all' ? 'No matching tickets' : 'No tickets yet'}
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Submit a grievance to see it here'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
