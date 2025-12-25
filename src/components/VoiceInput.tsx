'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
}

export default function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [transcript, setTranscript] = useState('');

    useEffect(() => {
        // Check if speech recognition is supported
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            setIsSupported(!!SpeechRecognition);
        }
    }, []);

    const startListening = useCallback(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Indian English

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript = transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript);
                onTranscript(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();

        // Store recognition instance for cleanup
        (window as any).currentRecognition = recognition;
    }, [onTranscript]);

    const stopListening = useCallback(() => {
        if ((window as any).currentRecognition) {
            (window as any).currentRecognition.stop();
        }
        setIsListening(false);
    }, []);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!isSupported) {
        return null; // Don't show button if not supported
    }

    return (
        <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            className={`
        relative p-3 rounded-xl transition-all duration-300
        ${isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
            title={isListening ? 'Stop listening' : 'Speak your grievance'}
        >
            {isListening ? (
                <>
                    <MicOff className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                </>
            ) : (
                <Mic className="w-5 h-5" />
            )}
        </button>
    );
}
