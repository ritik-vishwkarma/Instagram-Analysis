import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCollectionName } from '../../db/index.ts';
import { ClockCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface PeakTime {
    cluster: number;
    peak_hours: string;
}

interface PostingTimeResponse {
    status: string;
    message: string;
    best_peak_posting_times: PeakTime[];
}

interface PostingTimeAnalyzerProps {
    apiUrl?: string;
}

const PostingTimeAnalyzer: React.FC<PostingTimeAnalyzerProps> = () => {
    const [loading, setLoading] = useState<boolean>(true); // Start with loading true
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<PeakTime[] | null>(null);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);

    // Fetch data automatically when component mounts
    useEffect(() => {
        analyzePostingTime();
    }, []);

    // Function to get peak posting times
    const analyzePostingTime = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get collection name directly from DB
            const collectionName = getCollectionName();

            // Make sure we have a valid collection name
            if (!collectionName || collectionName === 'Nothing to worry about!') {
                setError('No collection selected. Please analyze an Instagram profile first.');
                setLoading(false);
                return;
            }

            // Format the collection name correctly for the API
            const requestPayload = {
                collection_name: collectionName
            };

            // Fetch posting time data from the endpoint
            const response = await axios.post<PostingTimeResponse>(
                'http://localhost:8000/posting_time',
                requestPayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000 // 60 second timeout
                }
            );

            // Process response data
            if (response.data && response.data.best_peak_posting_times) {
                setResults(response.data.best_peak_posting_times);
                setResponseMessage(response.data.message);

                // Small delay to ensure smooth transition
                setTimeout(() => {
                    setLoading(false);
                    setShowResults(true);
                }, 300);
            } else {
                throw new Error('Invalid response format');
            }

        } catch (err) {
            console.error('Failed to analyze posting times:', err);

            // Enhanced error handling to show more useful messages
            if (axios.isAxiosError(err)) {
                const statusCode = err.response?.status;
                const responseData = err.response?.data;

                if (err.code === 'ECONNABORTED') {
                    setError('Request timed out. The analysis is taking longer than expected.');
                } else if (statusCode === 422) {
                    setError(`API validation error: ${JSON.stringify(responseData)}`);
                } else {
                    setError(`API error (${statusCode || 'unknown'}): ${err.message}`);
                }
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch posting time data');
            }

            setLoading(false);
        }
    };

    // Function to get a color based on the cluster number
    const getClusterColor = (cluster: number, isHovered = false): string => {
        // Regular colors
        const colors = ['#60a5fa', '#5eead4', '#fcd34d', '#f472b6', '#a78bfa'];
        // Hover colors (brighter versions)
        const hoverColors = ['#93c5fd', '#99f6e4', '#fde68a', '#fbcfe8', '#c4b5fd'];

        return isHovered ? hoverColors[cluster % hoverColors.length] : colors[cluster % colors.length];
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="flex items-center">
                    <svg className="animate-spin w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg text-gray-200">Analyzing optimal posting times...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-900/40 text-red-200 p-4 rounded-md mb-4 border border-red-800/50">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
                <button
                    onClick={analyzePostingTime}
                    className="px-3 py-1.5 mt-3 rounded text-sm bg-red-700 hover:bg-red-600 text-white transition-colors flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Try Again
                </button>
            </div>
        );
    }

    // Results view with animation
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full bg-gray-950 rounded-lg border border-gray-800 p-6 mb-6 shadow-lg"
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                            style={{ backgroundColor: 'rgba(96, 165, 250, 0.2)' }}
                        >
                            <ClockCircleOutlined style={{ color: '#60a5fa', fontSize: 18 }} />
                        </div>
                        <h3 className="text-white text-xl font-medium m-0">Optimal Posting Times</h3>
                    </div>
                </div>

                {responseMessage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 text-gray-300"
                    >
                        {responseMessage}
                    </motion.div>
                )}

                {results && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h4 className="text-gray-200 text-lg font-medium mb-3">Best Times to Post on Instagram:</h4>

                        <div className="mb-6">
                            <div className="grid grid-cols-3 gap-2">
                                {results.map((item, index) => {
                                    const isHovered = hoveredCluster === item.cluster;
                                    return (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.03 }}
                                            className={`flex items-center p-3 rounded-lg border transition-all ${isHovered
                                                    ? 'border-gray-700 bg-gray-800/50'
                                                    : 'border-gray-800 bg-gray-900/30'
                                                }`}
                                            onMouseEnter={() => setHoveredCluster(item.cluster)}
                                            onMouseLeave={() => setHoveredCluster(null)}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium transition-all"
                                                style={{
                                                    backgroundColor: `${getClusterColor(item.cluster, isHovered)}20`,
                                                    color: getClusterColor(item.cluster, isHovered),
                                                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                                                }}
                                            >
                                                {item.cluster + 1}
                                            </div>
                                            <div className="text-gray-300 font-medium">
                                                {item.peak_hours}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="text-gray-500 text-sm italic p-3 border-t border-gray-800 mt-3">
                            These times are based on when your audience has shown the highest engagement with your content.
                            Consider scheduling your posts around these times for optimal reach and engagement.
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default PostingTimeAnalyzer;