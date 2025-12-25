import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const { image, mimeType } = await request.json();

        if (!image) {
            return NextResponse.json({ error: 'Image required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an AI assistant for a campus grievance system. Analyze this image and identify any infrastructure, maintenance, or facility issues visible.

Respond in JSON format with these fields:
{
  "description": "Brief description of what you see in the image and any issues identified",
  "suggestedCategory": "One of: hostel, academic, it, canteen, transport, security, sports, other",
  "suggestedUrgency": "One of: critical, high, medium, low",
  "detectedIssues": ["List of specific issues you can identify"]
}

Focus on:
- Infrastructure damage (broken items, water damage, cracks)
- Cleanliness issues (garbage, stains, mess)
- Safety hazards (exposed wiring, slippery surfaces)
- Malfunctioning equipment (AC, lights, fans)
- General maintenance needs

If you cannot identify any specific issue, describe what you see and set urgency to "low".`;

        const imagePart = {
            inlineData: {
                data: image,
                mimeType: mimeType || 'image/jpeg'
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            return NextResponse.json({
                success: true,
                analysis
            });
        }

        // Fallback if parsing fails
        return NextResponse.json({
            success: true,
            analysis: {
                description: text,
                suggestedCategory: 'other',
                suggestedUrgency: 'medium',
                detectedIssues: ['Issue detected in image']
            }
        });

    } catch (error: any) {
        console.error('Image analysis error:', error);

        // Return fallback analysis instead of error
        return NextResponse.json({
            success: true,
            analysis: {
                description: 'Image uploaded successfully. Please describe the issue for better classification.',
                suggestedCategory: 'other',
                suggestedUrgency: 'medium',
                detectedIssues: ['Unable to analyze automatically']
            }
        });
    }
}
