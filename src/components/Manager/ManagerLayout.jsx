// // ManagerLayout.jsx - FIXED LAZY LOADING
// import React, { useRef, useEffect } from "react";
// import { Outlet } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { Search, Bell, ChevronDown, User, LogOut, Menu, X } from "lucide-react";
// import { useManagerLayout } from "../../hooks/useManagerLayout";

// // Import trực tiếp thay vì lazy load
// import ManagerSidebar from "./ManagerSidebar";

// // SearchBar - Inline component
// const SearchBar = ({
//   query,
//   results,
//   isOpen,
//   onSearch,
//   onSelect,
//   onClear,
//   setIsOpen,
// }) => {
//   const { t } = useTranslation();
//   const searchRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (searchRef.current && !searchRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [setIsOpen]);

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && results.length > 0) {
//       onSelect(results[0]);
//     }
//     if (e.key === "Escape") {
//       onClear();
//     }
//   };

//   return (
//     <div className="relative w-full sm:max-w-md" ref={searchRef}>
//       <input
//         type="text"
//         value={query}
//         onChange={(e) => onSearch(e.target.value)}
//         onKeyDown={handleKeyPress}
//         onFocus={() => results.length > 0 && setIsOpen(true)}
//         placeholder={t("search.placeholder")}
//         className="w-full px-3 py-2 pl-9 pr-3 text-base bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all placeholder-gray-500 dark:placeholder-gray-400 text-gray-700 dark:text-gray-200"
//         aria-label={t("aria.searchFeatures")}
//       />
//       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//         <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
//       </div>

//       {isOpen && (
//         <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
//           {results.length > 0 ? (
//             results.map((feature) => (
//               <button
//                 key={feature.path}
//                 onClick={() => onSelect(feature)}
//                 onMouseDown={(e) => e.preventDefault()}
//                 className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900"
//                 aria-label={`${t("aria.navigateTo")} ${feature.name}`}
//               >
//                 <div className="font-medium text-gray-900 dark:text-gray-100 text-base">
//                   {feature.name}
//                 </div>
//                 <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                   {feature.path}
//                 </div>
//               </button>
//             ))
//           ) : (
//             <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-base">
//               {t("search.noResults")}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // NotificationBell - Inline component
// const NotificationBell = ({ count, onClick }) => {
//   const { t } = useTranslation();
//   return (
//     <button
//       onClick={onClick}
//       className="relative p-1 text-blue-100 dark:text-blue-200 hover:text-white dark:hover:text-white hover:bg-blue-500/30 dark:hover:bg-blue-600/40 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 rounded-lg transition-all duration-200"
//       aria-label={t("aria.notifications")}
//     >
//       <Bell className="w-4 h-4" />
//       {count > 0 && (
//         <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full shadow-sm"></span>
//       )}
//     </button>
//   );
// };

// // UserProfileDropdown - Inline component
// const UserProfileDropdown = ({ isOpen, onToggle, onProfile, onLogout }) => {
//   const { t } = useTranslation();
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         onToggle();
//       }
//     };
//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//       return () =>
//         document.removeEventListener("mousedown", handleClickOutside);
//     }
//   }, [isOpen, onToggle]);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={onToggle}
//         className="flex items-center space-x-1.5 p-1 text-base text-white hover:bg-blue-500/30 dark:hover:bg-blue-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-200"
//         aria-expanded={isOpen}
//         aria-label={t("aria.profileMenu")}
//       >
//         <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-blue-500 dark:ring-blue-600">
//           <User className="w-4 h-4 text-white" />
//         </div>
//         <div className="text-left hidden sm:block">
//           <div className="font-medium text-white text-sm">{t("manager")}</div>
//         </div>
//         <ChevronDown
//           className={`w-4 h-4 text-blue-200 dark:text-blue-300 transition-transform duration-200 ${
//             isOpen ? "rotate-180" : ""
//           }`}
//         />
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 z-20 overflow-hidden">
//           <div className="py-2">
//             <button
//               onClick={onProfile}
//               className="flex items-center w-full px-4 py-2.5 text-base text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors text-left"
//               aria-label={t("aria.profile")}
//             >
//               <User className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
//               <span>{t("profile")}</span>
//             </button>
//             <hr className="my-1 border-gray-200 dark:border-gray-600" />
//             <button
//               onClick={onLogout}
//               className="flex items-center w-full px-4 py-2.5 text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors text-left"
//               aria-label={t("aria.logout")}
//             >
//               <LogOut className="w-4 h-4 mr-3 text-red-500 dark:text-red-400" />
//               <span>{t("logout")}</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ErrorToast - Inline component
// const ErrorToast = ({ message, onClose }) => {
//   useEffect(() => {
//     if (message) {
//       const timer = setTimeout(onClose, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [message, onClose]);

//   if (!message) return null;

//   return (
//     <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
//       <span>{message}</span>
//       <button
//         onClick={onClose}
//         className="p-1 hover:bg-red-700 rounded"
//         aria-label="Đóng thông báo lỗi"
//       >
//         <X className="w-4 h-4" />
//       </button>
//     </div>
//   );
// };

// // Main ManagerLayout Component
// const ManagerLayout = () => {
//   const { t } = useTranslation();

//   const {
//     isSidebarOpen,
//     isDropdownOpen,
//     notificationCount,
//     searchQuery,
//     searchResults,
//     showSearchDropdown,
//     isLoading,
//     error,
//     handleSearch,
//     handleSearchSelect,
//     clearSearch,
//     handleLogoClick,
//     handleProfile,
//     handleLogout,
//     handleNotificationClick,
//     toggleSidebar,
//     toggleDropdown,
//     setShowSearchDropdown,
//     clearError,
//   } = useManagerLayout();

//   return (
//     <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
//       {/* Error Toast */}
//       <ErrorToast message={error} onClose={clearError} />

//       {/* Header Bar - Fixed height */}
//       <header className="flex-shrink-0 bg-blue-600 dark:bg-blue-800 shadow-xl border-b border-blue-700/50 px-4 sm:px-6 py-2 relative z-20">
//         <div className="flex items-center justify-between h-12">
//           {/* Logo & Hamburger */}
//           <div className="flex items-center w-auto sm:w-64 justify-start">
//             <button
//               className="p-2 text-white md:hidden focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg"
//               onClick={toggleSidebar}
//               aria-label={t("aria.toggleSidebar")}
//             >
//               <Menu className="w-5 h-5" />
//             </button>
//             <button
//               onClick={handleLogoClick}
//               className="flex items-center p-1.5 ml-2 sm:ml-4 focus:outline-none"
//               aria-label={t("aria.goToDashboard")}
//             >
//               <h1 className="text-xl font-bold text-white">Tiximax</h1>
//             </button>
//           </div>

//           {/* Search */}
//           <div className="flex-1 flex justify-center px-4 sm:px-16">
//             <SearchBar
//               query={searchQuery}
//               results={searchResults}
//               isOpen={showSearchDropdown}
//               onSearch={handleSearch}
//               onSelect={handleSearchSelect}
//               onClear={clearSearch}
//               setIsOpen={setShowSearchDropdown}
//             />
//           </div>

//           {/* Profile Section */}
//           <div className="flex items-center space-x-2 w-auto sm:w-64 justify-center">
//             <div className="flex items-center space-x-2 bg-blue-500/20 dark:bg-blue-700/30 rounded-lg px-2.5 py-1 backdrop-blur-sm">
//               <NotificationBell
//                 count={notificationCount}
//                 onClick={handleNotificationClick}
//               />
//               <UserProfileDropdown
//                 isOpen={isDropdownOpen}
//                 onToggle={toggleDropdown}
//                 onProfile={handleProfile}
//                 onLogout={handleLogout}
//               />
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Container cho Sidebar và Main Content */}
//       <div className="flex flex-1 min-h-0">
//         {/* Sidebar - ✅ Không còn Suspense */}
//         <div
//           className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-sm transform ${
//             isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//           } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
//         >
//           <div className="flex-1 overflow-y-auto hide-scrollbar">
//             <ManagerSidebar />
//           </div>
//         </div>

//         {/* Overlay cho sidebar trên mobile */}
//         {isSidebarOpen && (
//           <div
//             className="fixed inset-0 bg-black/50 z-20 md:hidden"
//             onClick={toggleSidebar}
//           ></div>
//         )}

//         {/* Main Content Area */}
//         <main className="flex-1 min-w-0 overflow-hidden">
//           <div className="h-full overflow-y-auto hide-scrollbar ">
//             <div className="min-h-full bg-white dark:bg-gray-800 shadow-sm border border-gray-300/60 dark:border-gray-700/60">
//               <div className="p-6 sm:p-8">
//                 {isLoading ? (
//                   <div className="flex justify-center items-center h-32">
//                     <div className="w-8 h-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
//                   </div>
//                 ) : (
//                   <Outlet />
//                 )}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default ManagerLayout;

// ManagerLayout.jsx - REMOVED SEARCH COMPLETELY
import React, { useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, ChevronDown, User, LogOut, Menu, X } from "lucide-react";
import { useManagerLayout } from "../../hooks/useManagerLayout";

// Import trực tiếp thay vì lazy load
import ManagerSidebar from "./ManagerSidebar";

// NotificationBell - Inline component
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

// UserProfileDropdown - Inline component
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
          className={`w-4 h-4 text-blue-200 dark:text-blue-300 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
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

// ErrorToast - Inline component
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

// Main ManagerLayout Component
const ManagerLayout = () => {
  const { t } = useTranslation();

  const {
    isSidebarOpen,
    isDropdownOpen,
    notificationCount,
    isLoading,
    error,
    handleLogoClick,
    handleProfile,
    handleLogout,
    handleNotificationClick,
    toggleSidebar,
    toggleDropdown,
    clearError,
  } = useManagerLayout();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Error Toast */}
      <ErrorToast message={error} onClose={clearError} />

      {/* Header Bar - Fixed height */}
      {/* <header className="flex-shrink-0 bg-blue-600 dark:bg-blue-800 shadow-xl border-b border-blue-700/50 px-4 sm:px-6 py-2 relative z-20"> */}
      <header className="flex-shrink-0 bg-yellow-500 dark:bg-blue-800 shadow-xl border-b border-black px-4 sm:px-6 py-2 relative z-20">
        <div className="flex items-center justify-between h-12">
          {/* Logo & Hamburger */}
          <div className="flex items-center w-auto sm:w-64 justify-start">
            <button
              className="p-2 text-white md:hidden focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg"
              onClick={toggleSidebar}
              aria-label={t("aria.toggleSidebar")}
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogoClick}
              className="flex items-center p-1.5 ml-2 sm:ml-4 focus:outline-none"
              aria-label={t("aria.goToDashboard")}
            >
              <h1 className="text-xl font-bold text-black">Tiximax</h1>
            </button>
          </div>

          {/* (REMOVED) Search area */}

          {/* Profile Section */}
          <div className="flex items-center space-x-2 w-auto sm:w-64 justify-end">
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

      {/* Container cho Sidebar và Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-sm transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
        >
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <ManagerSidebar />
          </div>
        </div>

        {/* Overlay cho sidebar trên mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-hidden">
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
