import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BarChart2,
  Users,
  CreditCard,
  FileText,
  Speaker,
  ChevronDown,
  List,
  ChartSpline,
  LayoutDashboard,
  ChartNoAxesCombined,
  Warehouse,
  Settings,
  ShoppingCart,
  PackageX,
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
          text: t("Quản lý hiệu suất"),
          icon: <ChartNoAxesCombined />,
          path: "/manager/performance",
        },
        {
          text: t("Quản lý đơn hàng"),
          icon: <ChartSpline />,
          path: "/manager/orders",
        },
        {
          text: t("Quản lý khách hàng"),
          icon: <Users />,
          path: "/manager/customers",
        },
        {
          text: t("Quản lý nhân viên"),
          icon: <List />,
          path: "/manager/staffs",
        },
        {
          text: t("Quản Lý Tài Chính"),
          icon: <BarChart2 />,
          path: "/manager/finance",
        },
        {
          text: t("Quản lý kho"),
          icon: <Warehouse />,
          path: "/manager/warehouse",
        },
        {
          text: t("Quản Lí Mua"),
          icon: <ShoppingCart />,
          path: "/manager/purchase",
        },
        {
          text: t("Kho Quá Hạn"),
          icon: <PackageX />,
          path: "/manager/warehouse-overdue",
        },
        {
          text: t("Thống Kê Kho"),
          icon: <BarChart2 />,
          path: "/manager/warehouse-stats",
        },
      ],
    },
    {
      title: t("Trang"),
      items: [
        {
          text: t("Xác nhận đơn hàng"),
          icon: <FileText />,
          path: "/manager/quote",
        },
        { text: t("Hoàn tiền"), icon: <Speaker />, path: "/manager/refund" },
      ],
    },
    {
      title: t("Quản lý hệ thống"),
      items: [
        {
          text: t("Thanh toán"),
          icon: <CreditCard />,
          hasSubmenu: true,
          isOpen: openCost,
          onToggle: () => setOpenCost(!openCost),
          submenuItems: [
            { text: t("Quản lý thanh toán"), path: "/manager/cost/paybefore" },
            { text: t("Quản lý thu chi"), path: "/manager/settings" },
          ],
        },
        {
          text: t("Thông tin chuyến bay"),
          icon: <List />,
          path: "/manager/flight-list",
        },
        {
          text: t("Cấu hình hệ thống"),
          icon: <Settings />,
          path: "/manager/settings",
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
            className={`flex items-center justify-between w-full px-4 py-3 border-t border-yellow-300 transition-all duration-200 ${
              item.isOpen
                ? "bg-yellow-200 text-black"
                : "bg-amber-50 text-gray-800 hover:bg-yellow-100"
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
              className={`w-4 h-4 transition-transform duration-200 ${item.isOpen ? "rotate-180 text-black" : "text-gray-600"}`}
            />
          </button>
          <div
            className={`transition-all duration-300 ${item.isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
          >
            {item.submenuItems.map((subItem) => (
              <Link
                key={subItem.path}
                to={subItem.path}
                className={`block pl-10 pr-4 py-2.5 text-sm border-t border-yellow-300 transition-all duration-200 ${
                  isActive(subItem.path)
                    ? "bg-yellow-100 text-blue-700 font-semibold"
                    : "bg-amber-50 text-gray-700 hover:bg-yellow-100 font-medium"
                }`}
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
        className={`flex items-center gap-3 px-4 py-3 border-t border-yellow-300 transition-all duration-200 ${
          isActive(item.path)
            ? "bg-yellow-200 text-blue-700 font-semibold"
            : "bg-amber-50 text-gray-800 hover:bg-yellow-100"
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
    <div className="w-64 h-full bg-amber-50 flex flex-col">
      {/* Logo */}
      <div className="flex-shrink-0 bg-yellow-400 border-b-4 border-blue-700 px-5 h-16 flex items-center">
        <Link
          to="/manager/dashboard"
          className="flex items-center gap-2 focus:outline-none"
          aria-label="Về trang dashboard"
        >
          <span className="text-2xl font-black text-blue-800 tracking-tight">
            Tiximax
          </span>
        </Link>
      </div>

      {/* Menu Sections */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {menuSections.map((section) => (
          <div key={section.title}>
            {/* Title full width, không bị giới hạn bởi padding */}
            <div className="bg-yellow-400 border-l-4 border-yellow-400 px-4 py-2">
              <span className="text-xs font-extrabold text-black uppercase tracking-wide">
                {section.title}
              </span>
            </div>
            <div>{section.items.map(renderMenuItem)}</div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t-2 border-black bg-amber-50">
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
