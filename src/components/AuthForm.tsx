'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Lock,
    GraduationCap,
    Shield,
    Loader2,
    Eye,
    EyeOff,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthFormProps {
    onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
    const { signIn, signUp } = useAuth();
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        role: 'student' as 'student' | 'admin'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(formData.email, formData.password);
                toast.success('Welcome back! 🎉');
            } else {
                await signUp(formData.email, formData.password, formData.displayName, formData.role);
                toast.success('Account created! Welcome aboard! 🚀');
            }
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (role: 'student' | 'admin') => {
        setLoading(true);

        try {
            // First load demo data
            await fetch('/api/demo', { method: 'POST' });

            // Then login
            const email = role === 'admin' ? 'admin@demo.com' : 'student@demo.com';
            await signIn(email, 'demo123');
            toast.success(`Welcome, Demo ${role === 'admin' ? 'Admin' : 'Student'}! 🎉`);
            onSuccess?.();
        } catch (error: any) {
            toast.error('Demo login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/20 via-transparent to-violet-500/20 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
                        {isLogin ? <Lock className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {isLogin ? 'Welcome Back!' : 'Join CampusAI'}
                    </h2>
                    <p className="text-white/60 mt-1">
                        {isLogin ? 'Log in to track your grievances' : 'Create an account to get started'}
                    </p>
                </div>

                {/* Demo Login Buttons */}
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                    <p className="text-center text-yellow-300 text-sm mb-3 flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Quick Demo Access
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleDemoLogin('student')}
                            disabled={loading}
                            className="py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <GraduationCap className="w-4 h-4" />
                            Demo Student
                        </button>
                        <button
                            onClick={() => handleDemoLogin('admin')}
                            disabled={loading}
                            className="py-2.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Shield className="w-4 h-4" />
                            Demo Admin
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-white/20" />
                    <span className="text-white/40 text-sm">or continue with email</span>
                    <div className="flex-1 h-px bg-white/20" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Your name"
                                value={formData.displayName}
                                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                required={!isLogin}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                    )}

                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            required
                            minLength={6}
                            className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'student'
                                        ? 'border-indigo-500 bg-indigo-500/20 text-white'
                                        : 'border-white/20 text-white/60 hover:border-white/40'
                                    }`}
                            >
                                <GraduationCap className="w-6 h-6" />
                                <span className="text-sm font-medium">Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'admin'
                                        ? 'border-purple-500 bg-purple-500/20 text-white'
                                        : 'border-white/20 text-white/60 hover:border-white/40'
                                    }`}
                            >
                                <Shield className="w-6 h-6" />
                                <span className="text-sm font-medium">Admin</span>
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle */}
                <p className="text-center mt-6 text-white/60">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
}
