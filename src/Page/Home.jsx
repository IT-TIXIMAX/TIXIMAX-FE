import React from "react";
import About from "./About";
// import DowApp from "./DowApp";
import SideMenu from "./SideMenu";
import ServicePage from "./ServicePage";
import Feedback from "./Feedback";
import QuestionPage from "./QuestionPage";
import ReasonPage from "./ReasonPage";
// import ProcessPage from "./ProcessPage";
import Service from "./Service";
import PartnerPage from "./PartnerPage";
import PromotionPage from "./PromotionPage";
import ChatBoxList from "./ChatBoxList";
import Vision from "./Navigattion/Vision";
const Home = () => {
  return (
    <div className="bg-white relative overflow-x-hidden">
      {/* Side Menu */}
      <SideMenu />

      {/* About section */}
      <About />

      {/* Service Page section - Dịch vụ quốc tế */}
      <ServicePage />

      {/* About section */}
      <Vision />

      {/* Sẻvice Page section - Quy trình 5 bước */}
      <Service />

      {/* Reason Page section - Lý do chọn TixiMax */}
      <ReasonPage />

      {/* Question Page section - FAQ & Báo giá */}
      <QuestionPage />

      {/* Feedback Page section - Đánh giá khách hàng */}
      <Feedback />

      {/* Partner Page section - FAQ & Báo giá */}
      <PartnerPage />

      {/* Promotion Page section - Khuyến mãi */}
      <PromotionPage />

      {/* DowApp section - Download App */}
      {/* <DowApp /> */}

      {/* Chat hỗ trợ nổi góc phải */}
      <ChatBoxList
        zaloHref="https://zalo.me/84367427630" // chuyển đúng chuẩn định dạng Zalo
        hotlineHref="tel:+84367427630" // click gọi trực tiếp
        onLiveChat={() => alert("Mở hỗ trợ trực tuyến")}
        onAssistant={() => alert("Mở trợ lý mua sắm Tiximax")}
      />
    </div>
  );
};

export default Home;
