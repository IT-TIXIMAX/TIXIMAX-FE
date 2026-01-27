// src/Components/Payment/CustomerVoucherPayment.jsx
import React, { useEffect, useMemo, useState } from "react";
import managerPromotionService from "../../Services/Manager/managerPromotionService";
import {
  TicketPercent,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  Info,
} from "lucide-react";

const CustomerVoucherPayment = ({
  accountId,
  disabled = false,
  value = null,
  onChange,
  className = "",
  onLoadingChange,
  onVouchersChange,
  cachedVouchers,
  initialLoading,
}) => {
  const [loading, setLoading] = useState(Boolean(initialLoading));
  const [vouchers, setVouchers] = useState(
    Array.isArray(cachedVouchers) ? cachedVouchers : [],
  );
  const [error, setError] = useState("");

  const id = useMemo(
    () => `customer-voucher-select-${Math.random().toString(16).slice(2)}`,
    [],
  );

  const fetchVouchers = async () => {
    // ✅ Nếu có cached vouchers thì dùng luôn (đồng bộ logic cũ)
    if (cachedVouchers && cachedVouchers.length > 0) {
      setVouchers(cachedVouchers);
      onVouchersChange?.(cachedVouchers);
      setError("");
      setLoading(false);
      onLoadingChange?.(false);
      return;
    }

    if (!accountId) {
      setVouchers([]);
      setError("");
      onVouchersChange?.([]);
      setLoading(false);
      onLoadingChange?.(false);
      return;
    }

    try {
      setLoading(true);
      onLoadingChange?.(true);
      setError("");

      const data =
        await managerPromotionService.getVouchersByCustomer(accountId);
      const arr = Array.isArray(data) ? data : [];
      setVouchers(arr);
      onVouchersChange?.(arr);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể tải danh sách voucher",
      );
      setVouchers([]);
      onVouchersChange?.([]);
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      // giữ đúng behavior cũ nhưng có mounted check
      if (!mounted) return;
      await fetchVouchers();
    };

    run();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, cachedVouchers]);

  const handleSelect = (e) => {
    const raw = e.target.value;
    onChange?.(raw === "" ? null : Number(raw));
  };

  const hasVouchers = vouchers.length > 0;

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-900 flex items-center gap-2"
        ></label>
      </div>

      {/* No account */}
      {!accountId && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-gray-500 mt-0.5" />
          <div>
            <div className="font-semibold text-gray-800">
              Chưa có thông tin tài khoản
            </div>
            <div className="mt-0.5">
              Bạn có thể tiếp tục thanh toán mà không sử dụng voucher.
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {accountId && error && (
        <div
          role="alert"
          className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <div className="text-sm text-red-700">
            <div className="font-semibold">Có lỗi</div>
            <div className="mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Select / Empty */}
      {accountId && !error && (
        <div className="mt-2">
          {!loading && !hasVouchers ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              Không có voucher khả dụng
            </div>
          ) : (
            <div className="relative">
              <select
                id={id}
                value={value ?? ""}
                onChange={handleSelect}
                disabled={disabled || loading}
                className={`w-full appearance-none rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm font-medium text-gray-900 transition
                  border-gray-300 focus:border-blue-500 focus:outline-none
                  disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                `}
              >
                {loading ? (
                  <option>Đang tải danh sách voucher…</option>
                ) : (
                  <>
                    <option value="">— Không sử dụng voucher —</option>
                    {vouchers.map((cv) => {
                      const idVal = cv.customerVoucherId;
                      const code = cv?.voucher?.code || "Mã không rõ";
                      const desc = cv?.voucher?.description || "Không có mô tả";
                      return (
                        <option key={idVal} value={idVal}>
                          {code} — {desc}
                        </option>
                      );
                    })}
                  </>
                )}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerVoucherPayment;
