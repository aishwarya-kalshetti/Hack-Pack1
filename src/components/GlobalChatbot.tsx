'use client';

import { ChatbotWidget } from '@/components';
import { useAuth } from '@/contexts/AuthContext';

export default function GlobalChatbot() {
    const { user } = useAuth();

    // Only show chatbot for logged-in users
    if (!user) return null;

    return <ChatbotWidget />;
}
