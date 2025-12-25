'use client';

import React, { useState } from 'react';
import { GrievanceTicket } from '@/types';
import { appConfig } from '@/lib/config';
import {
    Brain,
    Edit3,
    Check,
    X,
    AlertTriangle,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Shield
} from 'lucide-react';

interface AIOverrideControlsProps {
    ticket: GrievanceTicket;
    onOverride: (field: string, newValue: string) => void;
    isAdmin: boolean;
}

export default function AIOverrideControls({ ticket, onOverride, isAdmin }: AIOverrideControlsProps) {
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isAdmin) return null;

    const aiAnalysis = ticket.aiAnalysis;
    const confidenceScore = aiAnalysis?.confidence || 0.85;
    const isLowConfidence = confidenceScore < 0.7;

    const handleEdit = (field: string, currentValue: string) => {
        setIsEditing(field);
        setEditValue(currentValue);
    };

    const handleSave = (field: string) => {
        onOverride(field, editValue);
        setIsEditing(null);
    };

    const handleCancel = () => {
        setIsEditing(null);
        setEditValue('');
    };

    return (
        <div className={`rounded-xl border-2 ${isLowConfidence ? 'border-amber-300 bg-amber-50' : 'border-purple-200 bg-purple-50'
            } overflow-hidden`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLowConfidence ? 'bg-amber-200' : 'bg-purple-200'
                        }`}>
                        <Brain className={`w-5 h-5 ${isLowConfidence ? 'text-amber-700' : 'text-purple-700'}`} />
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isLowConfidence ? 'text-amber-800' : 'text-purple-800'}`}>
                                AI Analysis
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${isLowConfidence
                                    ? 'bg-amber-200 text-amber-800'
                                    : 'bg-green-200 text-green-800'
                                }`}>
                                <Sparkles className="w-3 h-3" />
                                {Math.round(confidenceScore * 100)}% Confidence
                            </span>
                        </div>
                        <p className={`text-sm ${isLowConfidence ? 'text-amber-600' : 'text-purple-600'}`}>
                            {isLowConfidence
                                ? '⚠️ Low confidence - Review recommended'
                                : 'Human-in-the-Loop: Click to override AI decisions'}
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
            </button>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                    {/* Category Override */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                            <span className="text-xs text-gray-500">Category</span>
                            {isEditing === 'category' ? (
                                <select
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="block mt-1 px-2 py-1 border rounded-lg text-sm"
                                >
                                    {appConfig.departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="font-medium text-gray-800 capitalize">{aiAnalysis?.category}</p>
                            )}
                        </div>
                        {isEditing === 'category' ? (
                            <div className="flex gap-2">
                                <button onClick={() => handleSave('category')} className="p-1.5 bg-green-100 rounded-lg hover:bg-green-200">
                                    <Check className="w-4 h-4 text-green-600" />
                                </button>
                                <button onClick={handleCancel} className="p-1.5 bg-red-100 rounded-lg hover:bg-red-200">
                                    <X className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleEdit('category', aiAnalysis?.category || '')}
                                className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                <Edit3 className="w-4 h-4 text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Urgency Override */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                            <span className="text-xs text-gray-500">Urgency</span>
                            {isEditing === 'urgency' ? (
                                <select
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="block mt-1 px-2 py-1 border rounded-lg text-sm"
                                >
                                    {appConfig.urgencyLevels.map(level => (
                                        <option key={level.id} value={level.id}>{level.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="font-medium text-gray-800 capitalize">{aiAnalysis?.urgency}</p>
                            )}
                        </div>
                        {isEditing === 'urgency' ? (
                            <div className="flex gap-2">
                                <button onClick={() => handleSave('urgency')} className="p-1.5 bg-green-100 rounded-lg hover:bg-green-200">
                                    <Check className="w-4 h-4 text-green-600" />
                                </button>
                                <button onClick={handleCancel} className="p-1.5 bg-red-100 rounded-lg hover:bg-red-200">
                                    <X className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleEdit('urgency', aiAnalysis?.urgency || '')}
                                className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                <Edit3 className="w-4 h-4 text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Department Override */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                            <span className="text-xs text-gray-500">Department</span>
                            {isEditing === 'department' ? (
                                <select
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="block mt-1 px-2 py-1 border rounded-lg text-sm"
                                >
                                    {appConfig.departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="font-medium text-gray-800">{ticket.assignedDepartment}</p>
                            )}
                        </div>
                        {isEditing === 'department' ? (
                            <div className="flex gap-2">
                                <button onClick={() => handleSave('department')} className="p-1.5 bg-green-100 rounded-lg hover:bg-green-200">
                                    <Check className="w-4 h-4 text-green-600" />
                                </button>
                                <button onClick={handleCancel} className="p-1.5 bg-red-100 rounded-lg hover:bg-red-200">
                                    <X className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleEdit('department', ticket.assignedDepartment || '')}
                                className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                <Edit3 className="w-4 h-4 text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Human Approval Badge */}
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700">
                            Human-in-the-Loop: All AI decisions can be reviewed and overridden
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
