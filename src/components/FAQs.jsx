import React, { useState } from 'react';

function FAQs() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openQuestions, setOpenQuestions] = useState([]);

  const toggleQuestion = (id) => {
    setOpenQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(qId => qId !== id)
        : [...prev, id]
    );
  };

  const faqCategories = [
    { id: 'all', name: 'All Questions', icon: '❓' },
    { id: 'ordering', name: 'Ordering', icon: '🛒' },
    { id: 'shipping', name: 'Shipping & Delivery', icon: '🚚' },
    { id: 'returns', name: 'Returns & Refunds', icon: '🔄' },
    { id: 'payment', name: 'Payment', icon: '💳' },
    { id: 'account', name: 'Account & Security', icon: '👤' },
    { id: 'products', name: 'Products & Services', icon: '📦' }
  ];

  const faqData = [
    // Ordering FAQs
    {
      id: 1,
      category: 'ordering',
      question: 'How do I place an order on Lmart?',
      answer: 'To place an order: 1. Browse products and add items to cart. 2. Click on cart icon and proceed to checkout. 3. Enter shipping details. 4. Select payment method. 5. Review order and confirm. You will receive order confirmation via email and SMS.',
      featured: true
    },
    {
      id: 2,
      category: 'ordering',
      question: 'Can I modify or cancel my order after placing it?',
      answer: 'You can cancel your order before it\'s shipped from our warehouse. To cancel: Go to "My Orders" → Select order → Click "Cancel Order". Once shipped, you cannot cancel but can initiate a return after delivery. Modifications are not possible after order confirmation.',
      featured: false
    },
    {
      id: 3,
      category: 'ordering',
      question: 'How do I apply a coupon code?',
      answer: 'During checkout, you\'ll find a "Apply Coupon" option below the order summary. Enter your coupon code and click apply. The discount will be reflected in your total amount. Coupons are subject to terms and conditions.',
      featured: false
    },

    // Shipping & Delivery FAQs
    {
      id: 4,
      category: 'shipping',
      question: 'What are your delivery charges?',
      answer: 'Standard shipping: ₹99 (Free on orders above ₹2000). Express shipping: ₹199 (Free on orders above ₹5000). Next-day delivery: ₹399 (available in select cities). Additional charges may apply for remote areas and bulky items.',
      featured: true
    },
    {
      id: 5,
      category: 'shipping',
      question: 'How long does delivery take?',
      answer: '• Standard: 5-8 business days\n• Express: 3-5 business days\n• Next-day: 1-2 business days (select cities)\n• Remote areas: 7-12 business days\nDelivery times may vary during festivals and peak seasons.',
      featured: true
    },
    {
      id: 6,
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to select countries including USA, UK, Canada, UAE, Australia, and Singapore. International shipping takes 10-20 business days and costs start from ₹799. Customs duties and taxes are the responsibility of the recipient.',
      featured: false
    },
    {
      id: 7,
      category: 'shipping',
      question: 'How can I track my order?',
      answer: 'Track your order through: 1. "My Orders" section in your account. 2. Tracking link in confirmation email/SMS. 3. Contact customer support with order ID. Real-time tracking is available for most locations.',
      featured: false
    },

    // Returns & Refunds FAQs
    {
      id: 8,
      category: 'returns',
      question: 'What is your return policy?',
      answer: '• 10-day return window from delivery date\n• Products must be unused with original tags/packaging\n• Free returns for defective/wrong items\n• ₹100 processing fee for change of mind returns\n• Some items are non-returnable (undergarments, cosmetics, perishables)',
      featured: true
    },
    {
      id: 9,
      category: 'returns',
      question: 'How long does the refund process take?',
      answer: 'Refunds are processed within 7-10 business days after we receive the returned item. Payment method refunds: 1-3 days. Bank transfer/UPI refunds: 3-7 days. COD order refunds are processed via bank transfer only.',
      featured: false
    },
    {
      id: 10,
      category: 'returns',
      question: 'What items cannot be returned?',
      answer: '• Undergarments and innerwear\n• Cosmetics and personal care items\n• Perishable goods\n• Digital products and software\n• Customized/personalized products\n• Gift cards and vouchers\n• Items marked "non-returnable"',
      featured: false
    },

    // Payment FAQs
    {
      id: 11,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept: • Credit/Debit Cards (Visa, MasterCard, RuPay) • Net Banking • UPI (Google Pay, PhonePe, Paytm) • Digital Wallets • Cash on Delivery (COD) • EMI options available for eligible cards.',
      featured: true
    },
    {
      id: 12,
      category: 'payment',
      question: 'Is Cash on Delivery available?',
      answer: 'Yes, COD is available for orders up to ₹50,000. A ₹50 processing fee applies. COD is not available for high-value items, international orders, or certain remote locations. You need to provide valid ID proof at delivery.',
      featured: true
    },
    {
      id: 13,
      category: 'payment',
      question: 'Is it safe to pay online on Lmart?',
      answer: 'Absolutely! We use 256-bit SSL encryption for all transactions. We are PCI-DSS compliant and partner with secure payment gateways. Your payment information is never stored on our servers.',
      featured: false
    },

    // Account & Security FAQs
    {
      id: 14,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" on top right → Enter email/mobile → Create password → Verify via OTP → Complete profile. Alternatively, you can sign up using Google, Facebook, or Apple accounts.',
      featured: false
    },
    {
      id: 15,
      category: 'account',
      question: 'I forgot my password. How can I reset it?',
      answer: 'Click "Forgot Password" on login page → Enter registered email/mobile → Receive OTP → Enter OTP → Create new password. You can also reset via email link if you have email registered.',
      featured: false
    },
    {
      id: 16,
      category: 'account',
      question: 'How do I update my account information?',
      answer: 'Go to "My Account" → "Profile Settings" → Update details → Save changes. For email/mobile changes, verification is required. Addresses can be managed in "Address Book" section.',
      featured: false
    },

    // Products & Services FAQs
    {
      id: 17,
      category: 'products',
      question: 'Are your products genuine/original?',
      answer: 'Yes! All products sold on Lmart are 100% genuine and sourced directly from brands or authorized distributors. We provide manufacturer warranty where applicable. Check for "Authenticity Guaranteed" badge on product pages.',
      featured: true
    },
    {
      id: 18,
      category: 'products',
      question: 'Do you offer warranty on products?',
      answer: 'Most products come with manufacturer warranty. Warranty period varies by product category: Electronics (1-2 years), Appliances (1-5 years), Furniture (1-3 years). Check product description for specific warranty details.',
      featured: false
    },
    {
      id: 19,
      category: 'products',
      question: 'What if I receive a damaged or wrong product?',
      answer: 'Contact us within 48 hours of delivery with photos/video of the issue. We will arrange pickup for replacement/return at no cost. Refund will be processed if replacement is not available.',
      featured: false
    }
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === activeCategory);

  const featuredFAQs = faqData.filter(faq => faq.featured);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find quick answers to common questions about shopping on Lmart. Can't find what you're looking for? 
            <a href="/contact" className="text-blue-600 hover:underline ml-1">Contact our support team</a>.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Featured Questions */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFAQs.slice(0, 6).map((faq) => (
              <div 
                key={faq.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => toggleQuestion(faq.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                  <span className="text-blue-600 text-xl">
                    {openQuestions.includes(faq.id) ? '−' : '+'}
                  </span>
                </div>
                {openQuestions.includes(faq.id) && (
                  <p className="text-gray-600 text-sm mt-3">{faq.answer}</p>
                )}
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded mr-2">
                    {faqCategories.find(cat => cat.id === faq.category)?.name}
                  </span>
                  <span>•</span>
                  <span className="ml-2">2 min read</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-5 py-3 rounded-lg transition-all ${activeCategory === category.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'}`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
                <span className="ml-2 text-sm opacity-80">
                  ({category.id === 'all' ? faqData.length : faqData.filter(f => f.category === category.id).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* All Questions */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeCategory === 'all' ? 'All Questions' : faqCategories.find(cat => cat.id === activeCategory)?.name}
              <span className="text-gray-500 text-lg font-normal ml-2">
                ({filteredFAQs.length} questions)
              </span>
            </h2>
            <div className="text-sm text-gray-500">
              Showing {filteredFAQs.length} of {faqData.length} questions
            </div>
          </div>

          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div 
                key={faq.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleQuestion(faq.id)}
                  className="w-full text-left p-6 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-3">
                        {faqCategories.find(cat => cat.id === faq.category)?.icon}
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        {faqCategories.find(cat => cat.id === faq.category)?.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    {faq.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Popular
                      </span>
                    )}
                  </div>
                  <span className="text-blue-600 text-2xl ml-4 flex-shrink-0">
                    {openQuestions.includes(faq.id) ? '−' : '+'}
                  </span>
                </button>
                
                {openQuestions.includes(faq.id) && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-600 mb-4">{faq.answer}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Was this helpful?</span>
                          <button className="ml-3 text-green-600 hover:text-green-700">👍 Yes</button>
                          <button className="ml-2 text-red-600 hover:text-red-700">👎 No</button>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 flex items-center">
                          <span className="mr-1">📋</span>
                          Copy link
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Still Have Questions */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Can't find the answer you're looking for? Our customer support team is here to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                📞 Call +91-87629 78777
              </button>
              <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors">
                ✉️ Email info@lmart.com
              </button>
              <button className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-white/30 transition-colors">
                💬 Live Chat Support
              </button>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="text-xl mb-2">⏰</div>
                <div className="font-semibold">Response Time</div>
                <div className="opacity-90">Within 2 hours</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="text-xl mb-2">🕒</div>
                <div className="font-semibold">Support Hours</div>
                <div className="opacity-90">9 AM - 9 PM, 7 days</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="text-xl mb-2">🎯</div>
                <div className="font-semibold">Resolution Rate</div>
                <div className="opacity-90">98% queries resolved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Helpful Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Helpful Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <a href="/shipping-policy" className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow hover:border-blue-500">
              <div className="text-3xl mb-4">🚚</div>
              <h3 className="font-bold text-gray-900 mb-2">Shipping Policy</h3>
              <p className="text-gray-600 text-sm">Delivery timelines, charges, and tracking</p>
            </a>
            <a href="/return-policy" className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow hover:border-blue-500">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="font-bold text-gray-900 mb-2">Return Policy</h3>
              <p className="text-gray-600 text-sm">Returns, refunds, and exchange process</p>
            </a>
            <a href="/terms" className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow hover:border-blue-500">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="font-bold text-gray-900 mb-2">Terms & Conditions</h3>
              <p className="text-gray-600 text-sm">Platform rules and user agreement</p>
            </a>
            <a href="/privacy" className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow hover:border-blue-500">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="font-bold text-gray-900 mb-2">Privacy Policy</h3>
              <p className="text-gray-600 text-sm">How we protect your data and privacy</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQs;