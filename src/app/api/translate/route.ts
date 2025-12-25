import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const { text, targetLanguage, sourceLanguage = 'en' } = await request.json();

        if (!text || !targetLanguage) {
            return NextResponse.json({ error: 'Text and target language required' }, { status: 400 });
        }

        // If same language, return as-is
        if (sourceLanguage === targetLanguage) {
            return NextResponse.json({ translatedText: text });
        }

        const languageNames: Record<string, string> = {
            'en': 'English',
            'hi': 'Hindi',
            'ta': 'Tamil',
            'te': 'Telugu'
        };

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Translate the following text from ${languageNames[sourceLanguage]} to ${languageNames[targetLanguage]}. 
Only provide the translation, no explanations or additional text.

Text to translate:
${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text().trim();

        return NextResponse.json({
            success: true,
            translatedText,
            sourceLanguage,
            targetLanguage
        });

    } catch (error: any) {
        console.error('Translation error:', error);
        // Return original text on error
        return NextResponse.json({
            success: false,
            translatedText: request.body,
            error: error.message
        });
    }
}
