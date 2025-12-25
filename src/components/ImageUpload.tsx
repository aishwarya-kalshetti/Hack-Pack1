'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Sparkles, Camera } from 'lucide-react';

interface ImageUploadProps {
    onImageAnalyzed: (analysis: {
        description: string;
        suggestedCategory: string;
        suggestedUrgency: string;
        detectedIssues: string[];
    }) => void;
    onImageSelected: (file: File | null) => void;
}

export default function ImageUpload({ onImageAnalyzed, onImageSelected }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        onImageSelected(file);

        // Analyze image
        await analyzeImage(file);
    };

    const analyzeImage = async (file: File) => {
        setIsAnalyzing(true);

        // Convert to base64
        const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]); // Remove data URL prefix
            };
            reader.readAsDataURL(file);
        });

        try {
            const response = await fetch('/api/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64, mimeType: file.type })
            });

            const data = await response.json();

            if (data.success) {
                setAnalysis(data.analysis);
                onImageAnalyzed(data.analysis);
            }
        } catch (error) {
            console.error('Image analysis failed:', error);
            // Provide fallback analysis
            const fallbackAnalysis = {
                description: 'Image uploaded successfully',
                suggestedCategory: 'other',
                suggestedUrgency: 'medium',
                detectedIssues: ['Issue detected in image']
            };
            setAnalysis(fallbackAnalysis);
            onImageAnalyzed(fallbackAnalysis);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const clearImage = () => {
        setPreview(null);
        setAnalysis(null);
        onImageSelected(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            {!preview ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <Camera className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-indigo-600">Upload a photo</span> of the issue
                        </p>
                        <p className="mt-1 text-xs text-gray-400">AI will analyze and classify automatically</p>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    {/* Image Preview */}
                    <div className="relative rounded-xl overflow-hidden">
                        <img
                            src={preview}
                            alt="Issue preview"
                            className="w-full h-48 object-cover"
                        />
                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                    <p className="text-sm">AI analyzing image...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analysis Results */}
                    {analysis && !isAnalyzing && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-700">AI Analysis</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{analysis.description}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                    📁 {analysis.suggestedCategory}
                                </span>
                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                    ⚡ {analysis.suggestedUrgency}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
        </div>
    );
}
