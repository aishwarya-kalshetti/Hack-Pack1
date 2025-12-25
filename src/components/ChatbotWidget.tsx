'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, MinusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
}

const quickActions = [
    "What's my ticket status?",
    "How long will resolution take?",
    "Who handles hostel issues?",
    "Can I submit anonymously?"
];

export default function ChatbotWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'bot',
            content: `Hi ${user?.displayName || 'there'}! 👋 I'm your CampusAI assistant. How can I help you today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(async () => {
            const response = await generateResponse(messageText);
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1000);
    };

    const generateResponse = async (query: string): Promise<string> => {
        const lowerQuery = query.toLowerCase();

        // FAQ responses
        if (lowerQuery.includes('status') || lowerQuery.includes('track')) {
            return "To check your ticket status:\n\n1. Go to 'My Tickets' in the menu\n2. Click on any ticket to see detailed status\n3. You'll see real-time updates and estimated resolution time\n\nWould you like me to help with anything else?";
        }

        if (lowerQuery.includes('how long') || lowerQuery.includes('time') || lowerQuery.includes('resolution')) {
            return "Resolution times depend on urgency:\n\n🔴 Critical: 4 hours\n🟠 High: 24 hours\n🟡 Medium: 3 days\n🟢 Low: 7 days\n\nOur AI automatically assigns urgency based on your issue description!";
        }

        if (lowerQuery.includes('hostel')) {
            return "Hostel issues are handled by the **Hostel Administration** department. Common issues include:\n\n• Water supply problems\n• Electrical issues\n• Maintenance requests\n• Room allocation\n\nJust describe your issue and our AI will route it automatically!";
        }

        if (lowerQuery.includes('anonymous')) {
            return "Yes! You can submit grievances anonymously. Here's how:\n\n1. Go to 'New Grievance'\n2. Click 'Show options' below the input\n3. Toggle 'Submit anonymously'\n\nYour identity will be completely hidden from administrators.";
        }

        if (lowerQuery.includes('canteen') || lowerQuery.includes('food')) {
            return "Canteen-related issues (food quality, hygiene, pricing) are handled by the **Food & Catering** department. We take food safety seriously - high urgency issues are addressed within 24 hours!";
        }

        if (lowerQuery.includes('wifi') || lowerQuery.includes('internet') || lowerQuery.includes('it')) {
            return "IT issues (WiFi, network, computer labs) go to the **IT Support** team. For urgent connectivity issues, we prioritize resolution within 24 hours.";
        }

        if (lowerQuery.includes('thank')) {
            return "You're welcome! 😊 Is there anything else I can help you with?";
        }

        if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
            return `Hello! 👋 I'm here to help with your campus queries. You can ask me about:\n\n• Ticket status\n• Resolution times\n• Which department handles what\n• How to submit anonymously\n\nWhat would you like to know?`;
        }

        // Default response
        return "I'm not sure about that specific query, but I can help you with:\n\n• Checking ticket status\n• Understanding resolution times\n• Department information\n• Anonymous submissions\n\nFor specific grievances, please use the 'New Grievance' form where our AI will assist you!";
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 transition-all ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">CampusAI Assistant</p>
                        <p className="text-xs text-white/70 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            Online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <MinusCircle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="h-[340px] overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                            ? 'bg-indigo-100 text-indigo-600'
                                            : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                        }`}>
                                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                    </div>
                                    <div className={`px-3 py-2 rounded-xl text-sm ${message.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-sm'
                                            : 'bg-white shadow-sm border border-gray-100 rounded-bl-sm text-gray-700'
                                        }`}>
                                        <div className="whitespace-pre-line">
                                            {message.content.split('**').map((part, i) =>
                                                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length <= 2 && (
                        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(action)}
                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-full transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 border-t border-gray-100 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me anything..."
                                className="flex-1 px-3 py-2 bg-gray-100 rounded-xl text-sm border-0 focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim()}
                                className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
