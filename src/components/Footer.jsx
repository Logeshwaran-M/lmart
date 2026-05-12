import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/printo.png'
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
 // Importing icons for social media

const Footer = () => {
  // Function to scroll to top when clicking on footer links
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'smooth' for smooth scrolling animation
    });
  };

  // The background color is set to the custom RGB value: bg-[rgb(35,25,85)]
  return (
    <footer className="bg-[rgb(25,35,85)] text-white">
      {/* Reduced vertical padding (py-4) and horizontal padding (px-2 sm:px-4 lg:px-10) */}
      <div className="container-responsive py-4 px-2 sm:px-4 lg:px-10">
        
        {/* Main Grid for 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Reduced gap from gap-8 to gap-6 */}
          
          {/* Company Info - Column 1 */}
          <div className="lg:col-span-1"> 
            <div className="mb-3"> {/* Reduced mb-4 to mb-3 */}
              <img 
                  src={logo} 
                  alt="Lmart Logo" 
                  className="w-20 h-20 object-contain" // Reduced logo size slightly
                />
            </div>
            <p className="text-gray-400 mb-3 max-w-xs text-m"> {/* Reduced mb-4 to mb-3 and text-sm to text-xs */}
              Your trusted partner for all printing needs, office supplies, and digital solutions. 
              We provide high-quality services to help your business grow.
            </p>
            <div className="flex space-x-4 mt-4">
<a
    href="https://x.com/your_username"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="X"
    className="text-gray-400 hover:text-black transition transform hover:scale-125 duration-300"
  >
    <FaXTwitter className="w-6 h-6" />
  </a>

  {/* Instagram */}
  <a
    href="https://www.instagram.com/your_username"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    className="text-gray-400 hover:text-pink-500 transition transform hover:scale-125 duration-300"
  >
    <FaInstagram className="w-6 h-6" />
  </a>

  {/* Facebook */}
  <a
    href="https://www.facebook.com/your_page"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
    className="text-gray-400 hover:text-blue-600 transition transform hover:scale-125 duration-300"
  >
    <FaFacebookF className="w-6 h-6" />
  </a>

  {/* YouTube */}
  <a
    href="https://www.youtube.com/@your_channel"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="YouTube"
    className="text-gray-400 hover:text-red-600 transition transform hover:scale-125 duration-300"
  >
    <FaYoutube className="w-6 h-6" />
  </a>
</div>

          </div>

          {/* Quick Links - Column 2 */}
       <div>
  <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
  <ul className="space-y-2 text-sm">
    <li><Link to="/" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">Home</Link></li>
    <li><Link to="/e-store" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">E-Store</Link></li>
    <li><Link to="/local-market" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">Local Market</Link></li>
    <li><Link to="/Printing" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">Printing</Link></li>
    <li><Link to="/market-news" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">Market News</Link></li>
    <li><Link to="/oldee" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">Oldee</Link></li>
  </ul>
</div>

          
          {/* Useful Links - Column 3 */}
        <div>
  <h3 className="text-lg font-semibold mb-3">Useful Links</h3>
  <ul className="space-y-2 text-sm">
    <li><Link to="/return-policy" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">Return Policy</Link></li>
    <li><Link to="/shipping-policy" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">Shipping Policy</Link></li>
    <li><Link to="/terms-conditions" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">Terms &amp; Conditions</Link></li>
    <li><Link to="/chat-with-us" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">Chat With Us</Link></li>
    <li><Link to="/faqs" onClick={scrollToTop} className="text-gray-400 hover:text-white transition hover:translate-x-1 duration-300 inline-block">FAQs</Link></li>
  </ul>
</div>


          {/* Contact Info - Column 4 */}
          <div>
  <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
  <div className="space-y-2 text-gray-400 text-sm">

    <div className="flex items-start group">
      <svg className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3 group-hover:text-amber-400 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      <span className="group-hover:text-amber-400 transition duration-300">+91-87629 78777</span>
    </div>

    <div className="flex items-start group">
      <svg className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3 group-hover:text-amber-400 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span className="group-hover:text-amber-400 transition duration-300">info@lmart.com</span>
    </div>

    <div className="flex items-start group">
      <svg className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3 group-hover:text-amber-400 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span className="group-hover:text-amber-400 transition duration-300">
        57 Industrial Estate, Sindagi-586 128
      </span>
    </div>

  </div>
</div>

        </div>
        
        {/* Bottom Footer - Copyright */}
        {/* Reduced margin and padding from mt-6 pt-6 to mt-4 pt-4 */}
        <div className="border-t border-gray-800 mt-4 pt-4 text-center text-gray-400">
          <div className="text-center text-xs"> {/* Reduced text-sm to text-xs */}
            <p>&copy; {new Date().getFullYear()} Lmart. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer