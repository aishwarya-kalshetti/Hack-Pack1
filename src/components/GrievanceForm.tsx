'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { submitGrievance } from '@/lib/firestore';
import { appConfig } from '@/lib/config';
import VoiceInput from './VoiceInput';
import ImageUpload from './ImageUpload';
import {
    Send,
    Sparkles,
    Bot,
    User,
    MapPin,
    EyeOff,
    CheckCircle,
    Loader2,
    ArrowRight,
    Zap,
    Mic,
    Camera
} from 'lucide-react';
import toast from 'react-hot-toast';



interface Message {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
}

interface GrievanceFormProps {
    onSuccess?: (ticketId: string) => void;
}

const suggestedPrompts = [
    "WiFi is not working in the library 📶",
    "Water supply issue in hostel block A 💧",
    "Broken AC in classroom 302 ❄️",
    "Canteen food quality needs improvement 🍽️"
];

export default function GrievanceForm({ onSuccess }: GrievanceFormProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: `Hey ${user?.displayName || 'there'}! 👋\n\nI'm your AI assistant. Tell me about any campus issue you're facing, and I'll instantly analyze and route it to the right department.\n\n💡 Just describe your problem in plain language!`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [location, setLocation] = useState('');
    const [ticketCreated, setTicketCreated] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (role: 'user' | 'ai' | 'system', content: string, isTyping = false) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date(),
            isTyping
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage.id;
    };

    const updateMessage = (id: string, content: string) => {
        setMessages(prev => prev.map(m =>
            m.id === id ? { ...m, content, isTyping: false } : m
        ));
    };

    const handleSubmit = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || isProcessing) return;

        setInput('');
        addMessage('user', messageText);
        setIsProcessing(true);

        // Add thinking message
        const thinkingId = addMessage('ai', '', true);

        // Simulate AI thinking with progressive updates
        const thinkingMessages = [
            '🔍 Analyzing your message...',
            '🧠 Understanding the context...',
            '📊 Determining urgency level...',
            '🏛️ Identifying the right department...',
            '✨ Generating response...'
        ];

        for (let i = 0; i < thinkingMessages.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 400));
            updateMessage(thinkingId, thinkingMessages[i]);
        }

        try {
            const result = await submitGrievance(
                {
                    grievanceText: messageText,
                    location: location || undefined,
                    isAnonymous
                },
                {
                    userId: user!.userId,
                    email: user!.email,
                    displayName: user!.displayName
                }
            );

            // Remove thinking message and add result
            setMessages(prev => prev.filter(m => m.id !== thinkingId));

            // Format the response beautifully
            const aiResponse = `
🎫 **Ticket Created: ${result.ticketId}**

📋 **Analysis Results:**
• Category: ${result.aiAnalysis.category}
• Urgency: ${result.aiAnalysis.urgency.toUpperCase()}
• Department: ${appConfig.departments.find(d => d.id === result.aiAnalysis.department)?.name || result.aiAnalysis.department}

📝 **Summary:** ${result.aiAnalysis.summary}

⏱️ **Expected Response:** ${result.aiAnalysis.urgency === 'critical' ? '4 hours' :
                    result.aiAnalysis.urgency === 'high' ? '24 hours' :
                        result.aiAnalysis.urgency === 'medium' ? '3 days' : '7 days'
                }

✅ Your grievance has been routed to the appropriate team!
      `.trim();

            addMessage('ai', aiResponse);
            setTicketCreated(result.ticketId);
            toast.success('Ticket created successfully!');
            onSuccess?.(result.ticketId);

        } catch (error: any) {
            setMessages(prev => prev.filter(m => m.id !== thinkingId));
            addMessage('ai', `❌ Sorry, I encountered an error: ${error.message}\n\nPlease try again or contact support.`);
            toast.error('Failed to create ticket');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                        <Bot className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">AI Grievance Assistant</h2>
                        <p className="text-white/80 text-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Powered by Gemini AI
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
                        <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                }`}>
                                {message.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            </div>
                            <div className={`px-4 py-3 rounded-2xl ${message.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-white shadow-md border border-gray-100 rounded-bl-sm text-gray-700'
                                }`}>
                                {message.isTyping ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                        <span className="text-gray-500">{message.content || 'Thinking...'}</span>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-line text-sm leading-relaxed">
                                        {message.content.split('**').map((part, i) =>
                                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts */}
            {messages.length <= 1 && !isProcessing && (
                <div className="px-6 pb-4 flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => handleSubmit(prompt)}
                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-full transition-all"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Options Toggle */}
            <div className="px-6 pb-2">
                <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    {showOptions ? '▼ Hide options' : '▶ Show options (photo, location, anonymous)'}
                </button>

                {showOptions && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-4 animate-fadeIn">
                        {/* Image Upload */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Camera className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Attach a photo (optional)</span>
                            </div>
                            <ImageUpload
                                onImageAnalyzed={(analysis) => {
                                    // Optionally pre-fill based on AI analysis
                                    if (analysis.description && !input) {
                                        setInput(analysis.description);
                                    }
                                    toast.success('Image analyzed! AI detected: ' + analysis.suggestedCategory);
                                }}
                                onImageSelected={(file) => {
                                    // Store file for later if needed
                                    console.log('Image selected:', file?.name);
                                }}
                            />
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Location (e.g., Block A, Room 302)"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Anonymous Toggle */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-10 h-6 rounded-full transition-colors ${isAnonymous ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${isAnonymous ? 'translate-x-4' : 'translate-x-0.5'} translate-y-0.5`} />
                            </div>
                            <EyeOff className={`w-5 h-5 ${isAnonymous ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <span className={`text-sm ${isAnonymous ? 'text-indigo-600' : 'text-gray-500'}`}>Submit anonymously</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-100 bg-white">
                {ticketCreated ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="font-medium text-green-800">Ticket {ticketCreated} created!</p>
                                <p className="text-sm text-green-600">You can track it in My Tickets</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setTicketCreated(null);
                                setMessages([messages[0]]);
                            }}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            New Issue <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <VoiceInput
                            onTranscript={(text) => setInput(prev => prev + ' ' + text)}
                            disabled={isProcessing}
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type or speak your issue..."
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                        />
                        <button
                            onClick={() => handleSubmit()}
                            disabled={!input.trim() || isProcessing}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 font-medium"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Send
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

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
