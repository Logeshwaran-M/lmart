import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-responsive">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to L-mart ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our website, 
                printing services, e-store platform, and local market services (collectively, the "Services") operated by PrintCo.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of these terms, 
                then you may not access the Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Services Offered</h2>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Our Services Include:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Printing Services:</strong> Digital printing, offset printing, business cards, brochures, banners</li>
                  <li><strong>E-Store:</strong> Online marketplace for digital products and services</li>
                  <li><strong>Local Market:</strong> Platform connecting local businesses and customers</li>
                  <li><strong>News Today:</strong> Latest news and updates service</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features of our Services, you may be required to create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and up-to-date information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Printing Services Terms</h2>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">File Requirements & Quality:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Files must be in acceptable formats (PDF, AI, PSD, JPG, PNG)</li>
                  <li>Minimum resolution: 300 DPI for print quality</li>
                  <li>Color accuracy may vary between screen and print</li>
                  <li>We reserve the right to refuse printing of inappropriate content</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Payment Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payment is required before order processing. We accept various payment methods including credit cards, 
                debit cards, and digital wallets. All prices are in Indian Rupees (INR) and include applicable taxes.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800 font-medium">⚠️ Refund Policy: Refunds are processed within 7-10 business days for cancelled orders before production begins.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of your content and designs. By using our services, you grant us a limited license to 
                reproduce your materials solely for the purpose of fulfilling your orders.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You warrant that you have the right to use all materials submitted and that they do not infringe on any third-party rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                PrintCo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Get in Touch:</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Phone:</strong> +91 9880444189</p>
                  <p><strong>Email:</strong> info@printco.com</p>
                  <p><strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 7:00 PM</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes 
                via email or through our website. Continued use of our Services after such modifications constitutes acceptance of the new Terms.
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

export default TermsOfService;