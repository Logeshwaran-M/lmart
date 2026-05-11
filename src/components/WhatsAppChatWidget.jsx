import React from "react";

const WhatsAppChatWidget = () => {
  const whatsappNumber = "918762978777"; // your number
  const defaultMessage = "Hello! I need some help.";

  return (
    <>
      {/* Help & Support Floating Bubble */}
   

        {/* Arrow Pointer */}
         
      
      {/* Floating WhatsApp Button (Attractive Glow) */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
          fixed bottom-6 right-6 
          w-16 h-16 
          rounded-full 
          bg-green-500 text-white 
          shadow-2xl flex items-center justify-center
          hover:scale-110 hover:bg-green-600
          transition-all duration-300 
          animate-glow
          z-50
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg"
             fill="currentColor" viewBox="0 0 24 24"
             className="w-9 h-9">
          <path d="M20.52 3.48A11.78 11.78 0 0012 .25 11.75 11.75 0 00.28 12.07a11.53 11.53 0 001.53 5.74L.25 24l6.33-1.63A11.75 11.75 0 0012 23.75a11.72 11.72 0 008.26-3.42A11.72 11.72 0 0023.75 12a11.72 11.72 0 00-3.23-8.52zM12 21.5a9.42 9.42 0 01-4.81-1.3l-.34-.2-3.76.97 1-3.67-.22-.38A9.48 9.48 0 1121.5 12 9.45 9.45 0 0112 21.5zm5.21-7.11c-.28-.14-1.64-.8-1.89-.89s-.44-.14-.63.14-.72.89-.89 1.07-.33.21-.61.07a7.73 7.73 0 01-2.27-1.4 8.52 8.52 0 01-1.59-1.98c-.17-.3 0-.46.13-.6a5.79 5.79 0 00.4-.47 1 1 0 00.09-.96c-.08-.16-.56-1.36-.76-1.84-.2-.48-.4-.4-.56-.4h-.48c-.16 0-.52.08-.8.36-.28.24-1.04.96-1.04 2.32 0 1.36 1.04 2.68 1.16 2.84.16.2 2.04 3.12 5.04 4.28 2.96 1.12 3.36.88 3.96.84.6-.04 1.96-.8 2.24-1.6.28-.8.28-1.48.2-1.6-.08-.12-.28-.2-.56-.36z" />
        </svg>
      </a>

      {/* Animations */}
      <style>{`
        @keyframes fade-slide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide {
          animation: fade-slide 0.4s ease-out;
        }

        @keyframes glow {
          0% { box-shadow: 0 0 10px rgba(0,255,0,0.5); }
          50% { box-shadow: 0 0 22px rgba(0,255,0,0.9); }
          100% { box-shadow: 0 0 10px rgba(0,255,0,0.5); }
        }
        .animate-glow {
          animation: glow 2s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};

export default WhatsAppChatWidget;
