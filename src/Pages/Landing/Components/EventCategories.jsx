import {
  Calendar,
  Music,
  Moon,
  Drama,
  Heart,
  Gamepad2,
  Briefcase,
  UtensilsCrossed,
  Palette,
  Dumbbell,
  GraduationCap,
  Laugh,
  Users,
  Film,
  BookOpen,
  Plane
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Icon mapping
const iconMap = {
  calendar: Calendar,
  music: Music,
  moon: Moon,
  drama: Drama,
  heart: Heart,
  gamepad: Gamepad2,
  briefcase: Briefcase,
  utensils: UtensilsCrossed,
  palette: Palette,
  dumbbell: Dumbbell,
  graduation: GraduationCap,
  laugh: Laugh,
  users: Users,
  film: Film,
  book: BookOpen,
  plane: Plane,
  default: Calendar
};

// Default categories
const defaultCategories = [
  {
    id: 1,
    name: 'NYE',
    icon: Calendar,
    isNew: true,
    slug: 'new-year-events',
    count: 125,
    description: "New Year's Eve celebrations"
  },
  {
    id: 2,
    name: 'Music',
    icon: Music,
    slug: 'music',
    count: 856,
    description: 'Concerts, festivals, and live music'
  },
  {
    id: 3,
    name: 'Nightlife',
    icon: Moon,
    slug: 'nightlife',
    count: 342,
    description: 'Bars, clubs, and late-night events'
  },
  {
    id: 4,
    name: 'Arts',
    icon: Drama,
    slug: 'performing-arts',
    count: 214,
    description: 'Theater, dance, and visual arts'
  },
  {
    id: 5,
    name: 'Dating',
    icon: Heart,
    slug: 'dating',
    count: 89,
    description: 'Dating events and meetups'
  },
  {
    id: 6,
    name: 'Hobbies',
    icon: Gamepad2,
    slug: 'hobbies',
    count: 567,
    description: 'Games, crafts, and hobbies'
  },
  {
    id: 7,
    name: 'Business',
    icon: Briefcase,
    slug: 'business',
    count: 432,
    description: 'Networking and business events'
  },
  {
    id: 8,
    name: 'Food & Drink',
    icon: UtensilsCrossed,
    slug: 'food-drink',
    count: 678,
    description: 'Food festivals and tastings'
  }
];

const EventCategories = ({
  categories: externalCategories,
  initialActiveCategory = null,
  onCategoryChange,
  maxCategories = 16,
  fetchCategories
}) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(initialActiveCategory);
  const [loading, setLoading] = useState(!externalCategories);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (externalCategories) {
          setCategories(externalCategories.slice(0, maxCategories));
        } else if (fetchCategories) {
          const data = await fetchCategories();
          setCategories(data.slice(0, maxCategories));
        } else {
          setCategories(defaultCategories.slice(0, maxCategories));
        }
      } catch {
        setError('Failed to load categories');
        setCategories(defaultCategories.slice(0, maxCategories));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [externalCategories, fetchCategories, maxCategories]);

  const handleCategoryClick = useCallback(
    (category) => {
      setActiveCategory(category.id);
      onCategoryChange?.(category);

      const url = new URL(window.location.href);
      url.searchParams.set('category', category.slug);
      window.history.pushState({}, '', url.toString());
    },
    [onCategoryChange]
  );

  const clearFilter = () => {
    setActiveCategory(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('category');
    window.history.pushState({}, '', url.toString());
  };

  const getIcon = (cat) =>
    typeof cat.icon === 'string'
      ? iconMap[cat.icon] || iconMap.default
      : cat.icon;

  if (loading) {
    return (
      <div className="py-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600">{error}</p>;
  }

  const activeData = categories.find((c) => c.id === activeCategory);

  return (
    <section className="bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Browse by Category
          </h2>
          <p className="text-gray-600 mt-2">
            Discover events tailored to your interests
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {categories.map((category) => {
            const Icon = getIcon(category);
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`group relative rounded-2xl p-4 transition-all duration-300 focus:outline-none
                  ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-105'
                      : 'bg-white hover:shadow-xl hover:-translate-y-1'
                  }`}
              >
                {/* Hover Description */}
                {category.description && (
                  <div className="absolute bottom-full mb-3 hidden group-hover:block z-20">
                    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg max-w-[200px] shadow-lg">
                      {category.description}
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`mx-auto mb-3 flex items-center justify-center w-20 h-20 rounded-2xl transition-all
                    ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                        : 'bg-gray-50 group-hover:bg-blue-50'
                    }`}
                >
                  <Icon
                    className={`w-8 h-8 transition-transform duration-300
                      ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-700 group-hover:text-blue-600'
                      } group-hover:scale-110`}
                  />
                </div>

                {/* Name */}
                <div className="text-center space-y-1">
                  <p
                    className={`text-sm font-semibold transition-colors
                      ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-900 group-hover:text-blue-600'
                      }`}
                  >
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.count} events
                  </p>
                </div>

                {/* New Badge */}
                {category.isNew && (
                  <span className="absolute top-2 left-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Category Info */}
        {activeData && (
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <activeData.icon className="w-6 h-6 text-blue-600 animate-pulse" />
              <div>
                <p className="font-semibold text-gray-900">
                  Showing events for {activeData.name}
                </p>
                <p className="text-sm text-gray-600">
                  {activeData.count} events available
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearFilter}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear filter
              </button>
              
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

EventCategories.propTypes = {
  categories: PropTypes.array,
  initialActiveCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCategoryChange: PropTypes.func,
  maxCategories: PropTypes.number,
  fetchCategories: PropTypes.func
};

export default EventCategories;
