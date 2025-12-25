'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Ban, ThumbsDown, Eye, Sparkles } from 'lucide-react';

interface SpamDetectorProps {
    text: string;
    onSpamDetected?: (isSpam: boolean, reason: string) => void;
}

interface SpamResult {
    isSpam: boolean;
    confidence: number;
    reason: string;
    flags: string[];
}

// Spam detection patterns
const spamPatterns = {
    profanity: /\b(damn|hell|stupid|idiot|fool|dumb)\b/gi,
    repetitive: /(.)\1{4,}/g, // Same character repeated 5+ times
    allCaps: /^[A-Z\s]{20,}$/,
    gibberish: /^[a-z]{30,}$/i,
    testMessages: /^(test|testing|asdf|qwerty|123|hello world)$/i,
    emptyContent: /^\s*$/,
    tooShort: /^.{1,10}$/,
};

export default function SpamDetector({ text, onSpamDetected }: SpamDetectorProps) {
    const [result, setResult] = useState<SpamResult | null>(null);

    useEffect(() => {
        if (!text || text.length < 5) {
            setResult(null);
            return;
        }

        const detectSpam = () => {
            const flags: string[] = [];
            let spamScore = 0;

            // Check for profanity
            if (spamPatterns.profanity.test(text)) {
                flags.push('Potentially inappropriate language');
                spamScore += 0.3;
            }

            // Check for repetitive characters
            if (spamPatterns.repetitive.test(text)) {
                flags.push('Repetitive characters detected');
                spamScore += 0.4;
            }

            // Check for all caps
            if (spamPatterns.allCaps.test(text)) {
                flags.push('All caps text');
                spamScore += 0.2;
            }

            // Check for test messages
            if (spamPatterns.testMessages.test(text.trim())) {
                flags.push('Test message detected');
                spamScore += 0.5;
            }

            // Check for very short messages
            if (text.trim().length < 15) {
                flags.push('Message too short for proper classification');
                spamScore += 0.2;
            }

            // Check for no spaces (likely gibberish)
            if (text.length > 30 && !text.includes(' ')) {
                flags.push('No word separation detected');
                spamScore += 0.3;
            }

            const isSpam = spamScore >= 0.5;
            const reason = flags.length > 0
                ? flags[0]
                : 'Content appears valid';

            const result: SpamResult = {
                isSpam,
                confidence: Math.min(spamScore, 1),
                reason,
                flags
            };

            setResult(result);
            onSpamDetected?.(isSpam, reason);
        };

        const debounce = setTimeout(detectSpam, 300);
        return () => clearTimeout(debounce);
    }, [text, onSpamDetected]);

    if (!result || (!result.isSpam && result.flags.length === 0)) {
        return null;
    }

    if (result.isSpam) {
        return (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Ban className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-red-800">Potential Misuse Detected</h4>
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI Protection
                            </span>
                        </div>
                        <p className="text-sm text-red-600 mb-2">{result.reason}</p>
                        <div className="flex flex-wrap gap-1">
                            {result.flags.map((flag, i) => (
                                <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                    {flag}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-red-500 mt-2">
                            Please provide a clear, meaningful description of your issue.
                        </p>
                    </div>
                </div>

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

    // Warning state (not spam but has flags)
    if (result.flags.length > 0) {
        return (
            <div className="mx-6 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2 text-yellow-700 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>Tip: {result.flags[0]}. Adding more detail will help us resolve your issue faster.</span>
                </div>
            </div>
        );
    }

    return null;
}
