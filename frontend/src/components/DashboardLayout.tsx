import { Outlet, useLocation, NavLink, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Helper function to determine if we're at the dashboard index
const useIsDashboardHome = () => {
    const location = useLocation();
    return location.pathname === '/dashboard';
};

// Main Dashboard Card Component for visualization options
interface VisualizationCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    to: string;
}

function VisualizationCard({ icon, title, description, to }: VisualizationCardProps) {
    return (
        <Link
            to={to}
            className="group bg-gradient-to-br from-purple-800/30 to-pink-600/30 p-6 rounded-xl border border-pink-500/20 backdrop-blur-sm hover:scale-103 hover:bg-gradient-to-br hover:from-purple-700/40 hover:to-pink-500/40 hover:shadow-xl hover:border-pink-400/30 hover:shadow-pink-500/30 transition-all duration-300 flex flex-col items-center text-center"
        >
            <div className="text-5xl mb-4 transform group-hover:scale-115 group-hover:rotate-6 transition-transform duration-500">{icon}</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-200 transition-colors duration-300">{title}</h3>
            <p className="text-gray-300 group-hover:text-white transition-colors duration-300">{description}</p>
        </Link>
    );
}

// Top Navigation Bar (only appears on non-dashboard-home pages)
function TopNavigationBar() {
    const isDashboardHome = useIsDashboardHome();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll event to change navbar appearance
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    if (isDashboardHome) return null;

    return (
        <div className={`fixed top-0 left-0 right-0 z-10 ${scrolled ? 'bg-purple-900/95' : 'bg-purple-900/80'} backdrop-blur-md shadow-lg border-b border-pink-500/20 transition-all duration-300 w-full box-border`}>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center justify-between p-4">
                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                    <NavLink to="/dashboard/engagement" className={({ isActive }) =>
                        `px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-all duration-300 ${isActive ? 'bg-pink-600/40 text-white scale-105' : 'text-gray-300 hover:text-white hover:bg-purple-700/50'} text-sm sm:text-base flex items-center gap-1.5`
                    }>
                        <span className="text-pink-500">📈</span> Engagement
                    </NavLink>
                    <NavLink to="/dashboard/time-insights" className={({ isActive }) =>
                        `px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-all duration-300 ${isActive ? 'bg-pink-600/40 text-white scale-105' : 'text-gray-300 hover:text-white hover:bg-purple-700/50'} text-sm sm:text-base flex items-center gap-1.5`
                    }>
                        <span className="text-pink-500">📊</span> Time Insights
                    </NavLink>
                    <NavLink to="/dashboard/hashtags" className={({ isActive }) =>
                        `px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-all duration-300 ${isActive ? 'bg-pink-600/40 text-white scale-105' : 'text-gray-300 hover:text-white hover:bg-purple-700/50'} text-sm sm:text-base flex items-center gap-1.5`
                    }>
                        <span className="text-pink-500">#</span> Hashtags
                    </NavLink>
                    <NavLink to="/dashboard/model-distribution" className={({ isActive }) =>
                        `px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-all duration-300 ${isActive ? 'bg-pink-600/40 text-white scale-105' : 'text-gray-300 hover:text-white hover:bg-purple-700/50'} text-sm sm:text-base flex items-center gap-1.5`
                    }>
                        <span className="text-pink-500">📱</span> Recommendations
                    </NavLink>
                    <NavLink to="/dashboard/top-posts" className={({ isActive }) =>
                        `px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-all duration-300 ${isActive ? 'bg-pink-600/40 text-white scale-105' : 'text-gray-300 hover:text-white hover:bg-purple-700/50'} text-sm sm:text-base flex items-center gap-1.5`
                    }>
                        <span className="text-pink-500">🔝</span> Top Posts
                    </NavLink>
                    <NavLink to="/dashboard/posting-time" className={({ isActive }) =>
                        `px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-all duration-300 ${isActive ? 'bg-pink-600/40 text-white scale-105' : 'text-gray-300 hover:text-white hover:bg-purple-700/50'} text-sm sm:text-base flex items-center gap-1.5`
                    }>
                        <span className="text-pink-500">⏰</span> Posting Time
                    </NavLink>
                </div>

                <Link
                    to="/dashboard"
                    className="group flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-pink-500/80 to-purple-600/80 hover:from-pink-400 hover:to-purple-500 hover:shadow-lg hover:shadow-pink-500/30 hover:translate-y-[-2px] rounded-lg text-white transition-all duration-300 text-sm sm:text-base whitespace-nowrap border border-pink-400/30"
                >
                    <span className="transform transition-transform duration-300 group-hover:translate-x-[-4px]">←</span> 
                    <span className="hidden sm:inline">Back to</span> Dashboard
                </Link>
            </div>

            {/* Mobile Nav */}
            <div className="flex md:hidden justify-between items-center p-3">
                <Link to="/dashboard" className="text-white font-medium">
                    <span className="bg-gradient-to-r from-pink-400 to-purple-500 text-transparent bg-clip-text">IG</span> Analytics
                </Link>
                
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-md bg-purple-800/40 text-white hover:bg-purple-700/60 transition-all"
                >
                    {mobileMenuOpen ? 
                        <span className="text-xl">×</span> : 
                        <span className="flex flex-col gap-1">
                            <span className="w-5 h-0.5 bg-current"></span>
                            <span className="w-5 h-0.5 bg-current"></span>
                            <span className="w-5 h-0.5 bg-current"></span>
                        </span>
                    }
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-96 opacity-100 border-t border-pink-500/20' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col space-y-1 p-3">
                    <NavLink to="/dashboard" 
                        className="px-3 py-2 rounded-md transition-all duration-200 bg-gradient-to-r from-pink-500/70 to-purple-600/70 text-white hover:from-pink-400 hover:to-purple-500 flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="text-white">🏠</span> Dashboard Home
                    </NavLink>
                    <NavLink to="/dashboard/engagement" 
                        className={({ isActive }) => 
                            `px-3 py-2 rounded-md transition-all duration-200 ${isActive ? 'bg-pink-600/40 text-white' : 'text-gray-300 hover:bg-purple-700/50 hover:text-white'} flex items-center gap-2`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="text-pink-500">📈</span> Engagement
                    </NavLink>
                    <NavLink to="/dashboard/time-insights"
                        className={({ isActive }) => 
                            `px-3 py-2 rounded-md transition-all duration-200 ${isActive ? 'bg-pink-600/40 text-white' : 'text-gray-300 hover:bg-purple-700/50 hover:text-white'} flex items-center gap-2`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="text-pink-500">📊</span> Time Insights
                    </NavLink>
                    <NavLink to="/dashboard/hashtags"
                        className={({ isActive }) => 
                            `px-3 py-2 rounded-md transition-all duration-200 ${isActive ? 'bg-pink-600/40 text-white' : 'text-gray-300 hover:bg-purple-700/50 hover:text-white'} flex items-center gap-2`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="text-pink-500">#</span> Hashtags
                    </NavLink>
                    <NavLink to="/dashboard/model-distribution"
                        className={({ isActive }) => 
                            `px-3 py-2 rounded-md transition-all duration-200 ${isActive ? 'bg-pink-600/40 text-white' : 'text-gray-300 hover:bg-purple-700/50 hover:text-white'} flex items-center gap-2`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="text-pink-500">📱</span> Recommendations
                    </NavLink>
                    <NavLink to="/dashboard/top-posts"
                        className={({ isActive }) => 
                            `px-3 py-2 rounded-md transition-all duration-200 ${isActive ? 'bg-pink-600/40 text-white' : 'text-gray-300 hover:bg-purple-700/50 hover:text-white'} flex items-center gap-2`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="text-pink-500">🔝</span> Top Posts
                    </NavLink>
                    <NavLink to="/dashboard/posting-time"
                        className={({ isActive }) => 
                            `px-3 py-2 rounded-md transition-all duration-200 ${isActive ? 'bg-pink-600/40 text-white' : 'text-gray-300 hover:bg-purple-700/50 hover:text-white'} flex items-center gap-2`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="text-pink-500">⏰</span> Posting Time
                    </NavLink>
                </div>
            </div>
        </div>
    );
}

function DashboardLayout() {
    const isDashboardHome = useIsDashboardHome();

    return (
        <div className="min-h-screen">
            <TopNavigationBar />
            
            <div className={`w-full ${!isDashboardHome ? 'pt-16 sm:pt-20' : ''}`}>
                <div className="p-4 sm:p-6 md:p-10 box-border">
                    {isDashboardHome ? (
                        <div className="mx-auto">
                            <div className="grid grid-cols-12 gap-4 items-center mb-6">
                                <div className="col-span-3 sm:col-span-2 flex justify-start">
                                    <Link 
                                        to="/" 
                                        className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/80 to-purple-600/80 hover:from-pink-400 hover:to-purple-500 rounded-lg text-white transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/30 hover:translate-y-[-3px] border border-pink-400/30"
                                    >
                                        <span className="text-lg transform transition-transform duration-300 group-hover:translate-x-[-4px]">←</span> 
                                        <span>Back to Home</span>
                                    </Link>
                                </div>
                                
                                <div className="col-span-9 sm:col-span-10 bg-gradient-to-br from-purple-900/70 to-pink-700/70 py-6 px-4 rounded-xl backdrop-blur-sm border border-pink-500/30 shadow-lg hover:shadow-2xl hover:shadow-pink-500/30 hover:from-purple-800/80 hover:to-pink-600/80 hover:border-pink-400/40 transition-all duration-500">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wider text-center group-hover:scale-102">
                                        <span className="bg-gradient-to-r from-pink-400 to-purple-500 text-transparent bg-clip-text hover:from-pink-300 hover:to-purple-400 transition-all duration-500">INSTAGRAM</span> ANALYSIS DASHBOARD
                                    </h1>
                                </div>
                            </div>
                            
                            <p className="text-base sm:text-lg text-gray-200 max-w-3xl mx-auto mb-10 text-center hover:text-pink-100 transition-colors duration-300">
                                Select a visualization option below to explore your Instagram analytics and performance metrics.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
                                <VisualizationCard
                                    icon="📈"
                                    title="Engagement Analysis"
                                    description="Track your engagement trends over time with detailed metrics and insights"
                                    to="/dashboard/engagement"
                                />
                                <VisualizationCard
                                    icon="🔍"
                                    title="Hashtag Insights"
                                    description="Discover your most effective hashtags and their performance impact"
                                    to="/dashboard/hashtags"
                                />
                                <VisualizationCard
                                    icon="⏰"
                                    title="Posting Strategy"
                                    description="Optimize your posting schedule based on audience activity patterns"
                                    to="/dashboard/posting-time"
                                />
                                <VisualizationCard
                                    icon="📊"
                                    title="Time-Based Insights"
                                    description="Analyze how your content performs across different time periods"
                                    to="/dashboard/time-insights"
                                />
                                <VisualizationCard
                                    icon="📱"
                                    title="Recommendations"
                                    description="See recommendations to target the likes and comments count on the post types"
                                    to="/dashboard/recommend"
                                />
                                <VisualizationCard
                                    icon="🔝"
                                    title="Top Performing Posts"
                                    description="Identify your highest reaching and most engaging content"
                                    to="/dashboard/top-posts"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="backdrop-blur-sm bg-purple-900/20 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-pink-500/20 mx-auto box-border transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/40 hover:bg-purple-800/30 hover:border-pink-400/30">
                            <Outlet />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout;