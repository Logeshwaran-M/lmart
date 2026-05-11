import React from 'react';

function ShippingPolicy() {
  const lastUpdated = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10 pb-8 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Shipping Policy</h1>
        <p className="text-gray-600 italic">Last Updated: {lastUpdated}</p>
      </div>

      <div className="space-y-10">
        {/* Shipping Methods & Delivery Times */}
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Shipping Methods & Delivery Times
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Standard Shipping</h3>
              <p className="text-blue-600 font-medium text-lg mb-1">5-8 Business Days</p>
              <p className="text-gray-900 font-bold text-xl mb-4">₹99</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Free on orders over ₹2000
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Order before 4 PM IST for same-day processing
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Tracking included
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Express Shipping</h3>
              <p className="text-blue-600 font-medium text-lg mb-1">3-5 Business Days</p>
              <p className="text-gray-900 font-bold text-xl mb-4">₹199</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Free on orders over ₹5000
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Order before 2 PM IST for same-day dispatch
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority tracking
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Next Day Delivery</h3>
              <p className="text-blue-600 font-medium text-lg mb-1">1-2 Business Days</p>
              <p className="text-gray-900 font-bold text-xl mb-4">₹399</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Order before 1 PM IST for next-day delivery
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Signature required for high-value items
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Real-time tracking & SMS updates
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Shipping Areas & Restrictions */}
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Shipping Areas & Restrictions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🇮🇳</span> Domestic Shipping (India)
              </h3>
              <p className="text-gray-600 mb-4">We ship across all Indian states and union territories:</p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Metro Cities:</strong> 3-5 business days</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Tier 1 & 2 Cities:</strong> 5-8 business days</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Tier 3 Cities & Rural Areas:</strong> 7-12 business days</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Special Category States:</strong> 8-15 business days</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🌏</span> International Shipping
              </h3>
              <p className="text-gray-600 mb-4">Available to selected countries from India:</p>
              <ul className="space-y-3 text-gray-600 mb-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>USA & Canada:</strong> 10-15 business days - ₹1499</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>UK & Europe:</strong> 12-18 business days - ₹1299</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>Middle East (UAE, Saudi):</strong> 5-8 business days - ₹899</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>Australia & New Zealand:</strong> 8-12 business days - ₹1599</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span><strong>Southeast Asia:</strong> 7-10 business days - ₹799</span>
                </li>
              </ul>
              <p className="text-amber-600 bg-amber-50 p-3 rounded-md text-sm">
                <strong>Note:</strong> International orders may be subject to customs duties, GST, and other taxes as per destination country regulations.
              </p>
            </div>
          </div>
        </section>

        {/* Order Processing & Tracking */}
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-3 border-b border-gray-100">
            Order Processing & Tracking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: "1",
                title: "Order Processing",
                description: "Orders are processed within 24-48 hours (Mon-Sat). Orders placed on Sundays or national holidays will be processed the next working day."
              },
              {
                number: "2",
                title: "Shipment Preparation",
                description: "Items are carefully packed with protective material. You'll receive SMS/email notification when your order is shipped."
              },
              {
                number: "3",
                title: "Tracking Information",
                description: "Track your package via SMS, email, or our app. Live tracking available for most locations across India."
              },
              {
                number: "4",
                title: "Delivery",
                description: "Most deliveries occur between 10 AM and 8 PM. Delivery attempts may vary based on location and local restrictions."
              }
            ].map((step, index) => (
              <div key={index} className="text-center p-5">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping Restrictions & Prohibited Items */}
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Shipping Restrictions & Prohibited Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">⚠️</span> Restricted/Prohibited Items
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Liquor, tobacco, and other intoxicants
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Weapons, firearms, and ammunition
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Perishable goods without special arrangements
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Items prohibited by Indian Customs regulations
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  High-value jewelry (over ₹2 lakhs)
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📦</span> Special Handling & Charges
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  Fragile items: Additional ₹150 packaging charge
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  Bulky items: Additional ₹200-500 shipping fee
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  Remote locations: Surcharge may apply
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  Cash on Delivery: ₹50 additional charge
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Shipping Rates & Fees */}
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Shipping Rates & Fees (Within India)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Standard
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Express
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Day
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Under ₹2000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹99</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹199</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹399</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₹2000 - ₹4999</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">FREE</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹99</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹299</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₹5000+</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">FREE</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">FREE</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹199</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 text-sm text-gray-500">
              <p><strong>Note:</strong> Above rates are for metro and tier-1 cities. Additional charges may apply for remote areas.</p>
            </div>
          </div>
        </section>

        {/* Delivery Issues & Solutions */}
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Delivery Issues & Solutions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "📬",
                title: "Missed Delivery",
                description: "3 delivery attempts will be made. Package held at nearest delivery center for 7 days. Pickup details sent via SMS."
              },
              {
                icon: "📦",
                title: "Damaged Package",
                description: "Contact within 24 hours with photos/video. Replacement/refund initiated within 48 working hours."
              },
              {
                icon: "❓",
                title: "Lost Package",
                description: "If not delivered within promised timeline + 3 days, contact us for investigation and resolution."
              },
              {
                icon: "🔄",
                title: "Wrong Address",
                description: "Update address within 2 hours of order placement. For shipped orders, ₹150 address correction fee applies."
              }
            ].map((issue, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
                <div className="text-2xl mb-3">{issue.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{issue.title}</h3>
                <p className="text-gray-600 text-sm">{issue.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Holiday & Peak Season Schedule */}
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Holiday & Peak Season Schedule (India)
          </h2>
          <div className="bg-purple-50 rounded-lg p-6">
            <p className="text-gray-700 mb-6">During Indian festivals and peak seasons, delivery timelines may extend:</p>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start">
                <span className="text-purple-500 mr-3">•</span>
                <span>
                  <strong className="text-gray-800">Diwali Season (Oct-Nov):</strong>
                  <span className="text-gray-600 ml-1">Add 4-7 business days to standard delivery</span>
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-3">•</span>
                <span>
                  <strong className="text-gray-800">New Year & Christmas (Dec-Jan):</strong>
                  <span className="text-gray-600 ml-1">Add 3-5 business days</span>
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-3">•</span>
                <span>
                  <strong className="text-gray-800">Monsoon Season (June-Sept):</strong>
                  <span className="text-gray-600 ml-1">Delays possible in flood-affected areas</span>
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-3">•</span>
                <span>
                  <strong className="text-gray-800">Indian National Holidays:</strong>
                  <span className="text-gray-600 ml-1">No deliveries on gazetted holidays</span>
                </span>
              </li>
            </ul>
            <div className="bg-white border-l-4 border-purple-500 p-4 rounded-r">
              <p className="text-gray-700">
                <strong>📅 Pro Tip:</strong> Order at least 10 days before major festivals to ensure timely delivery.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-r from-saffron to-green-50 rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help with Shipping?</h2>
          <div className="space-y-6">
            <p className="text-gray-700 text-lg">Our India-based customer service team is here to help:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <span className="text-xl mr-3">📧</span>
                  <span>Email: <strong className="text-blue-600">shipping@lmart.in</strong></span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-xl mr-3">📞</span>
                  <span>Toll-Free: <strong className="text-blue-600">1800-11-8999</strong></span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-xl mr-3">📱</span>
                  <span>WhatsApp: <strong className="text-blue-600">+91-9876543210</strong></span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <span className="text-xl mr-3">💬</span>
                  <span>Live Chat: <strong>Available Mon-Sat, 9AM-9PM IST</strong></span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-xl mr-3">🕒</span>
                  <span>Support Hours: <strong>Monday - Saturday, 9:00 AM - 9:00 PM IST</strong></span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-xl mr-3">📞</span>
                  <span>Sunday Support: <strong>10:00 AM - 6:00 PM IST</strong></span>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg inline-block">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Average response time:</span> 1 hour during business hours
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8">
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-red-500 mr-2">❗</span>
              <p className="text-gray-700">
                <strong>Note:</strong> This shipping policy is subject to change without prior notice. All timelines are in Indian Standard Time (IST).
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <p className="text-gray-600">Lmart India reserves the right to modify shipping policies based on local regulations, weather conditions, or unforeseen circumstances.</p>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <p className="text-gray-600">For Cash on Delivery (COD) orders, additional terms and conditions apply. Maximum COD limit is ₹50,000 per order.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingPolicy;