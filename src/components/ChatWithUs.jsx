import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  Send, 
  X, 
  Minimize2,
  Maximize2,
  HelpCircle,
  ShoppingBag,
  Truck,
  CreditCard,
  Shield
} from 'lucide-react';

function ChatWithUs() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'bot',
      message: 'Hello! Welcome to Lmart Customer Support. How can I assist you today?',
      time: '10:00 AM'
    },
    {
      id: 2,
      sender: 'bot',
      message: 'You can ask about orders, shipping, returns, or any other queries.',
      time: '10:01 AM'
    }
  ]);
  const [quickQuestions, setQuickQuestions] = useState([
    'Track my order',
    'Return policy',
    'Shipping charges',
    'Payment options',
    'Product availability',
    'Cancel order'
  ]);
  
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [showUserForm, setShowUserForm] = useState(true);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;

    // Add user message
    const newUserMessage = {
      id: chatHistory.length + 1,
      sender: 'user',
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory([...chatHistory, newUserMessage]);
    setMessage('');

    // Simulate bot response after 1 second
    setTimeout(() => {
      const botResponses = [
        "Thanks for your query. Our support team will get back to you shortly.",
        "I understand. Let me connect you with a live agent.",
        "For order-related queries, please provide your order ID.",
        "Our customer service team is available from 9 AM to 9 PM, 7 days a week.",
        "You can track your order from 'My Orders' section in your account."
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        id: chatHistory.length + 2,
        sender: 'bot',
        message: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuickQuestion = (question) => {
    setMessage(question);
    // Auto-send after setting the message
    setTimeout(() => {
      const formEvent = new Event('submit', { cancelable: true });
      document.querySelector('form')?.dispatchEvent(formEvent);
    }, 100);
  };

  const handleUserInfoSubmit = (e) => {
    e.preventDefault();
    setShowUserForm(false);
    // Save to localStorage or send to backend in real implementation
    localStorage.setItem('lmart_chat_user', JSON.stringify(userInfo));
  };

  const contactMethods = [
    {
      icon: <Phone size={20} />,
      title: 'Call Us',
      detail: '+91-87629 78777',
      subtitle: '24x7 Toll-Free Support',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: <Mail size={20} />,
      title: 'Email Us',
      detail: 'info@lmart.com',
      subtitle: 'Response within 2 hours',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: <Clock size={20} />,
      title: 'Support Hours',
      detail: '9 AM - 9 PM',
      subtitle: '7 days a week',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const supportTopics = [
    {
      icon: <ShoppingBag size={18} />,
      title: 'Order Support',
      issues: ['Track Order', 'Cancel Order', 'Modify Order']
    },
    {
      icon: <Truck size={18} />,
      title: 'Shipping',
      issues: ['Delivery Time', 'Shipping Charges', 'Track Package']
    },
    {
      icon: <CreditCard size={18} />,
      title: 'Payment',
      issues: ['Refund Status', 'Payment Failed', 'COD Available']
    },
    {
      icon: <Shield size={18} />,
      title: 'Returns',
      issues: ['Return Policy', 'Exchange Request', 'Refund Process']
    }
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 group"
        aria-label="Open chat"
      >
        <MessageCircle size={28} />
        <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-xs rounded-full animate-pulse">
          1
        </span>
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className={`fixed z-50 ${isMinimized ? 'bottom-20 right-6' : 'bottom-24 right-6 md:right-8'} transition-all duration-300`}>
          <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${isMinimized ? 'w-72' : 'w-full md:w-96'}`}>
            
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Lmart Support</h3>
                    <p className="text-blue-100 text-sm">We're online • Usually replies instantly</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label={isMinimized ? "Maximize" : "Minimize"}
                  >
                    {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                  </button>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close chat"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* User Information Form */}
                {showUserForm && (
                  <div className="p-4 bg-yellow-50 border-b">
                    <div className="flex items-center mb-3">
                      <User size={18} className="text-yellow-600 mr-2" />
                      <h4 className="font-semibold text-gray-800">Tell us about yourself</h4>
                    </div>
                    <form onSubmit={handleUserInfoSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={userInfo.phone}
                          onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                      >
                        Start Chat
                      </button>
                    </form>
                  </div>
                )}

                {/* Chat Messages */}
                <div 
                  ref={chatContainerRef}
                  className="h-80 overflow-y-auto p-4 bg-gray-50"
                >
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`inline-block max-w-xs lg:max-w-md rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Questions */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center mb-3">
                    <HelpCircle size={16} className="text-gray-500 mr-2" />
                    <p className="text-sm text-gray-600 font-medium">Quick questions:</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      aria-label="Send message"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Chat With Us</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get instant support from our customer service team. We're here to help with orders, 
              returns, shipping, and any other queries you may have.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-full ${method.color} mr-4`}>
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{method.title}</h3>
                    <p className="text-sm text-gray-500">{method.subtitle}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{method.detail}</p>
                <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                  {method.title === 'Call Us' ? 'Call Now' : 'Send Email'}
                </button>
              </div>
            ))}
          </div>

          {/* Support Topics */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Can We Help You?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportTopics.map((topic, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                      {topic.icon}
                    </div>
                    <h3 className="font-bold text-gray-900">{topic.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {topic.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-center text-gray-600 text-sm">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Get Help
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "How do I track my order?",
                  a: "You can track your order from 'My Orders' section in your account or use the tracking link sent to your email."
                },
                {
                  q: "What is your return policy?",
                  a: "We offer 10-day returns for most products. Items must be unused with original tags and packaging."
                },
                {
                  q: "Do you offer Cash on Delivery?",
                  a: "Yes, COD is available for orders up to ₹50,000. A ₹50 processing fee applies to COD orders."
                },
                {
                  q: "How long does shipping take?",
                  a: "Standard shipping takes 5-8 business days, express takes 3-5 days, and next-day delivery is available in select cities."
                }
              ].map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <button className="w-full text-left flex justify-between items-center">
                    <span className="font-medium text-gray-900">{faq.q}</span>
                    <span className="text-blue-600 text-xl">+</span>
                  </button>
                  <p className="mt-2 text-gray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
              <p className="mb-6 text-blue-100 max-w-2xl mx-auto">
                Our dedicated support team is ready to assist you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                  <Phone size={18} className="inline mr-2" />
                  Call +91-87629 78777
                </button>
                <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors">
                  <Mail size={18} className="inline mr-2" />
                  Email info@lmart.com
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatWithUs;