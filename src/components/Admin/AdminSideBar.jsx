import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaUserTie,
  FaClipboardList,
  FaBox,
  FaCog,
  FaSignOutAlt,
  FaChevronRight,
  FaChevronDown,
  FaTruck,
  FaWarehouse,
  FaDollarSign,
  FaFileAlt,
  FaRoute,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaChartBar,
  FaFileInvoiceDollar,
  FaCubes,
  FaExchangeAlt,
  FaHistory,
  FaUserShield,
  FaCalendarAlt,
  FaTachometerAlt,
  FaHandshake,
  FaGasPump,
  FaTools,
  FaTrophy,
  FaUserCircle,
  FaChartPie,
  FaTruckLoading,
  FaListAlt,
  FaUserFriends,
  FaMoneyCheckAlt,
  FaCogs,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import Logout from "../../Page/Logout";
// Configuration-based menu structure
const menuConfig = [
  {
    title: "Tổng quan",
    icon: <FaChartPie />,
    items: [
      {
        text: "Thống kê tổng quan",
        icon: <FaChartLine />,
        path: "/admin/dashboard",
      },
      {
        text: "Thống kê đơn hàng",
        icon: <FaListAlt />,
        path: "/admin/order-analytics",
      },
      {
        text: "Thống kê thanh toán",
        icon: <FaMoneyCheckAlt />,
        path: "/admin/payment-analytics",
      },
      {
        text: "Thống kê kho",
        icon: <FaWarehouse />,
        path: "/admin/warehouse-analytics",
      },
      {
        text: "Thống kê khách hàng",
        icon: <FaUserFriends />,
        path: "/admin/revenue-analytics",
      },
      {
        text: "Trạng thái đơn hàng",
        icon: <FaTachometerAlt />,
        path: "/admin/order-status-overview",
      },
      {
        text: "Chi phí - Lợi nhuận",
        icon: <FaChartBar />,
        path: "/admin/profit-loss",
      },
      {
        text: "KPI Nhân viên",
        icon: <FaTrophy />,
        path: "/admin/employee-kpi",
      },
    ],
  },
  {
    title: "Quản lý Vận chuyển",
    icon: <FaTruckLoading />,
    items: [
      {
        text: "Đơn hàng cần giao",
        icon: <FaClipboardList />,
        path: "/admin/pending-deliveries",
      },
      {
        text: "Theo dõi vận chuyển",
        icon: <FaMapMarkerAlt />,
        path: "/admin/shipment-tracking",
      },
      {
        text: "Quản lý tuyến đường",
        icon: <FaRoute />,
        path: "/admin/route-planning",
      },
      { text: "Quản lý tài xế", icon: <FaUserTie />, path: "/admin/drivers" },
      {
        text: "Quản lý phương tiện",
        icon: <FaTruck />,
        path: "/admin/vehicles",
      },
    ],
  },
  {
    title: "Quản lý Kho",
    icon: <FaWarehouse />,
    items: [
      {
        text: "Tồn kho hiện tại",
        icon: <FaCubes />,
        path: "/admin/inventory",
      },
      {
        text: "Nhập - Xuất hàng",
        icon: <FaExchangeAlt />,
        path: "/admin/warehouse-transactions",
      },
      {
        text: "Vị trí hàng hóa",
        icon: <FaWarehouse />,
        path: "/admin/warehouse-locations",
      },
      {
        text: "Báo cáo hao hụt",
        icon: <FaFileAlt />,
        path: "/admin/inventory-reports",
      },
    ],
  },
  {
    title: "Quản lý Đơn hàng",
    icon: <FaListAlt />,
    items: [
      {
        text: "Tất cả đơn hàng",
        icon: <FaClipboardList />,
        path: "/admin/orders",
      },
      {
        text: "Tạo đơn hàng mới",
        icon: <FaBox />,
        path: "/admin/orders/create",
      },
      {
        text: "Xử lý đơn hàng",
        icon: <FaCog />,
        path: "/admin/order-processing",
      },
      {
        text: "Hỗ trợ khách hàng",
        icon: <FaHandshake />,
        path: "/admin/customer-support",
      },
      {
        text: "Lịch sử đơn hàng",
        icon: <FaHistory />,
        path: "/admin/order-history",
      },
    ],
  },
  {
    title: "Quản lý Nhân sự",
    icon: <FaUserFriends />,
    items: [
      {
        text: "Danh sách nhân viên",
        icon: <FaUsers />,
        path: "/admin/staff",
      },
      {
        text: "Phân ca làm việc",
        icon: <FaCalendarAlt />,
        path: "/admin/work-schedule",
      },
      {
        text: "Hiệu suất nhân viên",
        icon: <FaChartLine />,
        path: "/admin/employee-performance",
      },
      {
        text: "Quản lý quyền hạn",
        icon: <FaUserShield />,
        path: "/admin/user-permissions",
      },
    ],
  },
  {
    title: "Tài chính - Kế toán",
    icon: <FaMoneyCheckAlt />,
    items: [
      {
        text: "Doanh thu - Chi phí",
        icon: <FaDollarSign />,
        path: "/admin/financial-overview",
      },
      {
        text: "Thanh toán COD",
        icon: <FaMoneyBillWave />,
        path: "/admin/cod-payments",
      },
      {
        text: "Công nợ khách hàng",
        icon: <FaFileInvoiceDollar />,
        path: "/admin/customer-debts",
      },
      {
        text: "Báo cáo tài chính",
        icon: <FaFileAlt />,
        path: "/admin/financial-reports",
      },
    ],
  },
  {
    title: "Báo cáo & Phân tích",
    icon: <FaChartPie />,
    items: [
      {
        text: "Hiệu suất giao hàng",
        icon: <FaTachometerAlt />,
        path: "/admin/delivery-performance",
      },
      {
        text: "Chi phí nhiên liệu",
        icon: <FaGasPump />,
        path: "/admin/fuel-analysis",
      },
      {
        text: "Chi phí bảo dưỡng",
        icon: <FaTools />,
        path: "/admin/maintenance-costs",
      },
      {
        text: "Top khách hàng",
        icon: <FaTrophy />,
        path: "/admin/top-customers",
      },
      {
        text: "Xu hướng vận chuyển",
        icon: <FaChartBar />,
        path: "/admin/shipping-trends",
      },
    ],
  },
  {
    title: "Cài đặt",
    icon: <FaCogs />,
    items: [
      { text: "Cài đặt chung", icon: <FaCog />, path: "/admin/settings" },
      {
        text: "Quản lý khách hàng",
        icon: <FaUsers />,
        path: "/admin/customers",
      },
    ],
  },
];

