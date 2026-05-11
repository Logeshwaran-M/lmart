import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-responsive">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
            <div className="mt-4 text-6xl">🍪</div>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cookies are small text files that are stored on your computer or mobile device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and understanding how you use our services.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">How Cookies Work:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Cookies are created when you visit our PrintCo website</li>
                  <li>They store information about your browsing behavior and preferences</li>
                  <li>They help us recognize you on return visits</li>
                  <li>They enable certain website features and functionality</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Types of Cookies We Use</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">🔧 Essential Cookies</h3>
                  <p className="text-gray-700 text-sm mb-3">Required for basic website functionality</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>User authentication and login sessions</li>
                    <li>Shopping cart functionality</li>
                    <li>Security and fraud prevention</li>
                    <li>Website navigation and accessibility</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">📊 Analytics Cookies</h3>
                  <p className="text-gray-700 text-sm mb-3">Help us understand website usage</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Page views and user interactions</li>
                    <li>Popular printing services and products</li>
                    <li>Website performance optimization</li>
                    <li>Error tracking and debugging</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">🎯 Functional Cookies</h3>
                  <p className="text-gray-700 text-sm mb-3">Enhance your user experience</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Language and region preferences</li>
                    <li>Customized printing options</li>
                    <li>Recently viewed products</li>
                    <li>User interface preferences</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">📢 Marketing Cookies</h3>
                  <p className="text-gray-700 text-sm mb-3">Deliver relevant advertisements</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Personalized printing service recommendations</li>
                    <li>Targeted promotional offers</li>
                    <li>Social media integration</li>
                    <li>Cross-platform advertising</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Specific Cookies Used by PrintCo</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cookie Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Purpose</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">printco_session</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Maintains user login session</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Session</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Essential</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">cart_items</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Stores shopping cart contents</td>
                      <td className="px-4 py-3 text-sm text-gray-700">7 days</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Essential</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">user_preferences</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Saves printing preferences</td>
                      <td className="px-4 py-3 text-sm text-gray-700">30 days</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Functional</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">analytics_id</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Tracks website usage patterns</td>
                      <td className="px-4 py-3 text-sm text-gray-700">2 years</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Analytics</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">marketing_consent</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Stores marketing preferences</td>
                      <td className="px-4 py-3 text-sm text-gray-700">1 year</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Marketing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Third-Party Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may also use third-party services that set their own cookies. These services help us provide better 
                functionality and analyze our website performance.
              </p>
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">Third-Party Services:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Google Analytics:</strong> Website traffic analysis and user behavior insights</li>
                  <li><strong>Payment Processors:</strong> Secure payment processing for printing orders</li>
                  <li><strong>Social Media Platforms:</strong> Social sharing and login functionality</li>
                  <li><strong>Customer Support:</strong> Live chat and support ticket systems</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Managing Your Cookie Preferences</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">🌐 Browser Settings</h3>
                  <p className="text-gray-700 text-sm mb-3">Control cookies through your browser:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Chrome: Settings → Privacy → Cookies</li>
                    <li>Firefox: Options → Privacy → Cookies</li>
                    <li>Safari: Preferences → Privacy → Cookies</li>
                    <li>Edge: Settings → Privacy → Cookies</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3">⚙️ Cookie Consent</h3>
                  <p className="text-gray-700 text-sm mb-3">Manage preferences on our website:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Accept or decline non-essential cookies</li>
                    <li>Customize cookie categories</li>
                    <li>Update preferences anytime</li>
                    <li>View detailed cookie information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Impact of Disabling Cookies</h2>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ What Happens When You Disable Cookies:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Essential Cookies:</strong> Website may not function properly, login issues may occur</li>
                  <li><strong>Functional Cookies:</strong> Loss of personalized settings and preferences</li>
                  <li><strong>Analytics Cookies:</strong> We cannot improve our services based on usage data</li>
                  <li><strong>Marketing Cookies:</strong> You may see less relevant advertisements</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Mobile App Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you use our mobile application, similar tracking technologies may be used to enhance your experience. 
                You can manage these preferences through your device settings or within the app.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Cookie Security</h2>
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-3">🔒 Security Measures:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Cookies are encrypted and secure</li>
                  <li>No sensitive personal information is stored in cookies</li>
                  <li>Regular security audits and updates</li>
                  <li>Compliance with data protection regulations</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Updates to Cookie Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. 
                We will notify you of any significant changes by posting the updated policy on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Us About Cookies</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Questions About Our Cookie Usage?</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> cookies@printco.com</p>
                  <p><strong>Phone:</strong> +91 9880444189</p>
                  <p><strong>Support Hours:</strong> Monday - Saturday, 9:00 AM - 7:00 PM</p>
                  <p><strong>Response Time:</strong> We respond to cookie-related inquiries within 24 hours</p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <div className="mb-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 mr-4">
                Accept All Cookies
              </button>
              <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200">
                Manage Preferences
              </button>
            </div>
            <p className="text-gray-600">
              © 2024 PrintCo. All rights reserved. | Since 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;