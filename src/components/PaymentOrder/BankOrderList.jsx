// /src/Components/Bank/BankOrderList.jsx
import React, { useEffect, useState, useMemo } from "react";
import managerBankAccountService from "../../Services/Manager/managerBankAccountService";
import { Loader2, AlertCircle } from "lucide-react";

const BankOrderList = ({
  disabled = false,
  value = null,
  onChange,
  className = "",
  label = "",
  onLoadingChange,
  onAccountsChange,
  autoSelectFirst = false,
  cachedAccounts = [],
  initialLoading = false,
}) => {
  const [loading, setLoading] = useState(initialLoading);
  const [accounts, setAccounts] = useState(cachedAccounts);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cachedAccounts && cachedAccounts.length > 0) {
      setAccounts(cachedAccounts);
      onAccountsChange?.(cachedAccounts);

      if (autoSelectFirst && !value) {
        onChange?.(String(cachedAccounts[0].id));
      }
    }
  }, [cachedAccounts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(initialLoading);
    onLoadingChange?.(initialLoading);
  }, [initialLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAccounts = async () => {
    if (cachedAccounts && cachedAccounts.length > 0) {
      return;
    }

    try {
      setLoading(true);
      onLoadingChange?.(true);
      setError("");
      const data = await managerBankAccountService.getProxyAccountsV2();
      const arr = Array.isArray(data) ? data : [];
      setAccounts(arr);
      onAccountsChange?.(arr);

      if (autoSelectFirst && arr.length > 0 && !value) {
        onChange?.(String(arr[0].id));
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Không thể tải danh sách tài khoản Proxy";
      setError(msg);
      setAccounts([]);
      onAccountsChange?.([]);
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (e) => {
    const raw = e.target.value;
    onChange?.(raw === "" ? null : raw);
  };

  const id = useMemo(() => "bank-order-select", []);

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          {label}
          {loading && (
            <span className="ml-2 inline-flex items-center text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Đang tải...
            </span>
          )}
        </label>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="mb-3 bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchAccounts}
            className="text-sm font-semibold text-red-700 hover:text-red-900 underline flex-shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty State */}
      {accounts.length === 0 && !loading && !error ? (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-gray-600">
            Không có tài khoản Proxy khả dụng
          </p>
        </div>
      ) : (
        /* Select Dropdown */
        <select
          id={id}
          value={value ?? ""}
          onChange={handleSelect}
          disabled={disabled || loading}
          aria-invalid={Boolean(error)}
          className={`w-full px-4 py-2.5 border-2 rounded-lg font-medium text-gray-900 transition-all
            ${
              disabled || loading
                ? "bg-gray-100 cursor-not-allowed opacity-60"
                : "bg-white hover:border-blue-400 cursor-pointer"
            }
            ${
              error
                ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            }
          `}
        >
          <option value="" className="text-gray-500">
            -- Chọn tài khoản ngân hàng --
          </option>
          {accounts.map((acc) => {
            const optionValue = String(acc.id);
            const holder = acc.accountHolder || "Chưa rõ tên";
            const number = acc.accountNumber || "N/A";
            const bankName = acc.bankName || "";

            return (
              <option key={optionValue} value={optionValue}>
                {holder} • {number}
                {bankName ? ` (${bankName})` : ""}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
};

export default BankOrderList;
