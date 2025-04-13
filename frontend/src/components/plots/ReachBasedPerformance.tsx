import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { getCollectionName } from '@/db';

// Define your types
interface Post {
    _id: string;
    type: string;
    engagement_score: number;
    caption?: string;
    timestamp?: string;
    media_url?: string;
    likesCount?: number;
    commentsCount?: number;
}

const TopPerformingPosts: React.FC = () => {
    const [topPosts, setTopPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Start with loading true
    const [error, setError] = useState<string | null>(null);
    const [hoveredPost, setHoveredPost] = useState<string | null>(null);
    const [collectionName, setCollectionName] = useState<string | null>(null);

    // Get collection name and fetch data on component mount
    useEffect(() => {
        const name = getCollectionName();
        setCollectionName(name);
        fetchTopPosts();
    }, []);

    const fetchTopPosts = async () => {
        setLoading(true);
        setError(null);

        try {
            const currentCollection = collectionName || getCollectionName();

            if (!currentCollection || currentCollection === 'Nothing to worry about!') {
                setError('No collection selected. Please analyze an Instagram profile first.');
                setLoading(false);
                return;
            }

            const requestPayload = {
                collection_name: currentCollection
            };

            const response = await axios.post(
                'http://127.0.0.1:8000/top5_posts',
                requestPayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status === 'success') {
                // Use all top 5 posts from the API response
                setTopPosts(response.data.top_posts);
                setLoading(false);
            } else {
                setError('Failed to fetch top posts');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Error fetching top posts:', err);

            if (axios.isAxiosError(err)) {
                const statusCode = err.response?.status;
                const responseData = err.response?.data;

                if (statusCode === 422) {
                    setError(`API validation error: ${JSON.stringify(responseData)}`);
                } else {
                    setError(`API error (${statusCode || 'unknown'}): ${err.message}`);
                }
            } else {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching top posts');
            }
            setLoading(false);
        }
    };

    // Format date to be more readable
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Truncate caption if it's too long
    const truncateCaption = (caption?: string, maxLength = 60) => {
        if (!caption) return '';
        return caption.length > maxLength ? caption.substring(0, maxLength) + '...' : caption;
    };

    // Function to format large numbers
    const formatLargeNumber = (num?: number): string => {
        if (!num) return 'N/A';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Get color based on engagement score
    const getScoreColor = (score: number) => {
        if (score >= 0.75) return 'from-green-500 to-emerald-600';
        if (score >= 0.5) return 'from-blue-500 to-cyan-600';
        if (score >= 0.25) return 'from-yellow-500 to-amber-600';
        return 'from-red-500 to-rose-600';
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center p-6">
                <div className="flex items-center">
                    <svg className="animate-spin w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-200">Analyzing top performing posts...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-900/40 text-red-200 p-3 rounded-md border border-red-800/50">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
                <button
                    onClick={fetchTopPosts}
                    className="px-3 py-1.5 mt-2 rounded text-sm bg-red-700 hover:bg-red-600 text-white transition-colors flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Try Again
                </button>
            </div>
        );
    }

    // No collection selected state
    if (!collectionName || collectionName === 'Nothing to worry about!') {
        return (
            <div className="bg-gray-900/40 text-gray-300 p-3 rounded-md border border-gray-800/50">
                <p className="font-medium">No Collection Selected</p>
                <p className="text-sm">Please analyze an Instagram profile first to see top performing posts.</p>
            </div>
        );
    }

    // Empty posts check
    if (topPosts.length === 0) {
        return (
            <div className="bg-gray-900/40 text-gray-300 p-3 rounded-md border border-gray-800/50">
                <p className="font-medium">No Top Posts Found</p>
                <p className="text-sm">Your collection may be empty or the performance models may need more data.</p>
                <button
                    onClick={fetchTopPosts}
                    className="px-3 py-1 mt-2 rounded text-sm bg-blue-700 hover:bg-blue-600 text-white transition-colors flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Try Again
                </button>
            </div>
        );
    }

    // Main content view with posts
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full relative"
            >
                <div className="bg-gray-950 rounded-lg shadow-md p-3 border border-gray-800 w-full">
                    {/* Compact header with title only */}
                    <div className="mb-2 pb-2 border-b border-gray-800/70">
                        <h2 className="text-base font-semibold text-white">Top Performing Posts</h2>
                        <p className="text-xs text-gray-400">Posts with highest engagement</p>
                    </div>

                    {/* Compact posts list */}
                    <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                        {topPosts.map((post, index) => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className={`relative overflow-hidden rounded border ${index === 0 ? 'border-blue-700/50' : 'border-gray-800/70'
                                    } bg-gray-900/50 backdrop-blur-sm w-full`}
                                onMouseEnter={() => setHoveredPost(post._id)}
                                onMouseLeave={() => setHoveredPost(null)}
                            >
                                {/* Glow effect when hovered */}
                                <AnimatePresence>
                                    {hoveredPost === post._id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.15 }}
                                            exit={{ opacity: 0 }}
                                            className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(post.engagement_score)} blur-lg -z-10`}
                                        ></motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="p-2">
                                    {/* Header row with TOP badge separated from type/date */}
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {index === 0 && (
                                                <span className="inline-block px-1.5 py-0.5 bg-blue-900/30 text-blue-300 text-xs font-medium rounded border border-blue-800/50">
                                                    TOP
                                                </span>
                                            )}
                                            {/* Moved type and date to a separate container */}
                                            {index !== 0 && (
                                                <>
                                                    <span className="px-1.5 py-0.5 rounded text-xs bg-gray-800/80 text-white border border-gray-700/50">
                                                        {post.type}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(post.timestamp)}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* For top post, show type and date on right side */}
                                            {index === 0 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 rounded text-xs bg-gray-800/80 text-white border border-gray-700/50">
                                                        {post.type}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(post.timestamp)}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-xs font-medium text-white px-1.5 py-0.5 rounded bg-gray-800/70 whitespace-nowrap">
                                                {(post.engagement_score * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Caption - minimal */}
                                    {post.caption && (
                                        <p className="text-gray-300 italic text-xs line-clamp-1">
                                            "{truncateCaption(post.caption)}"
                                        </p>
                                    )}

                                    {/* Stats in a compact row */}
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                        <div className="flex gap-3 text-xs">
                                            <span className="text-gray-400">👍 <span className="font-medium text-white">{formatLargeNumber(post.likesCount)}</span></span>
                                            <span className="text-gray-400">💬 <span className="font-medium text-white">{formatLargeNumber(post.commentsCount)}</span></span>
                                        </div>

                                        {/* Progress bar - smaller */}
                                        <div className="w-1/4">
                                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${post.engagement_score * 100}%` }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                    className={`h-full bg-gradient-to-r ${getScoreColor(post.engagement_score)}`}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TopPerformingPosts;