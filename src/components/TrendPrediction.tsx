'use client';

import React, { useState, useEffect } from 'react';
import { GrievanceTicket } from '@/types';
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb, Sparkles, Calendar, ArrowRight } from 'lucide-react';

interface TrendPredictionProps {
    tickets: GrievanceTicket[];
}

interface Prediction {
    category: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    prediction: string;
    confidence: number;
    icon: string;
}

export default function TrendPrediction({ tickets }: TrendPredictionProps) {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Analyze ticket patterns
        const analyzeTrends = () => {
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

            // Count tickets by category for last week vs previous week
            const lastWeekTickets = tickets.filter(t => new Date(t.createdAt) >= weekAgo);
            const prevWeekTickets = tickets.filter(t =>
                new Date(t.createdAt) >= twoWeeksAgo && new Date(t.createdAt) < weekAgo
            );

            const categoryCount = (list: GrievanceTicket[], cat: string) =>
                list.filter(t => t.aiAnalysis?.category === cat).length;

            const categories = ['hostel', 'it', 'canteen', 'academic', 'transport'];
            const categoryIcons: Record<string, string> = {
                hostel: '🏠',
                it: '💻',
                canteen: '🍽️',
                academic: '📚',
                transport: '🚌'
            };

            const newPredictions: Prediction[] = categories.map(cat => {
                const lastWeek = categoryCount(lastWeekTickets, cat);
                const prevWeek = categoryCount(prevWeekTickets, cat);
                const change = lastWeek - prevWeek;

                let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
                let prediction = '';
                let confidence = 0.7;

                if (change > 2) {
                    trend = 'increasing';
                    prediction = `${cat.charAt(0).toUpperCase() + cat.slice(1)} issues likely to increase by ${Math.round((change / (prevWeek || 1)) * 100)}% next week`;
                    confidence = 0.8;
                } else if (change < -2) {
                    trend = 'decreasing';
                    prediction = `${cat.charAt(0).toUpperCase() + cat.slice(1)} issues showing improvement, expected to decrease`;
                    confidence = 0.75;
                } else {
                    trend = 'stable';
                    prediction = `${cat.charAt(0).toUpperCase() + cat.slice(1)} issues remain steady`;
                    confidence = 0.65;
                }

                return {
                    category: cat,
                    trend,
                    prediction,
                    confidence,
                    icon: categoryIcons[cat] || '📋'
                };
            }).filter(p => p.trend !== 'stable').slice(0, 3);

            // Add general predictions
            if (lastWeekTickets.length > prevWeekTickets.length * 1.5) {
                newPredictions.unshift({
                    category: 'overall',
                    trend: 'increasing',
                    prediction: 'Overall ticket volume is rising. Consider proactive maintenance checks.',
                    confidence: 0.85,
                    icon: '📈'
                });
            }

            setPredictions(newPredictions);
            setLoading(false);
        };

        analyzeTrends();
    }, [tickets]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">AI Trend Predictions</h3>
                        <p className="text-white/70 text-sm">Based on last 14 days data</p>
                    </div>
                </div>
            </div>

            {/* Predictions List */}
            <div className="p-4 space-y-3">
                {predictions.length > 0 ? (
                    predictions.map((pred, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl border transition-all hover:shadow-md ${pred.trend === 'increasing'
                                    ? 'bg-red-50 border-red-100'
                                    : pred.trend === 'decreasing'
                                        ? 'bg-green-50 border-green-100'
                                        : 'bg-gray-50 border-gray-100'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{pred.icon}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {pred.trend === 'increasing' ? (
                                            <TrendingUp className="w-4 h-4 text-red-500" />
                                        ) : pred.trend === 'decreasing' ? (
                                            <TrendingDown className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4 text-gray-500" />
                                        )}
                                        <span className={`text-sm font-medium capitalize ${pred.trend === 'increasing' ? 'text-red-700' :
                                                pred.trend === 'decreasing' ? 'text-green-700' : 'text-gray-700'
                                            }`}>
                                            {pred.category} - {pred.trend}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{pred.prediction}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${pred.confidence > 0.8 ? 'bg-green-500' :
                                                        pred.confidence > 0.7 ? 'bg-yellow-500' : 'bg-gray-400'
                                                    }`}
                                                style={{ width: `${pred.confidence * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {Math.round(pred.confidence * 100)}% confidence
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Not enough data for predictions</p>
                        <p className="text-sm text-gray-400">Predictions will appear as more tickets are submitted</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Last updated: Now</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span>Powered by Gemini AI</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
