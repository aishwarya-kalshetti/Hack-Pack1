'use client';

import React, { useState, useEffect } from 'react';
import { GrievanceTicket } from '@/types';
import { AlertTriangle, Link2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface DuplicateDetectorProps {
    currentText: string;
    existingTickets: GrievanceTicket[];
    onSimilarFound?: (tickets: GrievanceTicket[]) => void;
}

export default function DuplicateDetector({
    currentText,
    existingTickets,
    onSimilarFound
}: DuplicateDetectorProps) {
    const [similarTickets, setSimilarTickets] = useState<GrievanceTicket[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (currentText.length < 20) {
            setSimilarTickets([]);
            return;
        }

        const checkDuplicates = async () => {
            setIsChecking(true);

            // Simple keyword-based similarity for now
            const keywords = currentText.toLowerCase().split(' ').filter(w => w.length > 3);

            const matches = existingTickets.filter(ticket => {
                const ticketText = (ticket.originalText + ' ' + (ticket.aiAnalysis?.summary || '')).toLowerCase();
                const matchCount = keywords.filter(k => ticketText.includes(k)).length;
                return matchCount >= 3; // At least 3 matching keywords
            }).slice(0, 3);

            setSimilarTickets(matches);
            onSimilarFound?.(matches);
            setIsChecking(false);
        };

        const debounce = setTimeout(checkDuplicates, 500);
        return () => clearTimeout(debounce);
    }, [currentText, existingTickets, onSimilarFound]);

    if (similarTickets.length === 0) return null;

    return (
        <div className="mx-6 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fadeIn">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">
                        {similarTickets.length} similar issue{similarTickets.length > 1 ? 's' : ''} found
                    </span>
                    <span className="flex items-center gap-1 text-xs bg-amber-200 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        AI Detected
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-amber-600" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-amber-600" />
                )}
            </button>

            {isExpanded && (
                <div className="mt-3 space-y-2">
                    <p className="text-sm text-amber-600 mb-2">
                        These existing tickets might be related to your issue:
                    </p>
                    {similarTickets.map(ticket => (
                        <div
                            key={ticket.ticketId}
                            className="p-3 bg-white rounded-lg border border-amber-100 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-amber-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        {ticket.ticketId}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-[250px]">
                                        {ticket.aiAnalysis?.summary || ticket.originalText.substring(0, 50)}
                                    </p>
                                </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${ticket.status === 'resolved'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                {ticket.status}
                            </span>
                        </div>
                    ))}
                    <p className="text-xs text-amber-500 mt-2">
                        💡 Tip: Check if your issue is already being addressed before submitting
                    </p>
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
        </div>
    );
}
