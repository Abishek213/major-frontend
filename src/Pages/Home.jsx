import React, { useEffect } from 'react';
import { Calendar, Users, MapPin, Trophy, Star, ArrowRight } from 'lucide-react';
import { motion } from "framer-motion";
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Event Organizer',
      content: 'eventA has transformed how I manage my events. The platform is intuitive and powerful.',
      rating: 5,
     image: '/images/man1.jpg',
    },
    {
      name: 'Michael Chen',
      role: 'Regular Attendee',
      content: "I've discovered amazing events and met wonderful people through this platform.",
      rating: 5,
       image: '/images/man2.jpg',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Community Leader',
      content: 'The best platform for creating and managing community events. Highly recommended!',
      rating: 5,
       image: '/images/woman.jpg',
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

      {/* Hero Section */}
      <div className={`relative w-full ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-primary to-blue-800'} text-white py-24`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Discover. Create. Celebrate. <br /> Events with eventA
          </h1>
          <p className={`text-lg md:text-2xl ${isDarkMode ? 'text-gray-200' : 'text-blue-100'} max-w-2xl mb-10`}>
            Your ultimate platform to host unforgettable events, connect with your audience, and build lasting memories.
          </p>
          <div className="flex flex-col md:flex-row gap-6">
            <a href='/LoginSignup'>
              <button className={`px-8 py-3 md:px-10 md:py-3.5 bg-white rounded-full font-bold transition-colors ${isDarkMode ? 'text-gray-700 hover:bg-gray-100' : 'text-primary hover:bg-blue-50'}`}>
                Get Started
              </button>
            </a>
            <a href='/about'>
              <button className="px-8 py-3 md:px-10 md:py-3.5 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition">
                Learn More
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Company Section */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} py-24`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className={`flex-1 space-y-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <h1 className="text-4xl font-bold">
              eventA has served enterprises across <span className="text-indigo-600">10+ cities</span> and over <span className="text-indigo-600">500K attendees</span>.
            </h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              The company recently secured $20 million in Series B funding from VisionNext Capital and TechSpring Ventures. The round also saw participation from InnovateX Partners.
            </p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This funding supports M&A opportunities, product development, and global expansion. eventA recorded 130% QoQ growth in Q4 2021.
            </p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              eventA offers powerful features like CRM integration, behavior analytics, and automated marketing tools to optimize event campaigns.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <img src="/images/eventAoffice.webp" alt="eventA Office" className="rounded-2xl shadow-xl w-full max-w-lg object-cover" />
          </div>
        </div>
      </div>

      {/* Motion CEO Section */}
      <div className={`flex justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-6`}>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
          <motion.div
            className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center">
              <motion.div
                className="w-20 h-20 bg-white rounded-full mb-4"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <img src="/images/ceo.png" alt="CEO" className="w-full h-full object-cover rounded-full" />
              </motion.div>
              <h2 className="text-2xl font-semibold">Abishek Bhatta</h2>
              <p className="text-base text-gray-300">CEO of eventA</p>
            </div>
          </motion.div>
          <div className={`p-10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <h1 className="text-2xl font-bold mb-4">Welcome to Our Website</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              "At eventA, we believe every event is a chance to connect, innovate, and inspire. We're building tools that transform experiences and redefine engagement. Join us in creating unforgettable moments."
            </p>
          </div>
        </div>
      </div>

      {/* Animation Tagline Section */}
      <div className={`flex h-60 items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <motion.div
          className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-green-500 text-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 6 }}
        >
          <div className="text-center">
            <motion.h1 className="text-4xl md:text-5xl font-bold mb-4" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}>
              Discover, Create and Plan
            </motion.h1>
            <motion.p className="text-xl text-gray-100" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 1 }}>
              all in one place
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Key Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-4xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Make Every Event Extraordinary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: 'Plan with Ease',
                description: 'Use our tools to create detailed event schedules and agendas effortlessly.',
                icon: <Calendar className={`w-14 h-14 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
              },
              {
                title: 'Host Seamlessly',
                description: 'From ticketing to check-ins, simplify every aspect of hosting.',
                icon: <Trophy className={`w-14 h-14 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
              },
              {
                title: 'Connect & Network',
                description: 'Engage with attendees and build lasting relationships.',
                icon: <Users className={`w-14 h-14 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} py-24`}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-4xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Hear From Our Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-900 border-gray-600 hover:border-gray-400' : 'bg-white border-gray-200 hover:border-blue-400/50'
                } hover:shadow-lg`}
              >
                <img src={testimonial.image} alt={testimonial.name} className="w-20 h-20 rounded-full object-cover mb-4" />
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${isDarkMode ? 'fill-gray-400 text-gray-400' : 'fill-blue-400 text-blue-400'}`} />
                  ))}
                </div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{testimonial.content}</p>
                <div>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</p>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={`bg-gradient-to-r ${isDarkMode ? 'from-gray-700 to-gray-800' : 'from-primary to-blue-800'} py-20`}>
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Create Your Event?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Join thousands of successful event organizers on eventA</p>
          <a href='/LoginSignup'>
            <button className="px-10 py-4 bg-white rounded-full font-semibold text-blue-600 hover:bg-white/90 transition-colors inline-flex items-center gap-2">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
