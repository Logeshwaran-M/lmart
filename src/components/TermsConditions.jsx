import React from 'react';

function TermsConditions() {
  const lastUpdated = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10 pb-8 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-gray-600 italic">Last Updated: {lastUpdated}</p>
        <p className="text-gray-500 mt-4 max-w-3xl mx-auto">
          Welcome to Lmart. By accessing and using this website, you accept and agree to be bound by these Terms & Conditions.
        </p>
      </div>

      <div className="space-y-10">
        {/* Acceptance of Terms */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              1
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing, browsing, or using the Lmart website (www.lmart.in) and mobile application ("Platform"), 
                you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. 
                If you do not agree with any part of these terms, you must not use our Platform.
              </p>
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              2
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Eligibility</h2>
              <p className="text-gray-600 mb-4">You must be at least 18 years of age to use our Platform. By using Lmart, you represent and warrant that:</p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  You are at least 18 years old
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  You have the legal capacity to enter into a binding contract
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  You are not barred from receiving services under applicable laws in India
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  You will use the Platform only for lawful purposes
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Account Registration */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              3
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Registration & Security</h2>
              <p className="text-gray-600 mb-4">To access certain features, you must create an account. You agree to:</p>
              <ul className="space-y-3 text-gray-600 mb-4">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Provide accurate, current, and complete information
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Maintain and update your information promptly
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Maintain the confidentiality of your password
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Notify us immediately of any unauthorized access
                </li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
                <p className="text-yellow-700">
                  <strong>Important:</strong> You are solely responsible for all activities that occur under your account. 
                  Lmart is not liable for any loss or damage arising from your failure to protect your account information.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products & Pricing */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              4
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Products, Pricing & Availability</h2>
              <div className="space-y-4 text-gray-600">
                <p><strong>Pricing:</strong> All prices are in Indian Rupees (₹) and include applicable taxes unless stated otherwise. 
                We reserve the right to modify prices at any time without prior notice.</p>
                
                <p><strong>Product Descriptions:</strong> We strive to provide accurate product descriptions and images. 
                However, we do not guarantee that descriptions are error-free or that colors displayed exactly match actual products.</p>
                
                <p><strong>Availability:</strong> All products are subject to availability. If a product becomes unavailable after your order, 
                we will notify you and either offer an alternative or issue a full refund.</p>
                
                <p><strong>Errors:</strong> In case of pricing errors, we reserve the right to cancel orders placed at incorrect prices.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ordering & Payment */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              5
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ordering & Payment Terms</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Process</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Adding items to cart does not reserve them
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Order is confirmed only after payment verification
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      You will receive order confirmation via email/SMS
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Methods</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-xl mb-1">💳</div>
                      <span className="text-sm font-medium">Credit/Debit Cards</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-xl mb-1">🏦</div>
                      <span className="text-sm font-medium">Net Banking</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-xl mb-1">📱</div>
                      <span className="text-sm font-medium">UPI/Wallets</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-xl mb-1">💰</div>
                      <span className="text-sm font-medium">Cash on Delivery</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-700 mb-2">COD Limitations:</h4>
                  <ul className="text-red-600 text-sm space-y-1">
                    <li>• Maximum COD order value: ₹50,000</li>
                    <li>• COD not available for certain high-value items</li>
                    <li>• Additional ₹50 processing fee for COD orders</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping & Delivery */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              6
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Shipping & Delivery</h2>
              <div className="space-y-4 text-gray-600">
                <p>Please refer to our detailed <a href="/shipping-policy" className="text-blue-600 hover:underline">Shipping Policy</a> for complete information.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Delivery Areas</h4>
                    <p className="text-sm">We deliver across India. International shipping available to select countries.</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Delivery Time</h4>
                    <p className="text-sm">3-10 business days depending on location and shipping method chosen.</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Shipping Charges</h4>
                    <p className="text-sm">Free shipping on orders above ₹2000. Standard charges apply for smaller orders.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Returns & Refunds */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              7
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Returns, Refunds & Cancellations</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-green-50 border border-green-100 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Return Policy
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• 10-day return window from delivery date</li>
                    <li>• Products must be unused, unwashed with original tags</li>
                    <li>• Return shipping is free for defective/wrong items</li>
                    <li>• Some items are non-returnable (underwear, cosmetics, etc.)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-blue-500 mr-2">🔄</span> Refund Process
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Refunds processed within 7-10 business days</li>
                    <li>• Refund method same as payment method</li>
                    <li>• COD refunds via bank transfer/UPI</li>
                    <li>• ₹100 processing fee for non-defective returns</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-orange-500 mr-2">✖️</span> Order Cancellation
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Cancel anytime before order is shipped</li>
                    <li>• Full refund for pre-paid cancelled orders</li>
                    <li>• Cannot cancel after order is shipped</li>
                    <li>• Use "Return" option for shipped orders</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              8
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Intellectual Property Rights</h2>
              <div className="space-y-4 text-gray-600">
                <p>All content on the Lmart Platform, including but not limited to:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">📝</span>
                      <span>Text, graphics, logos</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">🖼️</span>
                      <span>Images, photographs</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">🎨</span>
                      <span>Design, layout</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">💻</span>
                      <span>Software, code</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">🏢</span>
                      <span>Trademarks, service marks</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">📚</span>
                      <span>Content arrangement</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg mt-6">
                  <p className="text-red-600">
                    <strong>⚠️ Prohibited:</strong> Any unauthorized use, reproduction, modification, distribution, or 
                    republication of any content from our Platform is strictly prohibited and may violate copyright, 
                    trademark, and other laws.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User Conduct */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              9
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">User Conduct & Prohibited Activities</h2>
              <p className="text-gray-600 mb-4">You agree not to:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    <span className="text-gray-600">Use the Platform for any illegal purpose</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    <span className="text-gray-600">Upload viruses or malicious code</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    <span className="text-gray-600">Attempt to gain unauthorized access</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    <span className="text-gray-600">Harass, abuse, or harm others</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    <span className="text-gray-600">Interfere with security features</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    <span className="text-gray-600">Submit false or misleading information</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              10
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Limitation of Liability</h2>
              <div className="space-y-4 text-gray-600">
                <p>To the maximum extent permitted by law, Lmart shall not be liable for:</p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>Any indirect, incidental, or consequential damages</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>Loss of profits, data, or business opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>Third-party actions or products</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>Force majeure events beyond our control</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r mt-6">
                  <p className="text-yellow-700">
                    <strong>Legal Compliance:</strong> Our liability is limited to the maximum extent permitted under the 
                    Indian Contract Act, 1872 and other applicable Indian laws.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              11
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h2>
              <div className="space-y-4 text-gray-600">
                <p>Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a> to understand how we collect, use, and protect your personal information.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Data Protection</h4>
                    <p className="text-sm">We comply with Indian data protection regulations and implement industry-standard security measures.</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Information Usage</h4>
                    <p className="text-sm">We use your information only for order processing, customer service, and improving our services.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Governing Law */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              12
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Governing Law & Dispute Resolution</h2>
              <div className="space-y-4 text-gray-600">
                <p><strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of India.</p>
                
                <p><strong>Jurisdiction:</strong> Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.</p>
                
                <p><strong>Dispute Resolution:</strong> We encourage you to contact us first at <a href="mailto:legal@lmart.in" className="text-blue-600 hover:underline">legal@lmart.in</a> to resolve any disputes amicably.</p>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-blue-700">
                    <strong>Note:</strong> The Consumer Protection Act, 2019 provides additional rights to consumers in India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
              13
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Changes to Terms & Conditions</h2>
              <div className="space-y-4 text-gray-600">
                <p>We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately upon posting on the Platform.</p>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-xl mr-3">🔔</span>
                  <p>
                    <strong>Notification:</strong> We will notify you of significant changes via email or platform notification. 
                    Your continued use after changes constitutes acceptance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              If you have any questions about these Terms & Conditions, please contact our legal department:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-600 text-xl mb-2">📧</div>
                <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                <p className="text-sm text-gray-600">legal@lmart.in</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-600 text-xl mb-2">📞</div>
                <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
                <p className="text-sm text-gray-600">1800-11-LEGAL (53425)</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-600 text-xl mb-2">📝</div>
                <h3 className="font-semibold text-gray-800 mb-1">Registered Office</h3>
                <p className="text-sm text-gray-600">Lmart India Pvt. Ltd., Mumbai</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-600 text-xl mb-2">⚖️</div>
                <h3 className="font-semibold text-gray-800 mb-1">Grievance Officer</h3>
                <p className="text-sm text-gray-600">grievance@lmart.in</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <span className="text-xl mr-2">⚠️</span>
              <span className="font-semibold">Important Legal Notice</span>
            </div>
            
            <p className="text-gray-700">
              By using Lmart's Platform, you acknowledge that you have read, understood, and agree to be bound by all 
              terms and conditions stated herein. These Terms & Conditions constitute the entire agreement between you 
              and Lmart India Private Limited regarding your use of the Platform.
            </p>
            
            <p className="text-gray-600 text-sm">
              These Terms are effective from {lastUpdated} and supersede all prior versions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsConditions;