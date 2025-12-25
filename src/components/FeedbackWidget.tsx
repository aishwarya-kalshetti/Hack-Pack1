'use client';

import React, { useState } from 'react';
import { Star, Send, MessageSquare, ThumbsUp, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedbackWidgetProps {
    ticketId: string;
    onSubmit: (rating: number, comment: string) => void;
    onClose?: () => void;
}

export default function FeedbackWidget({ ticketId, onSubmit, onClose }: FeedbackWidgetProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(rating, comment);
            setIsSubmitted(true);
            toast.success('Thank you for your feedback! 🎉');
        } catch (error) {
            toast.error('Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ThumbsUp className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Thank You!</h3>
                    <p className="text-green-600 text-sm">
                        Your feedback helps us improve our services
                    </p>
                    <div className="flex justify-center gap-1 mt-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">Rate Your Experience</h3>
                            <p className="text-white/70 text-sm">Ticket {ticketId}</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                {/* Rating Stars */}
                <div className="text-center mb-6">
                    <p className="text-gray-600 mb-3">How satisfied are you with the resolution?</p>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-10 h-10 transition-colors ${star <= (hoveredRating || rating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        {rating === 0 ? 'Click to rate' :
                            rating === 1 ? 'Very Dissatisfied 😞' :
                                rating === 2 ? 'Dissatisfied 😕' :
                                    rating === 3 ? 'Neutral 😐' :
                                        rating === 4 ? 'Satisfied 😊' :
                                            'Very Satisfied 🎉'}
                    </p>
                </div>

                {/* Comment */}
                <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        Additional Comments (Optional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us more about your experience..."
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                        rows={3}
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Submit Feedback
                        </>
                    )}
                </button>

                {/* Footer */}
                <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Your feedback is analyzed by AI to improve services
                </p>
            </div>
        </div>
    );
}
