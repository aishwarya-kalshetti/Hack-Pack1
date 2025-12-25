'use client';

import React from 'react';
import { GrievanceTicket } from '@/types';
import { appConfig } from '@/lib/config';
import {
    Award,
    Clock,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Target,
    Zap
} from 'lucide-react';

interface DepartmentScorecardProps {
    tickets: GrievanceTicket[];
}

interface DepartmentStats {
    id: string;
    name: string;
    icon: string;
    totalTickets: number;
    resolved: number;
    pending: number;
    avgResolutionHours: number;
    slaCompliance: number; // percentage
    trend: 'up' | 'down' | 'stable';
}

export default function DepartmentScorecard({ tickets }: DepartmentScorecardProps) {
    // Calculate stats per department
    const departmentStats: DepartmentStats[] = appConfig.departments.map(dept => {
        const deptTickets = tickets.filter(t =>
            t.assignedDepartment === dept.id || t.aiAnalysis?.department === dept.id
        );

        const resolved = deptTickets.filter(t =>
            t.status === 'resolved' || t.status === 'closed'
        );

        const pending = deptTickets.filter(t =>
            t.status === 'open' || t.status === 'in_progress'
        );

        // Calculate average resolution time
        const resolvedWithTime = resolved.filter(t => t.resolvedAt && t.createdAt);
        const totalHours = resolvedWithTime.reduce((acc, t) => {
            const created = new Date(t.createdAt).getTime();
            const resolvedAt = new Date(t.resolvedAt!).getTime();
            return acc + (resolvedAt - created) / (1000 * 60 * 60);
        }, 0);
        const avgHours = resolvedWithTime.length > 0
            ? totalHours / resolvedWithTime.length
            : 0;

        // Calculate SLA compliance
        const withSLA = deptTickets.filter(t => t.expectedResolutionDate);
        const metSLA = withSLA.filter(t => {
            if (t.status === 'resolved' && t.resolvedAt && t.expectedResolutionDate) {
                return new Date(t.resolvedAt) <= new Date(t.expectedResolutionDate);
            }
            if (t.status !== 'resolved' && t.expectedResolutionDate) {
                return new Date() <= new Date(t.expectedResolutionDate);
            }
            return true;
        });
        const slaCompliance = withSLA.length > 0
            ? (metSLA.length / withSLA.length) * 100
            : 100;

        // Determine trend (simplified)
        const trend: 'up' | 'down' | 'stable' =
            slaCompliance > 80 ? 'up' : slaCompliance > 50 ? 'stable' : 'down';

        return {
            id: dept.id,
            name: dept.name,
            icon: dept.icon,
            totalTickets: deptTickets.length,
            resolved: resolved.length,
            pending: pending.length,
            avgResolutionHours: Math.round(avgHours),
            slaCompliance: Math.round(slaCompliance),
            trend
        };
    }).filter(d => d.totalTickets > 0).sort((a, b) => b.slaCompliance - a.slaCompliance);

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-100';
        if (score >= 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getGrade = (score: number) => {
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Department Performance Scorecard</h3>
                        <p className="text-white/70 text-sm">SLA compliance & resolution metrics</p>
                    </div>
                </div>
            </div>

            {/* Stats Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">SLA %</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Resolved</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Pending</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Avg Time</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {departmentStats.map((dept, index) => (
                            <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{dept.icon}</span>
                                        <div>
                                            <p className="font-medium text-gray-800">{dept.name}</p>
                                            <p className="text-xs text-gray-400">{dept.totalTickets} total tickets</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${getScoreColor(dept.slaCompliance)}`}>
                                        {getGrade(dept.slaCompliance)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${dept.slaCompliance >= 80 ? 'bg-green-500' :
                                                    dept.slaCompliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${dept.slaCompliance}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{dept.slaCompliance}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="flex items-center justify-center gap-1 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        {dept.resolved}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`flex items-center justify-center gap-1 ${dept.pending > 0 ? 'text-amber-600' : 'text-gray-400'
                                        }`}>
                                        <Clock className="w-4 h-4" />
                                        {dept.pending}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="text-sm text-gray-600">
                                        {dept.avgResolutionHours > 0 ? `${dept.avgResolutionHours}h` : '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {dept.trend === 'up' ? (
                                        <TrendingUp className="w-5 h-5 text-green-500 mx-auto" />
                                    ) : dept.trend === 'down' ? (
                                        <TrendingDown className="w-5 h-5 text-red-500 mx-auto" />
                                    ) : (
                                        <div className="w-5 h-0.5 bg-gray-400 mx-auto" />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Legend */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Target className="w-3 h-3" /> SLA = Service Level Agreement</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Higher is better</span>
                    </div>
                    <span>Updated in real-time</span>
                </div>
            </div>
        </div>
    );
}
