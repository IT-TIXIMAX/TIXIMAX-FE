// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import {
//   BarChart2,
//   Users,
//   UserCheck,
//   CreditCard,
//   Truck,
//   MapPin,
//   Box,
//   Globe,
//   ShoppingCart,
//   FileText,
//   Speaker,
//   ChevronDown,
//   List,
//   Gift,
//   UserRoundPlus,
//   BookKey,
//   ChartSpline,
//   LayoutDashboard,
//   ChartNoAxesCombined,
// } from "lucide-react";
// import Logout from "../../Page/Logout";

// const ManagerSidebar = () => {
//   const { t } = useTranslation();
//   const location = useLocation();
//   const [openCost, setOpenCost] = useState(false);

//   const menuSections = [
//     {
//       title: t("Phân tích & Quản lý"),
//       items: [
//         {
//           text: t("Thống kê"),
//           icon: <LayoutDashboard />,
//           path: "/manager/dashboard",
//         },
//         {
//           text: t("Thống kê chi phí"),
//           icon: <BarChart2 />,
//           path: "/manager/dashboardprofit",
//         },
//         {
//           text: t("Danh sách đơn hàng"),
//           icon: <ShoppingCart />,
//           path: "/manager/order",
//         },
//         {
//           text: t("Hủy đơn hàng"),
//           icon: <ShoppingCart />,
//           path: "/manager/cancelorder",
//         },
//         {
//           text: t("Danh sách nhân viên"),
//           icon: <List />,
//           path: "/manager/team",
//         },
//         {
//           text: t("Hiệu suất nhân viên"),
//           icon: <ChartNoAxesCombined />,
//           path: "/manager/kpistaff",
//         },
//         {
//           text: t("Hiệu suất khách hàng"),
//           icon: <ChartSpline />,
//           path: "/manager/kpicustomer",
//         },
//         {
//           text: t("Danh sách khách hàng"),
//           icon: <Users />,
//           path: "/manager/customers",
//         },
//         {
//           text: t("Cấp quyền"),
//           icon: <BookKey />,
//           path: "/manager/permission",
//         },
//         // {
//         //   text: t("Thành viên"),
//         //   icon: <UserCheck />,
//         //   path: "/manager/stafflead",
//         // },
//         {
//           text: t("Tạo nhân viên"),
//           icon: <UserRoundPlus />,
//           path: "/manager/createstaff",
//         },
//       ],
//     },
//     {
//       title: t("pages"),
//       items: [
//         {
//           text: t("Xác nhận đơn hàng"),
//           icon: <FileText />,
//           path: "/manager/quote",
//         },
//         {
//           text: t("Hoàn tiền"),
//           icon: <Speaker />,
//           path: "/manager/refund",
//         },
//       ],
//     },
//     {
//       title: t("management"),
//       items: [
//         {
//           text: t("Thanh toán"),
//           icon: <CreditCard />,
//           hasSubmenu: true,
//           isOpen: openCost,
//           onToggle: () => setOpenCost(!openCost),
//           submenuItems: [
//             { text: t("Tài khoản ngân hàng"), path: "/manager/cost/paylater" },
//             {
//               text: t("Thanh toán khách hàng"),
//               path: "/manager/cost/paybefore",
//             },
//           ],
//         },
//         {
//           text: t("Tuyến vận chuyển"),
//           icon: <Truck />,
//           path: "/manager/routes",
//         },
//         {
//           text: t("Quản lí tỷ giá"),
//           icon: <FileText />,
//           path: "/manager/exchange-routes",
//         },
//         {
//           text: t("Điểm đến"),
//           icon: <MapPin />,
//           path: "/manager/transfer",
//         },
//         {
//           text: t("Loại sản phẩm"),
//           icon: <Box />,
//           path: "/manager/producttype",
//         },
//         {
//           text: t("Chương trình khuyến mãi"),
//           icon: <Gift />,
//           path: "/manager/promotion",
//         },
//         {
//           text: t("website"),
//           icon: <Globe />,
//           path: "/manager/website",
//         },
//       ],
//     },
//   ];

//   const isActive = (path) => location.pathname.startsWith(path);

