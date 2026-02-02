import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Package,
  ArrowDown,
  PackageCheck,
  ClipboardCheck,
  Search,
  FolderSearch,
  FileSpreadsheet,
  User,
  LogOut,
  Download,
  FolderInput,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Shapes,
} from "lucide-react";
import Logout from "../../Page/Logout";
import profileService from "../../Services/SharedService/profileService";

const StaffWarehouseDomesticSidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getCurrentAccount();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);
  const menuItems = [
    {
      text: "Thống kê",
      icon: <BarChart className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/dashboard",
      title: "Xem số liệu tổng quan ",
    },
    {
      text: "Thống kê",
      icon: <BarChart className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/dashboard1",
      title: "Xem số liệu tổng quan ",
    },
    {
      text: "Tồn kho",
      icon: <Package className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/inventory",
      title: "Quản lý hàng tồn kho",
    },

    {
      text: "Nhập kho",
      icon: <ArrowDown className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/imports",
      title: "Quản lý đơn hàng nhập kho",
    },
    {
      text: "Kiểm tra hàng",
      icon: <FolderSearch className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/check",
      title: "Quét mã kiểm tra nhập kho",
    },

    {
      text: "Đơn chờ thanh toán",
      icon: <CreditCard className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/pending-payments",
      title: "Quản lý đơn hàng chưa thanh toán vận chuyển",
    },

    {
      text: "Xuất kho đơn nội địa",
      icon: <FolderInput className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/order-export",
      title: "Quản lý đơn hàng nội địa sẵn sàng giao",
    },
    {
      text: "In mã vận đơn VN POST",
      icon: <FileSpreadsheet className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/reports-vnpost",
      title: "Xem báo cáo thống kê xuất nhập kho",
    },
    {
      text: "Xuất kho đơn vị khác",
      icon: <Shapes className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/order-other",
      title: "Xem báo cáo thống kê xuất nhập kho",
    },
    {
      text: "Tra cứu đơn xuất kho",
      icon: <Search className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/exports",
      title: "Tra cứu theo mã đơn hàng, mã vận đơn",
    },

    {
      text: "Nhập kho đơn US",
      icon: <Download className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/import-sjp",
      title: "Quản lý đơn hàng đang vận chuyển đến kho",
    },
    {
      text: "Kiểm tra đóng gói",
      icon: <ClipboardCheck className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/inventorys-check",
      title:
        "Hỗ trợ kiểm kê định kỳ hoặc đột xuất, quét mã và báo cáo chênh lệch",
    },
    {
      text: "Đơn đủ điều kiện",
      icon: <PackageCheck className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/eligible-exports",
      title: "Quản lý đơn hàng đủ điều kiện xuất kho",
    },
    {
      text: "Kiểm tra",
      icon: <Download className="w-6 h-6" />,
      path: "/staff-warehouse-domestic/report",
      title: "Xem báo cáo thống kê xuất nhập kho",
    },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div
      className={`${
        isExpanded ? "w-72" : "w-20"
      } bg-slate-50 shadow-lg flex flex-col h-screen transition-all duration-300`}
    >
      {/* Toggle Button */}
      <div className="p-1 border-b border-gray-200 flex flex-shrink-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-200 transition-colors"
        >
          {isExpanded ? (
            <>
              <span className="text-sm font-medium text-slate-700 mx-auto">
                Nhân viên kho nội địa
              </span>
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </>
          ) : (
            <ChevronRight className="w-6 h-6 text-slate-600 mx-auto" />
          )}
        </button>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <Link
          to="/staff-warehouse-domestic/profile"
          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors duration-200 ${
            isActive("/staff-warehouse-domestic/profile")
              ? "bg-sky-100 text-sky-700 shadow-sm"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          <User
            className={`w-10 h-10 ${
              isActive("/staff-warehouse-domestic/profile")
                ? "text-sky-600"
                : "text-gray-500"
            }`}
          />
          <span
            className={`text-base font-semibold text-slate-800 text-center whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isExpanded
                ? "opacity-100 max-h-10 translate-y-0"
                : "opacity-0 max-h-0 -translate-y-2"
            }`}
          >
            {profile?.name || "Đang tải..."}
          </span>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto hide-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isExpanded ? item.title : item.text}
            className={`flex items-center py-3 pl-4 pr-4 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors duration-200 ${
              isActive(item.path)
                ? "bg-sky-100 text-sky-700 font-semibold shadow-sm"
                : ""
            }`}
          >
            <span
              className={`flex-shrink-0 w-6 ${
                isActive(item.path) ? "text-sky-600" : "text-gray-500"
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`text-base font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ml-3 ${
                isExpanded
                  ? "opacity-100 max-w-[200px]"
                  : "opacity-0 max-w-0 ml-0"
              }`}
            >
              {item.text}
            </span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0 bg-slate-50 sticky bottom-0">
        <div className="relative w-full">
          <Logout
            className={`relative w-full flex items-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${
              isExpanded ? "justify-start" : "justify-center"
            }`}
            iconSize={20}
            buttonText="" // không hiển thị text mặc định
            redirectTo="/signin"
            showIcon={true}
            useConfirm={true}
            confirmMessage="Bạn có chắc chắn muốn đăng xuất?"
          />
          {isExpanded && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-white">
              Đăng xuất
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffWarehouseDomesticSidebar;
