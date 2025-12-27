import React from "react";
import { ArrowRight, Award, Clock, Shield, Users } from "lucide-react";
import BannerWebsite2 from "../assets/BannerWebsite2.png"; // Giữ lại import của bạn

const About = () => {
  return (
    <section className="relative w-full overflow-hidden">
      <img
        src={BannerWebsite2}
        alt="Banner"
        className="w-full h-auto" // ✅ Giữ nguyên tỷ lệ ảnh
      />
    </section>
  );
};

export default About;

// const About = () => {
//   return (
//     <section className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden bg-gray-100">
//       <img
//         src={BannerWebsite2}
//         alt="Banner"
//         className="w-full h-full object-contain" // ✅ Hiển thị full ảnh
//       />
//     </section>
//   );
// };
