// src/components/AccountSearch.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Search, X, Loader2 } from "lucide-react";
import searchService from "../../Services/SharedService/searchService";

const AccountSearch = ({
  onSelectAccount,
  value = "",
  onChange = () => {},
  onClear = () => {},
  placeholder = "Tìm kiếm hoặc nhập mã khách hàng ...",
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef(null);

  // Sync với value từ props (controlled component)
  useEffect(() => {
    setSearchQuery(value || "");
  }, [value]);

  // Debounce (memo để không tạo mới mỗi render)
  const debounce = useMemo(() => {
    let timeoutId;
    return (func, delay) => {
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
      };
    };
  }, []);

  // Load all accounts khi component mount
  useEffect(() => {
    loadAllAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadAllAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await searchService.getAllAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Không thể tải danh sách tài khoản");
      console.error("Error loading accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter accounts và show dropdown
  const filterAccounts = useCallback(
    (query) => {
      const q = (query || "").trim();
      if (!q) {
        setFilteredAccounts([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
        return;
      }

      const searchTerm = q.toLowerCase();
      const filtered = accounts
        .filter((account) => {
          return (
            (account.customerCode &&
              String(account.customerCode)
                .toLowerCase()
                .includes(searchTerm)) ||
            (account.name &&
              String(account.name).toLowerCase().includes(searchTerm)) ||
            (account.phone &&
              String(account.phone).toLowerCase().includes(searchTerm)) ||
            (account.email &&
              String(account.email).toLowerCase().includes(searchTerm))
          );
        })
        .slice(0, 10);

      setFilteredAccounts(filtered);
      setShowDropdown(true); // show luôn để có thể hiện "Không tìm thấy..."
      setSelectedIndex(filtered.length ? 0 : -1);
    },
    [accounts]
  );

  const debouncedSearch = useCallback(
    debounce((query) => filterAccounts(query), 300),
    [debounce, filterAccounts]
  );

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearchQuery(v);

    // đồng bộ parent
    onChange?.(e);

    debouncedSearch(v);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    const hasItems = filteredAccounts.length > 0;

    switch (e.key) {
      case "ArrowDown":
        if (!hasItems) return;
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredAccounts.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        if (!hasItems) return;
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredAccounts.length - 1
        );
        break;
      case "Enter":
        if (!hasItems) return;
        e.preventDefault();
        if (selectedIndex >= 0)
          handleSelectAccount(filteredAccounts[selectedIndex]);
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSelectAccount = (account) => {
    const display = `${account.customerCode || ""} - ${
      account.name || ""
    }`.trim();
    setSearchQuery(display);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSelectAccount?.(account);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredAccounts([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onClear?.();
  };

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const q = query.trim();
    if (!q) return text;

    const regex = new RegExp(
      `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = String(text).split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 text-yellow-900 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Input (đồng bộ UI với các input khác của bạn) */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />

        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (disabled) return;
            if ((searchQuery || "").trim()) {
              // mở dropdown nếu đang có query (kể cả khi không có kết quả)
              setShowDropdown(true);
              filterAccounts(searchQuery);
            }
          }}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        />

        {/* Loading */}
        {loading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          </div>
        )}

        {/* Clear */}
        {!!searchQuery && !disabled && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
            title="Xóa"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Header nhỏ cho đồng bộ */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
            Gợi ý tìm kiếm khách hàng
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filteredAccounts.length > 0 ? (
              <ul className="py-1">
                {filteredAccounts.map((account, index) => {
                  const active = index === selectedIndex;
                  return (
                    <li
                      key={
                        account.accountId || `${account.customerCode}-${index}`
                      }
                    >
                      <button
                        onClick={() => handleSelectAccount(account)}
                        className={`w-full text-left px-4 py-3 transition-colors ${
                          active ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        type="button"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-blue-700">
                              {account.name
                                ? account.name.charAt(0).toUpperCase()
                                : "N"}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {highlightMatch(
                                  account.customerCode,
                                  searchQuery
                                )}
                              </p>
                              {account.phone && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {highlightMatch(account.phone, searchQuery)}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 truncate">
                              {highlightMatch(
                                account.name || "Chưa có tên",
                                searchQuery
                              )}
                            </p>

                            {(account.email || account.phone) && (
                              <div className="flex items-center gap-3 mt-1">
                                {account.email && (
                                  <span className="text-xs text-gray-500 truncate">
                                    {highlightMatch(account.email, searchQuery)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              (searchQuery || "").trim() && (
                <div className="px-4 py-8 text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <Search className="text-gray-400" size={18} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Không tìm thấy khách hàng
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default AccountSearch;
