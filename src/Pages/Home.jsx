// src/Pages/Home.jsx
import EventCategories from './Landing/Components/EventCategories'
import EventContainer from './Landing/Components/EventContainer'
import HeroSection from './Landing/Components/HeroSection'
import TopEvents from './Landing/Components/TopEvents'
import { useAuth } from '@/context/AuthContext'
import { RecommendationSection } from '@/components/ai' // Fixed: Import from the main ai index file

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <HeroSection />
      <EventCategories />
      
      {/* Add AI Recommendations section for logged-in users */}
      {user && <RecommendationSection />}
      
      <EventContainer />
      <TopEvents />
    </div>
  )
}

export default Home