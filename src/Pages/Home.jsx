import EventCategories from './Landing/Components/EventCategories'
import EventContainer from './Landing/Components/EventContainer'
import HeroSection from './Landing/Components/HeroSection'
import TopEvents from './Landing/Components/TopEvents'
import { useAuth } from '@/context/AuthContext' // Use alias
import RecommendationSection from '@/components/ai/RecommendationSection' // Use alias

const Home = () => {
  const { user } = useAuth()

  return (
    <div>
      <HeroSection/>
      <EventCategories/>
      
      {/* Add AI Recommendations section for logged-in users */}
      {user && <RecommendationSection />}
      
      <EventContainer/>
      <TopEvents/>
    </div>
  )
}

export default Home