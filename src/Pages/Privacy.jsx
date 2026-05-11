import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-responsive">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At PrintCo, we are committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our printing services, e-store platform, 
                and local market services.
              </p>
              
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Personal Information We Collect:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
                  <li><strong>Account Information:</strong> Username, password, profile preferences</li>
                  <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely)</li>
                  <li><strong>Order Information:</strong> Printing specifications, delivery preferences, order history</li>
                  <li><strong>Communication Data:</strong> Messages, support tickets, feedback</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Service Delivery:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Process and fulfill your printing orders</li>
                    <li>Manage your account and preferences</li>
                    <li>Provide customer support</li>
                    <li>Send order confirmations and updates</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Business Operations:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Improve our services and user experience</li>
                    <li>Analyze usage patterns and trends</li>
                    <li>Prevent fraud and ensure security</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                except in the following circumstances:
              </p>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">We May Share Information With:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Service Providers:</strong> Trusted partners who assist in order fulfillment and delivery</li>
                  <li><strong>Payment Processors:</strong> Secure payment gateways for transaction processing</li>
                  <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-3">🔒 Security Measures:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>SSL encryption for all data transmission</li>
                  <li>Secure servers with regular security updates</li>
                  <li>Limited access to personal information by authorized personnel only</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Secure payment processing through certified providers</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have several rights regarding your personal information:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Access & Update</h4>
                  <p className="text-gray-700 text-sm">View and update your personal information through your account settings</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Data Portability</h4>
                  <p className="text-gray-700 text-sm">Request a copy of your personal data in a structured format</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Deletion</h4>
                  <p className="text-gray-700 text-sm">Request deletion of your personal information (subject to legal requirements)</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Opt-out</h4>
                  <p className="text-gray-700 text-sm">Unsubscribe from marketing communications at any time</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our website. 
                These help us remember your preferences, analyze site traffic, and provide personalized content.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-orange-800 font-medium">🍪 You can control cookie settings through your browser preferences. See our Cookie Policy for more details.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, 
                resolve disputes, and enforce our agreements. Order information is typically retained for 7 years for tax and legal purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information 
                from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate 
                safeguards are in place to protect your personal information in accordance with applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Privacy Questions or Concerns?</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@printco.com</p>
                  <p><strong>Phone:</strong> +91 9880444189</p>
                  <p><strong>Address:</strong> PrintCo Privacy Office, India</p>
                  <p><strong>Response Time:</strong> We respond to privacy inquiries within 48 hours</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this 
                Privacy Policy periodically.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              © 2024 PrintCo. All rights reserved. | Since 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;