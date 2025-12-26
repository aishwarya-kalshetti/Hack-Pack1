'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import {
    GraduationCap,
    Home,
    FileText,
    Plus,
    BarChart3,
    Menu,
    X,
    LogOut,
    User,
    Moon,
    Sun,
    Shield
} from 'lucide-react';

interface NavbarProps {
    onMenuToggle?: () => void;
    isMenuOpen?: boolean;
}

export default function Navbar({ onMenuToggle, isMenuOpen }: NavbarProps) {
    const { user, logout, isAdmin } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const { t } = useLanguage();
    const pathname = usePathname();

    const navigation = isAdmin
        ? [
            { name: t('nav.dashboard'), href: '/admin', icon: Home },
            { name: t('nav.allTickets'), href: '/admin/tickets', icon: FileText },
            { name: t('nav.analytics'), href: '/admin/analytics', icon: BarChart3 },
        ]
        : [
            { name: t('nav.dashboard'), href: '/student', icon: Home },
            { name: t('nav.newGrievance'), href: '/student/new', icon: Plus },
            { name: t('nav.myTickets'), href: '/student/tickets', icon: FileText },
        ];

    return (
        <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${isDark
            ? 'bg-gray-900/80 border-gray-800'
            : 'bg-white/80 border-gray-200'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={isAdmin ? '/admin' : '/student'} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">AI</span>
                            </span>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {isAdmin ? '🛡️ Admin Portal' : '🎓 Student Portal'}
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                        : isDark
                                            ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        {/* Language Selector */}
                        <div className="hidden sm:block">
                            <LanguageSelector />
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-xl transition-all ${isDark
                                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* User Menu */}
                        {user && (
                            <div className="hidden sm:flex items-center gap-3">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin
                                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                                        : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                                        }`}>
                                        {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                        {user.displayName}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={onMenuToggle}
                            className={`md:hidden p-2 rounded-xl ${isDark ? 'text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className={`md:hidden border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                    }`}>
                    <div className="px-4 py-3 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                        : isDark
                                            ? 'text-gray-300 hover:bg-gray-800'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                        {user && (
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl w-full"
                            >
                                <LogOut className="w-5 h-5" />
                                {t('nav.logout')}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
