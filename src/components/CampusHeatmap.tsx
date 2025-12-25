'use client';

import React, { useState, useEffect } from 'react';
import { GrievanceTicket } from '@/types';
import { appConfig } from '@/lib/config';
import { MapPin, AlertCircle, Flame, TrendingUp } from 'lucide-react';

interface CampusHeatmapProps {
    tickets: GrievanceTicket[];
}

// Campus zones with their coordinates on the map
const campusZones = [
    { id: 'library', name: 'Central Library', x: 45, y: 20, icon: '📚' },
    { id: 'hostel-a', name: 'Hostel Block A', x: 15, y: 35, icon: '🏠' },
    { id: 'hostel-b', name: 'Hostel Block B', x: 15, y: 55, icon: '🏠' },
    { id: 'hostel-c', name: 'Hostel Block C', x: 15, y: 75, icon: '🏠' },
    { id: 'cs-building', name: 'CS Building', x: 70, y: 30, icon: '💻' },
    { id: 'main-building', name: 'Main Building', x: 50, y: 50, icon: '🏛️' },
    { id: 'canteen', name: 'Main Canteen', x: 75, y: 55, icon: '🍽️' },
    { id: 'sports', name: 'Sports Complex', x: 35, y: 80, icon: '⚽' },
    { id: 'admin', name: 'Admin Block', x: 60, y: 75, icon: '🏢' },
    { id: 'parking', name: 'Parking Area', x: 85, y: 20, icon: '🅿️' },
];

export default function CampusHeatmap({ tickets }: CampusHeatmapProps) {
    const [selectedZone, setSelectedZone] = useState<string | null>(null);
    const [zoneStats, setZoneStats] = useState<Record<string, { count: number; critical: number }>>({});

    useEffect(() => {
        // Calculate stats for each zone
        const stats: Record<string, { count: number; critical: number }> = {};

        campusZones.forEach(zone => {
            const zoneTickets = tickets.filter(t => {
                const location = (t.location?.block || t.originalText || '').toLowerCase();
                return location.includes(zone.name.toLowerCase().split(' ')[0]) ||
                    location.includes(zone.id.replace('-', ' '));
            });

            stats[zone.id] = {
                count: zoneTickets.length,
                critical: zoneTickets.filter(t =>
                    t.aiAnalysis?.urgency === 'critical' || t.aiAnalysis?.urgency === 'high'
                ).length
            };
        });

        setZoneStats(stats);
    }, [tickets]);

    const getHeatColor = (count: number, hasCritical: boolean) => {
        if (hasCritical) return 'from-red-500 to-orange-500';
        if (count > 3) return 'from-orange-500 to-yellow-500';
        if (count > 1) return 'from-yellow-500 to-green-400';
        if (count > 0) return 'from-green-400 to-green-500';
        return 'from-gray-300 to-gray-400';
    };

    const getHeatSize = (count: number) => {
        if (count > 5) return 'w-16 h-16';
        if (count > 3) return 'w-14 h-14';
        if (count > 1) return 'w-12 h-12';
        return 'w-10 h-10';
    };

    const selectedZoneData = selectedZone
        ? campusZones.find(z => z.id === selectedZone)
        : null;

    const selectedZoneTickets = selectedZone
        ? tickets.filter(t => {
            const location = (t.location?.block || t.originalText || '').toLowerCase();
            const zone = campusZones.find(z => z.id === selectedZone);
            return zone && (
                location.includes(zone.name.toLowerCase().split(' ')[0]) ||
                location.includes(zone.id.replace('-', ' '))
            );
        })
        : [];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Campus Issue Heatmap</h3>
                        <p className="text-white/70 text-sm">Click on zones to see details</p>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative h-[400px] bg-gradient-to-br from-green-50 to-blue-50 p-4">
                {/* Grid lines for visual effect */}
                <div className="absolute inset-4 border-2 border-dashed border-gray-200 rounded-xl opacity-50" />

                {/* Campus boundary */}
                <div className="absolute inset-8 border-4 border-green-300 rounded-3xl bg-green-100/30" />

                {/* Zone markers */}
                {campusZones.map(zone => {
                    const stats = zoneStats[zone.id] || { count: 0, critical: 0 };
                    const isSelected = selectedZone === zone.id;

                    return (
                        <button
                            key={zone.id}
                            onClick={() => setSelectedZone(isSelected ? null : zone.id)}
                            className={`
                absolute transform -translate-x-1/2 -translate-y-1/2
                ${getHeatSize(stats.count)}
                bg-gradient-to-br ${getHeatColor(stats.count, stats.critical > 0)}
                rounded-full flex items-center justify-center
                shadow-lg transition-all duration-300 hover:scale-110
                ${isSelected ? 'ring-4 ring-indigo-500 scale-110' : ''}
                ${stats.critical > 0 ? 'animate-pulse' : ''}
              `}
                            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                            title={`${zone.name}: ${stats.count} issues`}
                        >
                            <span className="text-xl">{zone.icon}</span>
                            {stats.count > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-xs font-bold rounded-full flex items-center justify-center text-gray-800 border border-gray-200">
                                    {stats.count}
                                </span>
                            )}
                        </button>
                    );
                })}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-xl p-3 shadow-lg text-xs space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-orange-500" />
                        <span>Critical Issues</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-500 to-green-400" />
                        <span>Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-400" />
                        <span>No Issues</span>
                    </div>
                </div>
            </div>

            {/* Selected Zone Details */}
            {selectedZoneData && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{selectedZoneData.icon}</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">{selectedZoneData.name}</h4>
                            <p className="text-sm text-gray-500">
                                {selectedZone ? (zoneStats[selectedZone]?.count || 0) : 0} active issues
                            </p>
                        </div>
                    </div>

                    {selectedZoneTickets.length > 0 ? (
                        <div className="space-y-2">
                            {selectedZoneTickets.slice(0, 3).map(ticket => {
                                const urgencyConfig = appConfig.urgencyLevels.find(u => u.id === ticket.aiAnalysis?.urgency);
                                return (
                                    <div
                                        key={ticket.ticketId}
                                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100"
                                    >
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                                {ticket.aiAnalysis?.summary || ticket.originalText.substring(0, 40)}
                                            </span>
                                        </div>
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ backgroundColor: urgencyConfig?.bgColor, color: urgencyConfig?.color }}
                                        >
                                            {urgencyConfig?.label}
                                        </span>
                                    </div>
                                );
                            })}
                            {selectedZoneTickets.length > 3 && (
                                <p className="text-xs text-center text-gray-400">
                                    +{selectedZoneTickets.length - 3} more issues
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-2">No issues in this zone 🎉</p>
                    )}
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
        </div>
    );
}
