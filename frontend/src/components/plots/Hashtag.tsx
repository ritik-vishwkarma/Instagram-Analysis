import { useState, useEffect } from "react";
import { fetchHashtagData, HashtagCount } from "@/db";

const HashtagWordCloud = () => {
  const [hashtagData, setHashtagData] = useState<HashtagCount[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
/*************  ✨ Windsurf Command ⭐  *************/
    /**
     * Fetches the top 10 hashtags from the database and updates the local state
     * to display the hashtag cloud.
     * @returns {Promise<void>}
     */
/*******  241fc5c8-7caa-4b2a-890c-15e28dc20041  *******/    const loadHashtagData = async () => {
      try {
        setLoading(true);
        setError(null);
        const hashtagCounts = await fetchHashtagData(10);
        setHashtagData(hashtagCounts.slice(0, 10));
      } catch (err) {
        console.error("Error fetching hashtag data:", err);
        setError("Failed to load hashtag data.");
      } finally {
        setLoading(false);
      }
    };

    loadHashtagData();
  }, []);

  return (
    <div className="w-full p-5">
      {/* Centered title - slightly reduced */}
      <div className="flex justify-center mb-6">
        <div className="relative inline-block">
          <h1 className="text-2xl font-bold text-center text-white relative z-10 px-8 py-2.5">
            Instagram Hashtag Cloud
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-600/30 rounded-lg backdrop-blur-sm border border-white/10 shadow-xl transform -rotate-1 z-0"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg transform rotate-1 z-0"></div>
        </div>
      </div>

      {/* Loading state - slightly reduced */}
      {loading && (
        <div className="text-center py-3">
          <div className="inline-block h-6 w-6 border-2 border-t-blue-500 border-blue-200/20 rounded-full animate-spin"></div>
          <p className="mt-1 text-blue-300 text-xs">Loading hashtags...</p>
        </div>
      )}

      {/* Error state - unchanged */}
      {error && (
        <div className="bg-red-900/50 py-2 px-3 rounded mb-3 text-center max-w-md mx-auto">
          <p className="text-red-200 text-xs">{error}</p>
          <button
            className="mt-1 px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-white text-xs"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Tag Cloud View - height reduction */}
      {!loading && !error && hashtagData.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-950 backdrop-blur-md rounded-lg border border-white/10 shadow-md p-4 pb-5">
            <div className="h-[280px] flex items-center justify-center">
              <div className="flex flex-wrap justify-center items-center gap-3 p-4 max-w-xl">
                {hashtagData.map((tag, index) => {
                  const maxCount = Math.max(...hashtagData.map(t => t.count));
                  const minCount = Math.min(...hashtagData.map(t => t.count));
                  const range = maxCount - minCount || 1;
                  const sizeFactor = 0.8 + ((tag.count - minCount) / range);
                  const fontSize = `${Math.max(0.9, Math.min(1.8, sizeFactor * 1.3))}rem`;

                  let textColor;
                  if (index === 0) textColor = 'text-yellow-400';
                  else if (index === 1) textColor = 'text-blue-300';
                  else if (index === 2) textColor = 'text-pink-400';
                  else if (index < 6) textColor = 'text-purple-300';
                  else textColor = 'text-blue-200/70';

                  const fontWeight = index < 3 ? 'font-bold' : 'font-medium';

                  return (
                    <div
                      key={tag.hashtag}
                      className={`relative transition-all duration-300 hover:scale-110 cursor-pointer ${textColor} ${fontWeight} px-2 hover:drop-shadow-glow`}
                      style={{ fontSize }}
                      onMouseEnter={() => setHovered(tag.hashtag)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {tag.hashtag}
                      {hovered === tag.hashtag && (
                        <div className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800/90 border border-white/10 rounded px-2 py-1 shadow-md whitespace-nowrap">
                          <div className="text-xs">{tag.count} posts</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No hashtags found message - slightly reduced */}
      {!loading && !error && hashtagData.length === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/5 mx-auto max-w-sm text-center">
          <svg className="w-7 h-7 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <h2 className="text-lg font-bold text-white mt-2">No Hashtags Found</h2>
          <p className="text-blue-200/70 text-xs">
            No hashtags found in the analyzed posts.
          </p>
        </div>
      )}
    </div>
  );
};

export default HashtagWordCloud;