import React, { useState } from 'react';

const ChatBox = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const presetQuestions = [
    'What are your business hours?',
    'How can I contact support?',
    'What services do you offer?',
    'Where can I find your pricing?',
  ];

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (inputValue.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputValue, sender: 'user' },
      ]);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `You asked: "${inputValue}"`, sender: 'bot' },
      ]);
      setInputValue('');
    }
  };

  const handlePresetQuestion = (question) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: question, sender: 'user' },
    ]);
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: `You asked: "${question}"`, sender: 'bot' },
    ]);
  };

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  return (
    <div className={`fixed bottom-4 right-4 w-80 rounded-lg border overflow-hidden ${isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300 shadow-lg'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-bold ${isDarkTheme ? 'text-blue-300' : 'text-blue-800'}`}>Chat Support</h2>
          {/* Chatbot Icon */}
          <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 5.58 2 10c0 2.54 1.08 4.84 2.82 6.46A10.015 10.015 0 002 22c1.3 0 2.51-.26 3.63-.73A9.973 9.973 0 0012 22c5.52 0 10-3.58 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>

          <button 
            onClick={toggleTheme}
            className={`absolute top-2 right-2 text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div className="overflow-y-auto h-60 mb-2">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-2 py-1 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`flex-grow border ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'} rounded-l-lg p-2 focus:outline-none focus:ring-2 ${isDarkTheme ? 'focus:ring-blue-500' : 'focus:ring-blue-400'}`}
            placeholder="Type your message..."
          />
          <button type="submit" className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 transition">
            Send
          </button>
        </form>
        <div className="mt-4">
          <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-gray-300' : 'text-black'}`}>Quick Questions:</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {presetQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handlePresetQuestion(question)}
                className={`bg-gray-200 hover:bg-gray-300 text-black px-2 py-1 rounded-md transition ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600 text-white' : ''}`}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
