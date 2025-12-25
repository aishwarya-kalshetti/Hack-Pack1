'use client';

import React, { useEffect, useState } from 'react';
import { GrievanceTicket } from '@/types';
import {
    AlertTriangle,
    ArrowUp,
    Clock,
    Zap,
    Bell,
    Shield,
    ChevronRight
} from 'lucide-react';
import { formatDistanceToNow, differenceInHours, isPast } from 'date-fns';

interface EscalationBadgeProps {
    ticket: GrievanceTicket;
    onEscalate?: (ticketId: string) => void;
}

type EscalationLevel = 'none' | 'warning' | 'critical' | 'escalated';

export default function EscalationBadge({ ticket, onEscalate }: EscalationBadgeProps) {
    const [escalationLevel, setEscalationLevel] = useState<EscalationLevel>('none');
    const [timeInfo, setTimeInfo] = useState({ hoursLeft: 0, isOverdue: false });

    useEffect(() => {
        if (!ticket.expectedResolutionDate || ticket.status === 'resolved' || ticket.status === 'closed') {
            setEscalationLevel('none');
            return;
        }

        const deadline = new Date(ticket.expectedResolutionDate);
        const now = new Date();
        const hoursLeft = differenceInHours(deadline, now);
        const isOverdue = isPast(deadline);

        setTimeInfo({ hoursLeft, isOverdue });

        // Determine escalation level
        if (isOverdue) {
            setEscalationLevel('escalated');
        } else if (hoursLeft <= 2) {
            setEscalationLevel('critical');
        } else if (hoursLeft <= 6) {
            setEscalationLevel('warning');
        } else {
            setEscalationLevel('none');
        }
    }, [ticket]);

    if (escalationLevel === 'none') return null;

    const configs = {
        warning: {
            bg: 'bg-yellow-50 border-yellow-200',
            text: 'text-yellow-800',
            icon: Clock,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            title: 'SLA Warning',
            message: `Only ${timeInfo.hoursLeft} hours left to resolve`
        },
        critical: {
            bg: 'bg-orange-50 border-orange-200',
            text: 'text-orange-800',
            icon: AlertTriangle,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            title: 'Critical - Escalation Soon',
            message: `Less than 2 hours remaining!`
        },
        escalated: {
            bg: 'bg-red-50 border-red-300',
            text: 'text-red-800',
            icon: ArrowUp,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            title: '🚨 ESCALATED',
            message: 'SLA breached - Elevated to senior authority'
        }
    };

    const config = configs[escalationLevel as keyof typeof configs];
    const Icon = config.icon;

    return (
        <div className={`rounded-xl border-2 ${config.bg} p-4 animate-pulse-slow`}>
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.iconBg}`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className={`font-bold ${config.text}`}>{config.title}</h4>
                        {escalationLevel === 'escalated' && (
                            <span className="flex items-center gap-1 text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                                <Bell className="w-3 h-3" />
                                High Priority
                            </span>
                        )}
                    </div>
                    <p className={`text-sm ${config.text} opacity-80`}>{config.message}</p>

                    {escalationLevel === 'escalated' && (
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                                <Shield className="w-3 h-3" />
                                Notified: Department Head
                            </div>
                            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                                <ArrowUp className="w-3 h-3" />
                                Priority: Maximum
                            </div>
                        </div>
                    )}

                    {escalationLevel !== 'escalated' && onEscalate && (
                        <button
                            onClick={() => onEscalate(ticket.ticketId)}
                            className="mt-2 flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800"
                        >
                            <Zap className="w-4 h-4" />
                            Escalate Now
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow { animation: pulse-slow 2s infinite; }
      `}</style>
        </div>
    );
}
