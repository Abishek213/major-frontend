// src/Pages/Landing/Home.jsx
import EventCategories from "./HomeComponents/EventCategories";
import EventContainer from "./HomeComponents/EventContainer";
import HeroSection from "./HomeComponents/HeroSection";
import TopEvents from "./HomeComponents/TopEvents";
import RecommendationSection from "@/components/ai/user/RecommendationSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <HeroSection />
      <EventCategories />

      <RecommendationSection />

      <EventContainer />
      <TopEvents />
    </div>
  );
};

export default Home;
