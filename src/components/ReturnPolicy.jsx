import React from 'react';

function ReturnPolicy() {
  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen"> 
      <div className="max-w-4xl mx-auto">
        
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-indigo-900 mb-2">
            🛍️ Our Return Policy
          </h1>
          <p className="text-lg text-gray-600">
            Your satisfaction is our priority. Please review the details below.
          </p>
        </header>

        <div className="space-y-10">
          
          {/* Section 1: Overview */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              1. General Return Conditions
            </h2>
            <p className="text-gray-700 mb-4">
              We accept returns for items within 30 days of the original purchase date. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
            </p>
            <p className="text-gray-700">
              <span className="font-semibold text-red-600">Note:</span> Custom-printed or personalized items are generally non-refundable unless they arrive damaged or with a material defect.
            </p>
          </section>

          {/* Section 2: Items Not Eligible for Return */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              2. Non-Returnable Items
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Software, downloadable digital products, or gift cards.</li>
              <li>Used office supplies (e.g., opened paper reams, used ink cartridges).</li>
              <li>Items marked as "Final Sale" or "Clearance."</li>
              <li>Any item not in its original condition, is damaged, or missing parts for reasons not due to our error.</li>
            </ul>
          </section>

          {/* Section 3: Process for Returns */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              3. How to Process a Return
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                Contact Us: Email us at <a href="mailto:returns@lmart.com" className="text-indigo-600 hover:text-indigo-800 font-medium">returns@lmart.com</a> with your Order Number and the reason for the return.
              </li>
              <li>
                Receive Authorization: Wait for our team to issue a Return Merchandise Authorization (RMA) number and provide a shipping label (if applicable).
              </li>
              <li>
                Package and Ship: Ship the item back to the address provided with the RMA number clearly marked on the outside of the package.
              </li>
            </ol>
            <p className="mt-4 text-sm text-gray-500 italic">
              You will be responsible for paying for your own shipping costs for returning your item unless the return is due to our error (e.g., wrong or defective item).
            </p>
          </section>

          {/* Section 4: Refunds */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              4. Refunds and Exchanges
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Refunds</h3>
            <p className="text-gray-700 mb-4">
              Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 7-10 business days.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Exchanges</h3>
            <p className="text-gray-700">
              We only replace items if they are defective or damaged. If you need to exchange it for the same item, please follow the return process above and indicate the need for an exchange.
            </p>
          </section>
          
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>This policy is subject to change without notice.</p>
        </footer>

      </div>
    </div>
  );
}

export default ReturnPolicy;