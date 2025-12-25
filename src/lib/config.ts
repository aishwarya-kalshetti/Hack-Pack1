// Firebase configuration
// Replace these values with your actual Firebase project config
export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abc123"
};

// Gemini API configuration
export const geminiConfig = {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "your-gemini-api-key"
};

// App configuration
export const appConfig = {
    appName: "CampusAI",
    appDescription: "AI-Powered Campus Grievance Resolution System",
    departments: [
        { id: "hostel", name: "Hostel Administration", icon: "🏠" },
        { id: "academics", name: "Academic Affairs", icon: "📚" },
        { id: "transport", name: "Transport Services", icon: "🚌" },
        { id: "it", name: "IT Support", icon: "💻" },
        { id: "admin", name: "General Administration", icon: "📋" },
        { id: "security", name: "Campus Security", icon: "🔒" }
    ],
    urgencyLevels: [
        { id: "critical", label: "Critical", color: "#DC2626", bgColor: "#FEE2E2" },
        { id: "high", label: "High", color: "#EA580C", bgColor: "#FFEDD5" },
        { id: "medium", label: "Medium", color: "#CA8A04", bgColor: "#FEF9C3" },
        { id: "low", label: "Low", color: "#16A34A", bgColor: "#DCFCE7" }
    ],
    statusOptions: [
        { id: "open", label: "Open", color: "#3B82F6" },
        { id: "assigned", label: "Assigned", color: "#8B5CF6" },
        { id: "in_progress", label: "In Progress", color: "#F59E0B" },
        { id: "pending_info", label: "Pending Info", color: "#6B7280" },
        { id: "escalated", label: "Escalated", color: "#DC2626" },
        { id: "resolved", label: "Resolved", color: "#10B981" },
        { id: "closed", label: "Closed", color: "#1F2937" }
    ]
};
