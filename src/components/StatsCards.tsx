'use client';

import React from 'react';
import { DashboardStats } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Zap
} from 'lucide-react';

interface StatsCardsProps {
    stats: DashboardStats;
}

interface AnimatedCounterProps {
    value: number;
    suffix?: string;
}

function AnimatedCounter({ value, suffix = '' }: AnimatedCounterProps) {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        const duration = 1500;
        const steps = 40;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{count}{suffix}</span>;
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const { t } = useLanguage();
    const resolutionRate = stats.totalTickets > 0
        ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100)
        : 0;

    const cards = [
        {
            title: t('stats.total'),
            value: stats.totalTickets,
            icon: FileText,
            gradient: 'from-blue-500 to-indigo-600',
            bgGradient: 'from-blue-50 to-indigo-50',
            textColor: 'text-indigo-600'
        },
        {
            title: t('stats.resolved'),
            value: stats.resolvedTickets,
            icon: CheckCircle,
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-50',
            textColor: 'text-green-600',
            extra: `${resolutionRate}% rate`
        },
        {
            title: t('stats.pending'),
            value: stats.pendingTickets,
            icon: Clock,
            gradient: 'from-yellow-500 to-orange-500',
            bgGradient: 'from-yellow-50 to-orange-50',
            textColor: 'text-orange-600'
        },
        {
            title: t('stats.avgTime'),
            value: stats.avgResolutionTime,
            suffix: 'h',
            icon: Zap,
            gradient: 'from-purple-500 to-pink-600',
            bgGradient: 'from-purple-50 to-pink-50',
            textColor: 'text-purple-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;

                return (
                    <div
                        key={index}
                        className={`
              relative overflow-hidden bg-gradient-to-br ${card.bgGradient} 
              rounded-2xl p-5 border border-gray-100
              hover:shadow-xl transition-all duration-300 hover:-translate-y-1
              group
            `}
                    >
                        {/* Background decoration */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${card.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`} />

                        <div className="relative">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                {card.extra && (
                                    <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full">
                                        {card.extra}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className={`text-3xl font-bold ${card.textColor}`}>
                                    <AnimatedCounter value={card.value} suffix={card.suffix} />
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{card.title}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
