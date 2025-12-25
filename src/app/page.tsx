'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  GraduationCap,
  Sparkles,
  Shield,
  Clock,
  BarChart3,
  Zap,
  Brain,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// Animated background particles
function ParticleBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: Math.random() * 6 + 2 + 'px',
            height: Math.random() * 6 + 2 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: -Math.random() * 10 + 's'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Typing animation component
function TypeWriter({ text, delay = 50 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// Animated stat counter
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}{suffix}</span>;
}

// Feature card with hover effect
function FeatureCard({ icon: Icon, title, description, color }: {
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group relative p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:bg-white/10">
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/60 text-sm">{description}</p>
    </div>
  );
}

// Demo conversation
const demoConversation = [
  { role: 'user', message: "The WiFi in library has been down for 3 days!" },
  { role: 'ai', message: "I understand your frustration. Let me analyze this..." },
  { role: 'ai', message: "✓ Category: IT Infrastructure\n✓ Urgency: HIGH\n✓ Routed to: IT Support\n✓ Ticket: GRV-2024-00542" }
];

export default function Home() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      router.push(isAdmin ? '/admin' : '/student');
    }
  }, [user, loading, isAdmin, router]);

  // Auto-play demo conversation
  useEffect(() => {
    const timer = setInterval(() => {
      setShowDemo(true);
      setDemoStep(prev => (prev + 1) % (demoConversation.length + 2));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/20 rounded-full animate-spin border-t-white" />
            <Brain className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white/60 mt-4 animate-pulse">Initializing AI...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <ParticleBackground />

      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse-slow">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-ping" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">AI</span></span>
              <p className="text-xs text-white/40">Powered by Gemini</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/60 text-sm">AI System Online</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left: Hero Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-violet-500/20 backdrop-blur-lg rounded-full border border-pink-500/30">
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
              <span className="text-sm text-pink-300">AI-Powered • Instant Classification • 24/7 Support</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
              <TypeWriter text="Campus Problems?" delay={80} />
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-gradient">
                AI Solves Them.
              </span>
            </h1>

            <p className="text-xl text-white/60 max-w-lg leading-relaxed">
              Tell us your issue in plain language. Our AI instantly understands, classifies,
              and routes it to the right department. No forms. No confusion. Just solutions.
            </p>

            {/* Live Demo Chat */}
            <div className="relative p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="text-white/80 font-medium">Live AI Demo</span>
                <span className="ml-auto text-xs text-white/40">Auto-playing...</span>
              </div>

              <div className="space-y-3 min-h-[120px]">
                {demoConversation.slice(0, Math.min(demoStep, demoConversation.length)).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-line ${msg.role === 'user'
                        ? 'bg-indigo-500 text-white rounded-br-sm'
                        : 'bg-white/10 text-white/90 rounded-bl-sm border border-white/10'
                      }`}>
                      {msg.role === 'ai' && <Sparkles className="w-3 h-3 inline mr-1 text-purple-400" />}
                      {msg.message}
                    </div>
                  </div>
                ))}
                {demoStep >= demoConversation.length && (
                  <div className="flex justify-center animate-fadeIn">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Ticket created in 2.3 seconds!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white"><AnimatedCounter value={75} suffix="%" /></div>
                <div className="text-sm text-white/40">Faster Resolution</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white"><AnimatedCounter value={94} suffix="%" /></div>
                <div className="text-sm text-white/40">AI Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white"><AnimatedCounter value={24} />/7</div>
                <div className="text-sm text-white/40">Availability</div>
              </div>
            </div>
          </div>

          {/* Right: Auth Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-3xl blur-3xl opacity-20 animate-pulse-slow" />
            <AuthForm />
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-32 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why CampusAI is Different</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Traditional systems make you fill forms and wait. We use AI to understand you instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Brain}
              title="AI Understanding"
              description="Natural language processing understands your issue instantly"
              color="from-purple-500 to-indigo-500"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Routing"
              description="Automatically sent to the right department in seconds"
              color="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={Shield}
              title="Anonymous Option"
              description="Report sensitive issues without revealing identity"
              color="from-green-500 to-teal-500"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Live Tracking"
              description="Real-time updates on your ticket status"
              color="from-pink-500 to-rose-500"
            />
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob { animation: blob 15s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-pulse-slow { animation: pulse 3s infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}
