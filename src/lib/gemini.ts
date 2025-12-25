import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiConfig } from './config';

const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface GrievanceClassification {
    category: string;
    subCategory: string;
    department: string;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    urgencyScore: number;
    summary: string;
    suggestedAction: string;
    keywords: string[];
    sentiment: string;
    confidence: number;
    requiresImmediate: boolean;
}

export interface DuplicateCheckResult {
    isDuplicate: boolean;
    duplicateOf: string | null;
    similarityScore: number;
    relatedTickets: string[];
    reasoning: string;
    recommendation: string;
}

export interface StudentResponse {
    subject: string;
    greeting: string;
    body: string;
    nextSteps: string;
    closing: string;
    fullMessage: string;
}

const CLASSIFICATION_PROMPT = `You are an AI assistant for a university campus grievance system. Analyze the student's grievance and provide a structured classification.

### DEPARTMENTS:
- hostel: Hostel issues (rooms, water, electricity, food, cleanliness, laundry)
- academics: Academic matters (exams, grades, professors, courses, library)
- transport: Bus, shuttle, parking issues
- it: WiFi, computer labs, email, software
- admin: Fee payment, certificates, ID cards, general administration
- security: Safety concerns, theft, unauthorized access

### URGENCY LEVELS:
- critical: Immediate safety risk, medical emergency, security threat
- high: Affecting daily routine significantly, time-sensitive
- medium: Inconvenient but manageable, can wait 2-3 days
- low: Minor issues, suggestions, general feedback

### INPUT:
Student Grievance: "{grievanceText}"
Student Location (if provided): "{location}"
Submission Time: "{timestamp}"

### OUTPUT FORMAT (JSON only):
{
  "category": "string",
  "subCategory": "string",
  "department": "string",
  "urgency": "string",
  "urgencyScore": number,
  "summary": "string (max 100 chars)",
  "suggestedAction": "string",
  "keywords": ["array"],
  "sentiment": "string",
  "confidence": number,
  "requiresImmediate": boolean
}

Respond ONLY with valid JSON, no additional text.`;

const RESPONSE_PROMPT = `You are a polite and professional campus support assistant. Generate an appropriate response for the student.

### CONTEXT:
Ticket ID: {ticketId}
Student Name: {studentName}
Original Grievance: "{originalText}"
Category: {category}
Department: {department}
Urgency: {urgency}
Response Type: {responseType}

### GUIDELINES:
1. Be empathetic and professional
2. Use student's name
3. Reference the specific issue
4. Provide clear next steps or timeline
5. Include ticket ID for reference
6. Keep response under 150 words

### OUTPUT FORMAT (JSON only):
{
  "subject": "string",
  "greeting": "string",
  "body": "string",
  "nextSteps": "string",
  "closing": "string",
  "fullMessage": "string"
}

Respond ONLY with valid JSON.`;

export async function classifyGrievance(
    grievanceText: string,
    location: string = '',
    timestamp: string = new Date().toISOString()
): Promise<GrievanceClassification> {
    try {
        const prompt = CLASSIFICATION_PROMPT
            .replace('{grievanceText}', grievanceText)
            .replace('{location}', location)
            .replace('{timestamp}', timestamp);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Failed to parse AI response');
    } catch (error) {
        console.error('Classification error:', error);
        // Return default classification on error
        return {
            category: 'general',
            subCategory: 'other',
            department: 'admin',
            urgency: 'medium',
            urgencyScore: 0.5,
            summary: grievanceText.substring(0, 100),
            suggestedAction: 'Manual review required',
            keywords: [],
            sentiment: 'neutral',
            confidence: 0.3,
            requiresImmediate: false
        };
    }
}

export async function generateStudentResponse(
    ticketId: string,
    studentName: string,
    originalText: string,
    category: string,
    department: string,
    urgency: string,
    responseType: 'acknowledgement' | 'status_update' | 'resolution' = 'acknowledgement'
): Promise<StudentResponse> {
    try {
        const prompt = RESPONSE_PROMPT
            .replace('{ticketId}', ticketId)
            .replace('{studentName}', studentName)
            .replace('{originalText}', originalText)
            .replace('{category}', category)
            .replace('{department}', department)
            .replace('{urgency}', urgency)
            .replace('{responseType}', responseType);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Failed to parse AI response');
    } catch (error) {
        console.error('Response generation error:', error);
        return {
            subject: `Grievance ${responseType === 'acknowledgement' ? 'Received' : 'Update'} [${ticketId}]`,
            greeting: `Dear ${studentName},`,
            body: `Thank you for submitting your grievance. We have received it and will process it shortly.`,
            nextSteps: 'You will receive updates on your registered email.',
            closing: 'Best regards,\nCampus Support Team',
            fullMessage: `Dear ${studentName},\n\nThank you for submitting your grievance. We have received it and will process it shortly.\n\nYou will receive updates on your registered email.\n\nBest regards,\nCampus Support Team`
        };
    }
}
