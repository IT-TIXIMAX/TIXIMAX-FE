// ManagerLayout.jsx
import React, { useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, ChevronDown, User, LogOut, Menu, X } from "lucide-react";
import { useManagerLayout } from "../../hooks/useManagerLayout";

import ManagerSidebar from "./ManagerSidebar";

const NotificationBell = ({ count, onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="relative p-1 text-blue-100 dark:text-blue-200 hover:text-white dark:hover:text-white hover:bg-blue-500/30 dark:hover:bg-blue-600/40 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 rounded-lg transition-all duration-200"
      aria-label={t("aria.notifications")}
    >
      <Bell className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full shadow-sm"></span>
      )}
    </button>
  );
};

const UserProfileDropdown = ({ isOpen, onToggle, onProfile, onLogout }) => {
  const { t } = useTranslation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center space-x-1.5 p-1 text-base text-white hover:bg-blue-500/30 dark:hover:bg-blue-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-200"
        aria-expanded={isOpen}
        aria-label={t("aria.profileMenu")}
      >
        <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-blue-500 dark:ring-blue-600">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="font-medium text-white text-sm">{t("manager")}</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-blue-200 dark:text-blue-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 z-20 overflow-hidden">
          <div className="py-2">
            <button
              onClick={onProfile}
              className="flex items-center w-full px-4 py-2.5 text-base text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors text-left"
              aria-label={t("aria.profile")}
            >
              <User className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              <span>{t("profile")}</span>
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-600" />
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2.5 text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors text-left"
              aria-label={t("aria.logout")}
            >
              <LogOut className="w-4 h-4 mr-3 text-red-500 dark:text-red-400" />
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ErrorToast = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
      <span>{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-red-700 rounded"
        aria-label="Đóng thông báo lỗi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ManagerLayout = () => {
  const { t } = useTranslation();

  const {
    isSidebarOpen,
    isDropdownOpen,
    notificationCount,
    isLoading,
    error,
    handleProfile,
    handleLogout,
    handleNotificationClick,
    toggleSidebar,
    toggleDropdown,
    clearError,
  } = useManagerLayout();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ErrorToast message={error} onClose={clearError} />

      {/* ===== SIDEBAR - Full height bên trái ===== */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <ManagerSidebar />
        </div>
      </div>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ===== CỘT PHẢI: Header + Content ===== */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 bg-yellow-500 dark:bg-blue-800 shadow-xl border-b-4 border-blue-800 px-4 sm:px-6 py-2 relative z-20 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            {/* Hamburger (mobile only) */}
            <button
              className="p-2 text-white md:hidden focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg"
              onClick={toggleSidebar}
              aria-label={t("aria.toggleSidebar")}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Profile Section */}
            <div className="flex items-center space-x-2 ml-auto">
              <div className="flex items-center space-x-2 bg-amber-500 dark:bg-orange-600 rounded-lg px-2.5 py-1 backdrop-blur-sm">
                <NotificationBell
                  count={notificationCount}
                  onClick={handleNotificationClick}
                />
                <UserProfileDropdown
                  isOpen={isDropdownOpen}
                  onToggle={toggleDropdown}
                  onProfile={handleProfile}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto hide-scrollbar">
            <div className="min-h-full bg-white dark:bg-gray-800 shadow-sm border border-gray-300/60 dark:border-gray-700/60">
              <div className="p-6 sm:p-8">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="w-8 h-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Outlet />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
