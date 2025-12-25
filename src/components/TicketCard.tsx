'use client';

import React from 'react';
import { GrievanceTicket } from '@/types';
import { appConfig } from '@/lib/config';
import SLACountdown from './SLACountdown';
import {
    Clock,
    MapPin,
    Tag,
    AlertCircle,
    CheckCircle,
    Loader2,
    ArrowRight,
    Sparkles,
    EyeOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TicketCardProps {
    ticket: GrievanceTicket;
    onClick?: () => void;
    showActions?: boolean;
}

export default function TicketCard({ ticket, onClick, showActions = false }: TicketCardProps) {
    const urgencyConfig = appConfig.urgencyLevels.find(u => u.id === ticket.aiAnalysis?.urgency);
    const statusConfig = appConfig.statusOptions.find(s => s.id === ticket.status);
    const departmentConfig = appConfig.departments.find(d => d.id === ticket.assignedDepartment);

    const createdAt = ticket.createdAt instanceof Date
        ? ticket.createdAt
        : new Date(ticket.createdAt);

    const StatusIcon = ticket.status === 'resolved' || ticket.status === 'closed'
        ? CheckCircle
        : ticket.status === 'in_progress'
            ? Loader2
            : AlertCircle;

    return (
        <div
            onClick={onClick}
            className={`
        group relative bg-white rounded-2xl border border-gray-100 overflow-hidden
        transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1
        ${onClick ? 'cursor-pointer' : ''}
      `}
        >
            {/* Urgency indicator bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: urgencyConfig?.color || '#6B7280' }}
            />

            {/* Glow effect on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `linear-gradient(135deg, ${urgencyConfig?.bgColor || '#F3F4F6'}40 0%, transparent 50%)`
                }}
            />

            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                {ticket.ticketId}
                            </span>
                            {ticket.isAnonymous && (
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <EyeOff className="w-3 h-3" />
                                    Anonymous
                                </span>
                            )}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {ticket.aiAnalysis?.summary || ticket.originalText.substring(0, 100)}
                        </h3>
                    </div>

                    {/* Urgency Badge */}
                    <div
                        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse-slow"
                        style={{
                            backgroundColor: urgencyConfig?.bgColor || '#F3F4F6',
                            color: urgencyConfig?.color || '#6B7280'
                        }}
                    >
                        {urgencyConfig?.label || 'Medium'}
                    </div>
                </div>

                {/* AI Analysis Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs">
                        <Sparkles className="w-3 h-3" />
                        AI Classified
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        <Tag className="w-3 h-3" />
                        <span className="capitalize">{ticket.aiAnalysis?.category}</span>
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {departmentConfig?.icon || '📋'}
                        <span>{departmentConfig?.name || ticket.assignedDepartment}</span>
                    </span>
                </div>

                {/* Location if available */}
                {ticket.location?.block && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{ticket.location.block}</span>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    {/* Status */}
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{
                            backgroundColor: `${statusConfig?.color}15`,
                            color: statusConfig?.color
                        }}
                    >
                        <StatusIcon className={`w-4 h-4 ${ticket.status === 'in_progress' ? 'animate-spin' : ''}`} />
                        <span>{statusConfig?.label || ticket.status}</span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                    </div>
                </div>

                {/* Hover Action Hint */}
                {onClick && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 text-indigo-600 text-sm font-medium">
                            View Details
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
        </div>
    );
}