// Custom styles for enhanced title effects
const customStyles = `
  .text-shadow-sm {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  .title-glow {
    box-shadow: 0 0 10px rgba(234, 179, 8, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  .title-divider {
    background: linear-gradient(90deg, transparent, #eab308, transparent);
    height: 1px;
    margin: 8px 0;
    opacity: 0.3;
  }
`;

const AdminSidebar = () => {
  const [expandedSections, setExpandedSections] = useState({
    "Tổng quan": true,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Sync active item with current route
  const activeItem = location.pathname;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Memoized active check function
  const isActive = useCallback((path) => activeItem === path, [activeItem]);

  // Toggle section with keyboard support
  const toggleSection = useCallback((sectionTitle) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  }, []);

  // Handle item click with keyboard support
  const handleItemClick = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Memoized button className generator
  const getButtonClassName = useMemo(() => {
    return (isActiveItem) =>
      `w-full group flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-out text-sm font-medium relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 ${
        isActiveItem
          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-xl"
          : "text-gray-200 hover:text-yellow-300 hover:bg-yellow-500/20 hover:shadow-md"
      }`;
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event, action) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  }, []);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-black via-gray-900 to-black shadow-2xl border-r border-yellow-500/20">
      {/* Top Profile Section */}
      <div className="p-4 border-b border-yellow-500/30 shrink-0 bg-yellow-500/5 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl shadow-md p-3 flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center overflow-hidden border border-yellow-500/30">
            <FaUserCircle className="w-6 h-6 text-yellow-400" />
          </div>
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-300 truncate">
                  Admin User
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <nav
        className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar"
        role="navigation"
        aria-label="Main navigation"
      >
        {menuConfig.map((section, idx) => (
          <div key={idx} className="mb-6">
            {/* Title with enhanced styling */}
            <div className="mb-2">
              <button
                onClick={() => toggleSection(section.title)}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => toggleSection(section.title))
                }
                aria-expanded={expandedSections[section.title]}
                aria-controls={`section-${idx}`}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium uppercase text-gray-200 hover:text-yellow-200 tracking-wider transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-yellow-600/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 border border-transparent hover:border-yellow-500/30 shadow-lg hover:shadow-yellow-500/10 group relative overflow-hidden"
              >
                {/* Background highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>

                {/* Left accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 opacity-60 rounded-r"></div>

                <div className="flex items-center relative z-10">
                  <span className="w-4 h-4 mr-3 text-yellow-400 group-hover:text-yellow-300 transition-all duration-300 drop-shadow-sm">
                    {section.icon}
                  </span>
                  <span className="transition-all duration-300 text-shadow-sm group-hover:text-yellow-100">
                    {section.title}
                  </span>
                </div>

                {/* Right chevron with enhanced styling */}
                <div
                  className={`transition-all duration-300 ease-out relative z-10 group-hover:text-yellow-300 ${
                    expandedSections[section.title]
                      ? "rotate-180 text-yellow-400"
                      : "text-gray-400"
                  }`}
                >
                  <FaChevronDown className="w-3 h-3 drop-shadow-sm" />
                </div>

                {/* Glow effect on expanded */}
                {expandedSections[section.title] && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg shadow-inner border border-yellow-500/20"></div>
                )}
              </button>

              {/* Decorative divider under expanded titles */}
              {expandedSections[section.title] && (
                <div className="title-divider mt-2"></div>
              )}
            </div>

            <div
              id={`section-${idx}`}
              className={`overflow-hidden transition-all duration-500 ease-out ${
                expandedSections[section.title]
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
              aria-hidden={!expandedSections[section.title]}
            >
              <div className="space-y-1 pl-2" role="menu">
                {section.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleItemClick(item.path)}
                    onKeyDown={(e) =>
                      handleKeyDown(e, () => handleItemClick(item.path))
                    }
                    className={getButtonClassName(isActive(item.path))}
                    role="menuitem"
                    aria-current={isActive(item.path) ? "page" : undefined}
                  >
                    <div className="flex items-center flex-1">
                      <span
                        className={`w-4 h-4 mr-3 transition-all duration-300 flex-shrink-0 ${
                          isActive(item.path)
                            ? "text-black"
                            : "text-yellow-400 group-hover:text-yellow-300"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="transition-opacity duration-300 text-left">
                        {item.text}
                      </span>
                    </div>
                    {isActive(item.path) && (
                      <>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity duration-300">
                          <FaChevronRight className="w-3 h-3 text-black/70" />
                        </div>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-r"></div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-yellow-500 shrink-0 bg-yellow-500/5 backdrop-blur-sm">
        <Logout
          useConfirm
          confirmMessage="Bạn có chắc chắn muốn đăng xuất?"
          redirectTo="/signin"
        >
          {({ onLogout, isLoggingOut }) => (
            <button
              onClick={onLogout}
              onKeyDown={(e) => handleKeyDown(e, onLogout)}
              disabled={isLoggingOut}
              className={`w-full group flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black transition-all duration-300 ease-out shadow-lg hover:shadow-xl relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 ${
                isLoggingOut ? "opacity-70 cursor-not-allowed" : ""
              }`}
              aria-label="Đăng xuất khỏi hệ thống"
            >
              <div className="relative flex items-center">
                <FaSignOutAlt className="w-3 h-3 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="font-medium text-xs relative z-10">
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </span>
              </div>
              <div className="absolute inset-0 bg-yellow-200/20 scale-0 group-hover:scale-100 transition-transform duration-300 origin-center rounded-xl"></div>
            </button>
          )}
        </Logout>
      </div>
    </div>
  );

  return (
    <>
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        onKeyDown={(e) => handleKeyDown(e, toggleMobileMenu)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-black/80 text-yellow-400 border border-yellow-500/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
        aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <FaTimes className="w-5 h-5" />
        ) : (
          <FaBars className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 
          w-64 h-screen transition-transform duration-300 ease-in-out
        `}
        role="complementary"
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default AdminSidebar;
