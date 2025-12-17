import React from "react";
import { MapPin, Phone, Clock, Shield } from "lucide-react";

const Banner = () => {
  const content = [
    {
      icon: MapPin,
      text: "TIXIMAX LOGISTICS - 65 Đ. 9, Hiệp Bình Phước, Thủ Đức, TP. Hồ Chí Minh",
    },
    { icon: Phone, text: "Hotline: +84 901 834 283" },
    { icon: Clock, text: "Hỗ trợ 24/7" },
    { icon: Shield, text: "An toàn - Nhanh chóng - Uy tín" },
  ];

  // Duplicate content 3 times for seamless infinite scroll
  const duplicatedContent = [...content, ...content, ...content];

  return (
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-3 overflow-hidden relative shadow-md">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent"></div>

      {/* Animated stripes background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-1/4 w-24 h-full bg-yellow-400 transform -skew-x-12 animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-24 h-full bg-yellow-400 transform skew-x-12 animate-pulse"></div>
        </div>
      </div>

      {/* Scrolling content */}
      <div className="relative z-10">
        <div className="flex animate-scroll-banner">
          {duplicatedContent.map((item, index) => (
            <div key={index} className="flex items-center flex-shrink-0 px-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 transform transition-transform hover:scale-110">
                  <item.icon className="w-3.5 h-3.5 text-black" />
                </div>
                <span className="text-sm font-medium text-gray-100 whitespace-nowrap">
                  {item.text}
                </span>
              </div>

              {/* Separator dot */}
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full ml-6 flex-shrink-0"></div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll-banner {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .animate-scroll-banner {
          display: flex;
          animation: scroll-banner 25s linear infinite;
          will-change: transform;
        }
        
        .animate-scroll-banner:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-banner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Banner;
