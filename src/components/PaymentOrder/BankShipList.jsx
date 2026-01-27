// /src/Components/Bank/BankShipList.jsx
import React, { useEffect, useMemo, useState } from "react";
import managerBankAccountService from "../../Services/Manager/managerBankAccountService";
import { CreditCard, AlertTriangle, ChevronDown } from "lucide-react";

const BankShipList = ({
  disabled = false,
  value = null,
  onChange,
  className = "",
  onLoadingChange,
  onAccountsChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");

  const id = useMemo(
    () => `bank-ship-select-${Math.random().toString(16).slice(2)}`,
    [],
  );

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      onLoadingChange?.(true);
      setError("");

      const data = await managerBankAccountService.getRevenueAccounts();
      const arr = Array.isArray(data) ? data : [];
      setAccounts(arr);
      onAccountsChange?.(arr);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Không thể tải danh sách tài khoản nhận cước";
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

  const hasAccounts = accounts.length > 0;

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-900 flex items-center gap-2"
        ></label>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <div className="text-xs text-red-700">
            <div className="font-semibold">Có lỗi</div>
            <div className="mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && !hasAccounts ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Không có tài khoản nhận cước khả dụng
        </div>
      ) : (
        <div className="relative">
          {/* Select */}
          <select
            id={id}
            value={value ?? ""}
            onChange={handleSelect}
            disabled={disabled || loading}
            aria-invalid={Boolean(error)}
            className={`w-full appearance-none rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm font-medium text-gray-900 transition
              ${error ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}
              focus:outline-none
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            `}
          >
            <option value="">— Chưa chọn tài khoản —</option>
            {accounts.map((acc) => {
              const optionValue = String(acc.id);
              const holder = acc.accountHolder || "Chưa rõ tên";
              const number = acc.accountNumber || "—";
              return (
                <option key={optionValue} value={optionValue}>
                  {holder} — {number}
                </option>
              );
            })}
          </select>

          {/* Right icon */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};

export default BankShipList;
