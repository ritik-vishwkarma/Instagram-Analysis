import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import BackgroundAnimation from './bg/Background.tsx'
import EngagementOverTime from './components/plots/EngagementOverTime.tsx'
import HashtagWordCloud from './components/plots/Hashtag.tsx'
import TimeBasedInsights from './components/plots/TimeBasedPlots.tsx'
// import './App.css'
import PostingTimeAnalyzer from './components/plots/PostTime.tsx'
import InstagramAnalysisForm from './bg/Form.tsx'
import ModelPieChart from './components/plots/ModelPieChart.tsx'
import TopPerformingPosts from './components/plots/ReachBasedPerformance.tsx'
import DashboardLayout from './components/DashboardLayout.tsx'

function App() {
  return (
    <>
      <BackgroundAnimation />
      <Router>
        <Routes>
          {/* Landing page route */}
          <Route path="/" element={<InstagramAnalysisForm />} />

          {/* Dashboard routes with layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Dashboard index */}
            <Route
              index
              element={
                <div className="text-center">
                  {/* Improved heading with solid background */}
                  <div className="relative mb-12">
                    <div className="absolute inset-0 bg-black rounded-xl -z-10"></div>
                    <div className="relative z-10 py-8">
                      <div className="inline-block relative px-6 py-4 mb-3">
                        {/* Background for the entire heading */}
                        <div className="absolute inset-0 bg-gray-950 rounded-xl -z-10"></div>

                        

                        {/* <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                          <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">INSTAGRAM</span>
                          <span className="relative mx-2 md:mx-4 inline-block px-3 md:px-4">
                            <span className="relative z-10 bg-gradient-to-br from-pink-400 to-purple-500 text-transparent bg-clip-text">ANALYSIS</span>
                            <span className="absolute inset-0 bg-gradient-to-br from-pink-500/40 to-purple-600/40 rounded-lg blur-sm"></span>
                          </span>
                          <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">DASHBOARD</span>
                        </h1> */}
                      </div>
                      <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-pink-500 to-transparent mt-4"></div>
                    </div>
                  </div>

                  <p className="text-gray-100 text-xl max-w-3xl mx-auto mb-12">
                    Select a visualization from the options below to explore your Instagram analytics.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                    {/* Feature cards */}
                    {[
                      { title: "Engagement Analysis", icon: "📈", desc: "Track engagement trends over time", to: "/dashboard/engagement" },
                      { title: "Hashtag Insights", icon: "🔍", desc: "Discover your most effective hashtags", to: "/dashboard/hashtags" },
                      { title: "Posting Strategy", icon: "⏰", desc: "Optimize your posting schedule", to: "/dashboard/posting-time" },
                      { title: "Time-Based Insights", icon: "📊", desc: "Analyze content performance over time", to: "/dashboard/time-insights" },
                      { title: "Model Distribution", icon: "📱", desc: "See device models viewing your content", to: "/dashboard/model-distribution" },
                      { title: "Top Performing Posts", icon: "🔝", desc: "Identify your highest engagement content", to: "/dashboard/top-posts" },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="group relative bg-gradient-to-br from-purple-800/30 to-pink-600/30 p-6 rounded-lg border border-pink-500/20 backdrop-blur-sm transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-pink-500/20"
                        onClick={() => window.location.href = feature.to}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                        <div className="text-4xl mb-3 transform group-hover:scale-110 group-hover:text-pink-300 transition-all duration-300">{feature.icon}</div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors duration-300">{feature.title}</h3>
                        <p className="text-gray-200 group-hover:text-white transition-colors duration-300">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />

            {/* Individual visualization routes */}
            <Route path="engagement" element={<EngagementOverTime />} />
            <Route path="time-insights" element={<TimeBasedInsights />} />
            <Route path="hashtags" element={<HashtagWordCloud />} />
            <Route path="model-distribution" element={<ModelPieChart />} />
            <Route path="top-posts" element={<TopPerformingPosts />} />
            <Route path="posting-time" element={<PostingTimeAnalyzer />} />
          </Route>

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App