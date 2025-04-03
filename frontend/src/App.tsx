import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import BackgroundAnimation from './bg/Background.tsx'
import EngagementOverTime from './components/plots/EngagementOverTime.tsx'
import HashtagWordCloud from './components/plots/Hashtag.tsx'
import TimeBasedInsights from './components/plots/TimeBasedPlots.tsx'
import './App.css'
import PostingTimeAnalyzer from './components/ui/PostTime.tsx'
import InstagramAnalysisForm from './bg/Form.tsx'
import ModelPieChart from './components/plots/ModelPieChart.tsx'
import TopPerformingPosts from './components/plots/ReachBasedPerformance.tsx'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* <Link to="/dashboard">Instagram Analytics</Link> */}
        <h2>Instagram Analytics</h2>
      </div>
      <div className="navbar-menu">
        <Link to="/engagement-analysis" className="navbar-item">Instagram Engagement Analysis</Link>
        <Link to="/hashtag-analysis" className="navbar-item">Instagram Hashtag Analysis</Link>
        <Link to="/posting-time-analysis" className="navbar-item">Optimal Posting Time Analysis</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <>
      <BackgroundAnimation />
      <Router>
        <Navbar />
        <Routes>
          {/* Landing page route */}
          <Route 
            path="/" 
            element={<InstagramAnalysisForm />} 
          />
          
          {/* Main Dashboard route */}
          
          
          {/* Hashtag Analysis route */}
          <Route 
            path="/hashtag-analysis" 
            element={
              <div className="content-container">
                <HashtagWordCloud />
              </div>
            } 
          />
          
          {/* Posting Time Analysis route */}
          <Route 
            path="/posting-time-analysis" 
            element={
              <div className="content-container">
                <TimeBasedInsights />
                <PostingTimeAnalyzer />
              </div>
            } 
          />
          
          {/* Engagement Analysis route */}
          <Route 
            path="/engagement-analysis" 
            element={
              <div className="content-container">
                <EngagementOverTime />
                <TopPerformingPosts />
                <ModelPieChart />
              </div>
            } 
          />
          
          {/* Redirect any unknown routes to home */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </Router>
    </>
  )
}

export default App