'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'te';

interface LanguageOption {
    code: Language;
    name: string;
    nativeName: string;
    flag: string;
}

export const languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
];

// UI translations
const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.newGrievance': 'New Grievance',
        'nav.myTickets': 'My Tickets',
        'nav.allTickets': 'All Tickets',
        'nav.analytics': 'Analytics',
        'nav.logout': 'Logout',

        // Landing Page
        'landing.title': 'AI-Powered Campus',
        'landing.titleHighlight': 'Grievance Resolution',
        'landing.subtitle': 'Submit issues via text, voice, or image. Our AI instantly classifies and routes your grievance to the right department.',
        'landing.getStarted': 'Get Started',
        'landing.watchDemo': 'Watch Demo',

        // Grievance Form
        'form.title': 'AI Grievance Assistant',
        'form.subtitle': 'Powered by Gemini AI',
        'form.placeholder': 'Type or speak your issue...',
        'form.send': 'Send',
        'form.showOptions': 'Show options (photo, location, anonymous)',
        'form.hideOptions': 'Hide options',
        'form.location': 'Location',
        'form.anonymous': 'Submit anonymously',
        'form.uploadPhoto': 'Attach a photo (optional)',

        // Tickets
        'tickets.title': 'My Tickets',
        'tickets.noTickets': 'No tickets yet',
        'tickets.status.open': 'Open',
        'tickets.status.inProgress': 'In Progress',
        'tickets.status.resolved': 'Resolved',
        'tickets.status.closed': 'Closed',

        // Stats
        'stats.total': 'Total Tickets',
        'stats.resolved': 'Resolved',
        'stats.pending': 'Pending',
        'stats.avgTime': 'Avg Resolution',

        // Chatbot
        'chatbot.title': 'CampusAI Assistant',
        'chatbot.online': 'Online',
        'chatbot.askAnything': 'Ask me anything...',
        'chatbot.greeting': 'Hi! I\'m your CampusAI assistant. How can I help you today?',
    },
    hi: {
        // Navigation
        'nav.dashboard': 'डैशबोर्ड',
        'nav.newGrievance': 'नई शिकायत',
        'nav.myTickets': 'मेरी टिकट',
        'nav.allTickets': 'सभी टिकट',
        'nav.analytics': 'विश्लेषण',
        'nav.logout': 'लॉगआउट',

        // Landing Page
        'landing.title': 'AI-संचालित कैंपस',
        'landing.titleHighlight': 'शिकायत समाधान',
        'landing.subtitle': 'टेक्स्ट, आवाज, या छवि के माध्यम से समस्याएं जमा करें। हमारी AI तुरंत आपकी शिकायत को सही विभाग तक पहुंचाती है।',
        'landing.getStarted': 'शुरू करें',
        'landing.watchDemo': 'डेमो देखें',

        // Grievance Form
        'form.title': 'AI शिकायत सहायक',
        'form.subtitle': 'Gemini AI द्वारा संचालित',
        'form.placeholder': 'अपनी समस्या लिखें या बोलें...',
        'form.send': 'भेजें',
        'form.showOptions': 'विकल्प दिखाएं (फोटो, स्थान, गुमनाम)',
        'form.hideOptions': 'विकल्प छिपाएं',
        'form.location': 'स्थान',
        'form.anonymous': 'गुमनाम रूप से जमा करें',
        'form.uploadPhoto': 'फोटो अपलोड करें (वैकल्पिक)',

        // Tickets
        'tickets.title': 'मेरी टिकट',
        'tickets.noTickets': 'अभी कोई टिकट नहीं',
        'tickets.status.open': 'खुला',
        'tickets.status.inProgress': 'प्रगति में',
        'tickets.status.resolved': 'हल किया गया',
        'tickets.status.closed': 'बंद',

        // Stats
        'stats.total': 'कुल टिकट',
        'stats.resolved': 'हल किए गए',
        'stats.pending': 'लंबित',
        'stats.avgTime': 'औसत समाधान',

        // Chatbot
        'chatbot.title': 'CampusAI सहायक',
        'chatbot.online': 'ऑनलाइन',
        'chatbot.askAnything': 'कुछ भी पूछें...',
        'chatbot.greeting': 'नमस्ते! मैं आपका CampusAI सहायक हूं। मैं आज आपकी कैसे मदद कर सकता हूं?',
    },
    ta: {
        // Navigation
        'nav.dashboard': 'டாஷ்போர்டு',
        'nav.newGrievance': 'புதிய புகார்',
        'nav.myTickets': 'என் டிக்கெட்டுகள்',
        'nav.allTickets': 'அனைத்து டிக்கெட்டுகள்',
        'nav.analytics': 'பகுப்பாய்வு',
        'nav.logout': 'வெளியேறு',

        // Landing Page
        'landing.title': 'AI-இயக்கப்படும் வளாகம்',
        'landing.titleHighlight': 'புகார் தீர்வு',
        'landing.subtitle': 'உரை, குரல் அல்லது படம் மூலம் சிக்கல்களைச் சமர்ப்பிக்கவும். எங்கள் AI உங்கள் புகாரை சரியான துறைக்கு உடனடியாக அனுப்புகிறது।',
        'landing.getStarted': 'தொடங்கவும்',
        'landing.watchDemo': 'டெமோ பார்க்கவும்',

        // Grievance Form
        'form.title': 'AI புகார் உதவியாளர்',
        'form.subtitle': 'Gemini AI மூலம் இயக்கப்படுகிறது',
        'form.placeholder': 'உங்கள் சிக்கலை தட்டச்சு செய்யவும் அல்லது பேசவும்...',
        'form.send': 'அனுப்பு',
        'form.showOptions': 'விருப்பங்களைக் காட்டு',
        'form.hideOptions': 'விருப்பங்களை மறை',
        'form.location': 'இடம்',
        'form.anonymous': 'அநாமதேயமாக சமர்ப்பிக்கவும்',
        'form.uploadPhoto': 'புகைப்படம் இணைக்கவும்',

        // Tickets
        'tickets.title': 'என் டிக்கெட்டுகள்',
        'tickets.noTickets': 'இன்னும் டிக்கெட்டுகள் இல்லை',
        'tickets.status.open': 'திறந்த',
        'tickets.status.inProgress': 'செயலில்',
        'tickets.status.resolved': 'தீர்க்கப்பட்டது',
        'tickets.status.closed': 'மூடப்பட்டது',

        // Stats
        'stats.total': 'மொத்த டிக்கெட்டுகள்',
        'stats.resolved': 'தீர்க்கப்பட்டவை',
        'stats.pending': 'நிலுவையில்',
        'stats.avgTime': 'சராசரி தீர்வு',

        // Chatbot
        'chatbot.title': 'CampusAI உதவியாளர்',
        'chatbot.online': 'ஆன்லைன்',
        'chatbot.askAnything': 'எதையும் கேளுங்கள்...',
        'chatbot.greeting': 'வணக்கம்! நான் உங்கள் CampusAI உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    },
    te: {
        // Navigation
        'nav.dashboard': 'డాష్‌బోర్డ్',
        'nav.newGrievance': 'కొత్త ఫిర్యాదు',
        'nav.myTickets': 'నా టికెట్లు',
        'nav.allTickets': 'అన్ని టికెట్లు',
        'nav.analytics': 'విశ్లేషణలు',
        'nav.logout': 'లాగ్ అవుట్',

        // Landing Page
        'landing.title': 'AI-ఆధారిత క్యాంపస్',
        'landing.titleHighlight': 'ఫిర్యాదు పరిష్కారం',
        'landing.subtitle': 'టెక్స్ట్, వాయిస్ లేదా ఇమేజ్ ద్వారా సమస్యలను సమర్పించండి. మా AI మీ ఫిర్యాదును సరైన విభాగానికి తక్షణమే పంపుతుంది.',
        'landing.getStarted': 'ప్రారంభించండి',
        'landing.watchDemo': 'డెమో చూడండి',

        // Grievance Form
        'form.title': 'AI ఫిర్యాదు సహాయకుడు',
        'form.subtitle': 'Gemini AI ద్వారా ఆధారితం',
        'form.placeholder': 'మీ సమస్యను టైప్ చేయండి లేదా మాట్లాడండి...',
        'form.send': 'పంపండి',
        'form.showOptions': 'ఎంపికలను చూపించు',
        'form.hideOptions': 'ఎంపికలను దాచు',
        'form.location': 'స్థానం',
        'form.anonymous': 'అనామకంగా సమర్పించండి',
        'form.uploadPhoto': 'ఫోటో జోడించండి',

        // Tickets
        'tickets.title': 'నా టికెట్లు',
        'tickets.noTickets': 'ఇంకా టికెట్లు లేవు',
        'tickets.status.open': 'ఓపెన్',
        'tickets.status.inProgress': 'పురోగతిలో',
        'tickets.status.resolved': 'పరిష్కరించబడింది',
        'tickets.status.closed': 'మూసివేయబడింది',

        // Stats
        'stats.total': 'మొత్తం టికెట్లు',
        'stats.resolved': 'పరిష్కరించినవి',
        'stats.pending': 'పెండింగ్',
        'stats.avgTime': 'సగటు పరిష్కారం',

        // Chatbot
        'chatbot.title': 'CampusAI సహాయకుడు',
        'chatbot.online': 'ఆన్‌లైన్',
        'chatbot.askAnything': 'ఏదైనా అడగండి...',
        'chatbot.greeting': 'నమస్కారం! నేను మీ CampusAI సహాయకుడిని. ఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?',
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('campusai_language') as Language;
        if (savedLang && translations[savedLang]) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('campusai_language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
