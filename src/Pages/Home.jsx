import EventCategories from './Landing/Components/EventCategories'
import EventContainer from './Landing/Components/EventContainer'
import HeroSection from './Landing/Components/HeroSection'
import TopEvents from './Landing/Components/TopEvents'
const Home = () => {
  return (
    <div>
      <HeroSection/>
      <EventCategories/>
      <EventContainer/>
      <TopEvents/>
    </div>
  )
}

export default Home
