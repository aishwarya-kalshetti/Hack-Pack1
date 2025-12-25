'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar, GrievanceForm } from '@/components';
import { Loader2 } from 'lucide-react';

export default function NewGrievancePage() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!user) {
        router.push('/');
        return null;
    }

    if (isAdmin) {
        router.push('/admin');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Submit New Grievance</h1>
                    <p className="text-gray-600 mt-1">
                        Describe your issue and our AI will handle the rest
                    </p>
                </div>

                <GrievanceForm
                    onSuccess={(ticketId) => {
                        // Optional: redirect after submission
                    }}
                />
            </main>
        </div>
    );
}
