import { Globe } from 'lucide-react';
import { useState } from 'react';

const LanguageSelector = ({ value, onChange, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const selectedLanguage = languages.find(lang => lang.code === value) || languages[0];

  return (
    <div className="relative">
      {compact ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
        >
          <span>{selectedLanguage.flag}</span>
          <span className="hidden sm:inline">{selectedLanguage.code.toUpperCase()}</span>
          <Globe className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-300 hover:border-gray-400 rounded-lg transition-all text-sm font-medium min-w-[160px] justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedLanguage.flag}</span>
            <span>{selectedLanguage.name}</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onChange(language.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 ${value === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.name}</div>
                  <div className="text-xs text-gray-500">{language.code.toUpperCase()}</div>
                </div>
                {value === language.code && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;