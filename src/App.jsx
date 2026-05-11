import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { WishlistProvider } from './context/WishlistContext';
import WhatsAppChatWidget from './components/WhatsAppChatWidget';
import BuyNow from './Pages/BuyNow';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartNotification from './components/CartNotification';
import LoginModal from './components/LoginModal';
import UserProfile from "./Pages/UserProfile";

import Home from './Pages/Home';
import Printing from './Pages/Printing';
import EMarket from './Pages/EMarket';
import LocalMarket from './Pages/LocalMarket';
import NewsToday from './Pages/NewsToday';
import AdminLogin from './Pages/AdminLogin';
// import AdminDashboard from './Pages/AdminDashboard';
import UserLogin from './Pages/UserLogin';
import UserRegister from './Pages/UserRegister';
import ForgotPassword from './Pages/ForgotPassword';
import Cart from './Pages/Cart';
import Checkout from './Pages/Checkout';
import OrderSuccess from './Pages/OrderSuccess';
import TermsOfService from './Pages/TermsOfService';
import Privacy from './Pages/Privacy';
import Cookie from './Pages/Cookie';
import FileDownloads from './Pages/FileDownloads';
import ProductDetail from './Pages/ProductDetail';
import Contact from './Pages/Contact';
import NotFound from './Pages/NotFound';
import Invoice from './Pages/Invoice';
import SearchResults from './components/SearchResults';

// Policy & Utility Components
import ReturnPolicy from './components/ReturnPolicy';
import ShippingPolicy from './components/ShippingPolicy';
import TermsConditions from './components/TermsConditions';
import ChatWithUs from './components/ChatWithUs';
import FAQs from './components/FAQs';

import MyOrders from './Pages/MyOrders';
import ReturnOrderForm from './Pages/ReturnOrderForm';
import Oldee from './Pages/Oldee';
import WishlistPage from './Pages/WishlistPage';
import MyUploads from './components/MyUploads';

const App = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setShowLoginModal(true);
        localStorage.setItem('hasVisitedBefore', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseModal = () => setShowLoginModal(false);

  return (
    <OrderProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Routes>
              {/* ADMIN ROUTES */}
              <Route path="/admin/login" element={<AdminLogin />} />
              {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}

              {/* USER ROUTES */}
              <Route
                path="/*"
                element={
                  <div className="min-h-screen bg-white flex flex-col">
                    <Navbar />
                    <CartNotification />
                    <LoginModal isOpen={showLoginModal} onClose={handleCloseModal} />



                    <main className="flex-1">
                      <Routes>
                        <Route path="/buy-now" element={<BuyNow />} />

                        <Route path="/" element={<Home />} />
                        <Route path="/Printing" element={<Printing />} />
                        <Route path="/E-Store" element={<EMarket />} />
                        <Route path="/Local-Market" element={<LocalMarket />} />
                        <Route path="/Market-News" element={<NewsToday />} />
                        <Route path="/Oldee" element={<Oldee />} />
                        <Route path="/profile" element={<UserProfile />} />
                        <Route path="/login" element={<UserLogin />} />
                        <Route path="/register" element={<UserRegister />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/my-uploads" element={<MyUploads />} />

                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/order-success" element={<OrderSuccess />} />

                        <Route path="/my-orders" element={<MyOrders />} />
                        <Route path="/return/:orderId" element={<ReturnOrderForm />} />
                        <Route path="/search-results" element={<SearchResults />} />

                        <Route path="/terms-of-service" element={<TermsOfService />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/cookie" element={<Cookie />} />
                        <Route path="/file-downloads" element={<FileDownloads />} />
                        <Route path="/contact" element={<Contact />} />

                        <Route path="/product/:productId" element={<ProductDetail />} />
                        <Route path="/invoice" element={<Invoice />} />

                        <Route path="/return-policy" element={<ReturnPolicy />} />
                        <Route path="/shipping-policy" element={<ShippingPolicy />} />
                        <Route path="/terms-conditions" element={<TermsConditions />} />
                        <Route path="/chat-with-us" element={<ChatWithUs />} />
                        <Route path="/faqs" element={<FAQs />} />

                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <WhatsAppChatWidget />
                    </main>

                    <Footer />
                  </div>
                }
              />
            </Routes>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </OrderProvider>
  );
};

export default App;