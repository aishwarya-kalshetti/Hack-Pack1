'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SLACountdownProps {
    deadline: string | Date;
    status: string;
    urgency?: string;
}

export default function SLACountdown({ deadline, status, urgency }: SLACountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isOverdue: boolean;
        totalSeconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: false, totalSeconds: 0 });

    useEffect(() => {
        if (status === 'resolved' || status === 'closed') return;

        const calculateTimeLeft = () => {
            const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
            const now = new Date();
            const diff = deadlineDate.getTime() - now.getTime();

            const isOverdue = diff < 0;
            const absDiff = Math.abs(diff);

            const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, isOverdue, totalSeconds: diff / 1000 });
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [deadline, status]);

    // Don't show for resolved tickets
    if (status === 'resolved' || status === 'closed') {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Resolved</span>
            </div>
        );
    }

    const isUrgent = timeLeft.totalSeconds < 3600 && !timeLeft.isOverdue; // Less than 1 hour
    const isCritical = urgency === 'critical' || urgency === 'high';

    return (
        <div className={`
      relative overflow-hidden rounded-xl p-3 transition-all
      ${timeLeft.isOverdue
                ? 'bg-red-50 border border-red-200'
                : isUrgent
                    ? 'bg-yellow-50 border border-yellow-200 animate-pulse'
                    : 'bg-gray-50 border border-gray-200'
            }
    `}>
            {/* Progress bar background */}
            {!timeLeft.isOverdue && (
                <div
                    className={`absolute bottom-0 left-0 h-1 transition-all ${isUrgent ? 'bg-yellow-400' : isCritical ? 'bg-red-400' : 'bg-indigo-400'
                        }`}
                    style={{
                        width: `${Math.max(0, Math.min(100, (timeLeft.totalSeconds / (86400)) * 100))}%`
                    }}
                />
            )}

            <div className="relative flex items-center gap-3">
                <div className={`p-2 rounded-lg ${timeLeft.isOverdue
                        ? 'bg-red-100 text-red-600'
                        : isUrgent
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                    {timeLeft.isOverdue ? (
                        <AlertTriangle className="w-5 h-5" />
                    ) : (
                        <Clock className="w-5 h-5" />
                    )}
                </div>

                <div>
                    <p className={`text-xs ${timeLeft.isOverdue ? 'text-red-600' : 'text-gray-500'
                        }`}>
                        {timeLeft.isOverdue ? 'OVERDUE BY' : 'Time to resolve'}
                    </p>
                    <div className="flex items-baseline gap-1">
                        {timeLeft.days > 0 && (
                            <span className="font-bold text-lg">{timeLeft.days}d</span>
                        )}
                        <span className={`font-bold text-lg ${timeLeft.isOverdue
                                ? 'text-red-700'
                                : isUrgent
                                    ? 'text-yellow-700'
                                    : 'text-gray-900'
                            }`}>
                            {String(timeLeft.hours).padStart(2, '0')}:
                            {String(timeLeft.minutes).padStart(2, '0')}:
                            <span className="text-base">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
