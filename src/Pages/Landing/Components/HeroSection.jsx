import { useEffect, useState } from 'react';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-fit bg-gradient-to-b from-gray-50 to-gray-100 text-black pt-16">
      {/* Hero Content - Merged Layout */}
      <section className="relative min-h-[calc(55vh-4rem)] md:min-h-[calc(60vh-4rem)]">
        {/* Background Image Container */}
        <div className="absolute inset-0 w-full h-full">
          <div className="relative w-full h-full">
            <img
              src="eventAoffice.webp"
              alt="Event management and advertising team collaboration"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80";
              }}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          </div>
        </div>

        {/* Text Content Overlay */}
        <div className="container mx-auto px-4 h-full relative z-10">
          <div className="max-w-7xl mx-auto w-full h-full">
            <div className="flex items-center h-full py-8 lg:py-6">
              <div className={`max-w-2xl space-y-5 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>

                {/* Main heading */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-white">
                  <div className="text-white">We represent you a</div>
                  <span className="text-blue-500">Full Event Management</span>{" "}
                  <div>
                    <span className="text-white">Platform</span>{" "}
                  </div>
                </h1>

                {/* Blue banner for tagline */}
                <div className={`bg-blue-600 text-white px-5 py-3 inline-block transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                  <p className="text-base md:text-lg font-bold">Explore and book your events</p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;