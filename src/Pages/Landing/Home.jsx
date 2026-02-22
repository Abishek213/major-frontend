// src/Pages/Home.jsx
import EventCategories from './HomeComponents/EventCategories'
import EventContainer from './HomeComponents/EventContainer'
import HeroSection from './HomeComponents/HeroSection'
import TopEvents from './HomeComponents/TopEvents'
import { useAuth } from '@/context/AuthContext'
import RecommendationSection from "@/components/ai/user/RecommendationSection";

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