//   const renderMenuItem = (item) => {
//     if (item.hasSubmenu) {
//       return (
//         <div key={item.text}>
//           <button
//             onClick={item.onToggle}
//             className={`flex items-center justify-between w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 ${
//               item.isOpen ? "bg-blue-50 dark:bg-blue-900" : ""
//             }`}
//             aria-expanded={item.isOpen}
//             aria-label={`${t("aria.toggle")} ${item.text}`}
//           >
//             <div className="flex items-center gap-3">
//               <span className="text-gray-500 dark:text-gray-400">
//                 {item.icon}
//               </span>
//               <span className="text-sm font-medium">{item.text}</span>
//             </div>
//             <ChevronDown
//               className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
//                 item.isOpen ? "rotate-180" : ""
//               }`}
//             />
//           </button>
//           <div
//             className={`ml-8 mt-1 space-y-1 transition-all duration-300 ${
//               item.isOpen
//                 ? "max-h-96 opacity-100"
//                 : "max-h-0 opacity-0 overflow-hidden"
//             }`}
//           >
//             {item.submenuItems.map((subItem) => (
//               <Link
//                 key={subItem.path}
//                 to={subItem.path}
//                 className={`block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors duration-200 ${
//                   isActive(subItem.path)
//                     ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
//                     : ""
//                 }`}
//                 aria-label={`${t("aria.navigateTo")} ${subItem.text}`}
//               >
//                 {subItem.text}
//               </Link>
//             ))}
//           </div>
//         </div>
//       );
//     }

//     return (
//       <Link
//         key={item.path}
//         to={item.path}
//         className={`flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors duration-200 ${
//           isActive(item.path)
//             ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
//             : ""
//         }`}
//         aria-label={`${t("aria.navigateTo")} ${item.text}`}
//       >
//         <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
//         <span className="text-sm font-medium">{item.text}</span>
//       </Link>
//     );
//   };

//   return (
//     <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-md flex flex-col border-r border-gray-200/60 dark:border-gray-700/60">
//       <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-6">
//         {menuSections.map((section) => (
//           <div key={section.title}>
//             <h2 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//               {section.title}
//             </h2>
//             <div className="space-y-1">{section.items.map(renderMenuItem)}</div>
//           </div>
//         ))}
//       </div>

//       <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60">
//         <Logout
//           className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
//           iconSize={16}
//           buttonText={t("logout")}
//           redirectTo="/signin"
//           useConfirm={true}
//           confirmMessage={t(
//             "confirmLogout",
//             "Bạn có chắc chắn muốn đăng xuất?",
//           )}
//           showIcon={true}
//         />
//       </div>
//     </div>
//   );
// };

// export default ManagerSidebar;

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BarChart2,
  Users,
  UserCheck,
  CreditCard,
  Truck,
  MapPin,
  Box,
  Globe,
  ShoppingCart,
  FileText,
  Speaker,
  ChevronDown,
  List,
  Gift,
  UserRoundPlus,
  BookKey,
  ChartSpline,
  LayoutDashboard,
  ChartNoAxesCombined,
  Warehouse,
  LogOut,
} from "lucide-react";
import Logout from "../../Page/Logout";

const ManagerSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [openCost, setOpenCost] = useState(false);

  const menuSections = [
    {
      title: t("Phân tích & Quản lý"),
      items: [
        {
          text: t("Thống kê"),
          icon: <LayoutDashboard />,
          path: "/manager/dashboard",
        },

        {
          text: t("Danh sách đơn hàng"),
          icon: <ShoppingCart />,
          path: "/manager/order",
        },

        {
          text: t("Danh sách nhân viên"),
          icon: <List />,
          path: "/manager/team",
        },
        {
          text: t("Hiệu suất kho"),
          icon: <Warehouse />,
          path: "/manager/warehouseperformance",
        },
        {
          text: t("Hiệu suất nhân viên"),
          icon: <ChartNoAxesCombined />,
          path: "/manager/kpistaff",
        },
        {
          text: t("Hiệu suất khách hàng"),
          icon: <ChartSpline />,
          path: "/manager/kpicustomer",
        },
        {
          text: t("Danh sách khách hàng"),
          icon: <Users />,
          path: "/manager/customers",
        },
        {
          text: t("Cấp quyền"),
          icon: <BookKey />,
          path: "/manager/permission",
        },
        {
          text: t("Tạo nhân viên"),
          icon: <UserRoundPlus />,
          path: "/manager/createstaff",
        },
        {
          text: t("Thống kê chi phí"),
          icon: <BarChart2 />,
          path: "/manager/profit",
        },
        {
          text: t("Hủy đơn hàng"),
          icon: <ShoppingCart />,
          path: "/manager/cancelorder",
        },
      ],
    },
    {
      title: t("pages"),
      items: [
        {
          text: t("Xác nhận đơn hàng"),
          icon: <FileText />,
          path: "/manager/quote",
        },
        {
          text: t("Hoàn tiền"),
          icon: <Speaker />,
          path: "/manager/refund",
        },
      ],
    },
    {
      title: t("management"),
      items: [
        {
          text: t("Thanh toán"),
          icon: <CreditCard />,
          hasSubmenu: true,
          isOpen: openCost,
          onToggle: () => setOpenCost(!openCost),
          submenuItems: [
            { text: t("Tài khoản ngân hàng"), path: "/manager/cost/paylater" },
            {
              text: t("Thanh toán khách hàng"),
              path: "/manager/cost/paybefore",
            },
          ],
        },
        {
          text: t("Tuyến vận chuyển"),
          icon: <Truck />,
          path: "/manager/routes",
        },
        {
          text: t("Quản lí tỷ giá"),
          icon: <FileText />,
          path: "/manager/exchange-routes",
        },
        {
          text: t("Điểm đến"),
          icon: <MapPin />,
          path: "/manager/transfer",
        },
        {
          text: t("Loại sản phẩm"),
          icon: <Box />,
          path: "/manager/producttype",
        },
        {
          text: t("Chương trình khuyến mãi"),
          icon: <Gift />,
          path: "/manager/promotion",
        },
        {
          text: t("website"),
          icon: <Globe />,
          path: "/manager/website",
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  const renderMenuItem = (item) => {
    if (item.hasSubmenu) {
      return (
        <div key={item.text}>
          <button
            onClick={item.onToggle}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 border-2 ${
              item.isOpen
                ? "bg-yellow-400 text-black border-black shadow-sm"
                : "bg-white text-gray-800 border-transparent hover:bg-gray-100 hover:border-gray-200"
            }`}
            aria-expanded={item.isOpen}
            aria-label={`${t("aria.toggle")} ${item.text}`}
          >
            <div className="flex items-center gap-3">
              <span className={item.isOpen ? "text-black" : "text-gray-600"}>
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.text}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                item.isOpen ? "rotate-180 text-black" : "text-gray-600"
              }`}
            />
          </button>
          <div
            className={`ml-4 mt-1 space-y-1 transition-all duration-300 ${
              item.isOpen
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            {item.submenuItems.map((subItem) => (
              <Link
                key={subItem.path}
                to={subItem.path}
                className={`block px-4 py-2.5 text-sm rounded-lg transition-all duration-200 border-2 ${
                  isActive(subItem.path)
                    ? "bg-yellow-300 text-black border-yellow-600 font-semibold shadow-sm"
                    : "bg-white text-gray-700 border-transparent hover:bg-gray-100 hover:border-gray-200 font-medium"
                }`}
                aria-label={`${t("aria.navigateTo")} ${subItem.text}`}
              >
                {subItem.text}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-2 ${
          isActive(item.path)
            ? "bg-yellow-300 text-black border-black shadow-sm"
            : "bg-white text-gray-800 border-transparent hover:bg-gray-100 hover:border-gray-200"
        }`}
        aria-label={`${t("aria.navigateTo")} ${item.text}`}
      >
        <span className={isActive(item.path) ? "text-black" : "text-gray-600"}>
          {item.icon}
        </span>
        <span className="text-sm font-semibold">{item.text}</span>
      </Link>
    );
  };

  return (
    <div className="w-64 h-full bg-gradient-to-b from-gray-50 to-white flex flex-col border-r-2 border-black shadow-lg">
      {/* Menu Sections */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h2 className="px-3 py-2 text-xs font-bold text-gray-800 uppercase tracking-wide border-l-4 border-yellow-400 bg-gray-100 rounded">
              {section.title}
            </h2>
            <div className="mt-2 space-y-1">
              {section.items.map(renderMenuItem)}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t-2 border-black bg-white">
        <Logout
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-yellow-400 text-black border-[1px] border-black rounded-lg hover:bg-yellow-300 transition-all duration-200 shadow-sm font-semibold"
          iconSize={16}
          buttonText={t("logout")}
          redirectTo="/signin"
          useConfirm={true}
          confirmMessage={t(
            "confirmLogout",
            "Bạn có chắc chắn muốn đăng xuất?",
          )}
          showIcon={true}
        />
      </div>
    </div>
  );
};

export default ManagerSidebar;
