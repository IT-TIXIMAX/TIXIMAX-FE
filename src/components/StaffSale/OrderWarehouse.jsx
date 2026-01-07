import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Package,
  CheckCircle2,
  CircleSlash,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import DomesticService from "../../Services/Warehouse/domesticService";

const STATUS_OPTIONS = {
  CHUA_DU_DIEU_KIEN: {
    label: "Chưa thanh toán vận chuyển",
    color: "bg-blue-50 text-blue-700 ring-blue-200",
    icon: CircleSlash,
    tabActive: "bg-blue-50 text-blue-700 border-blue-600",
    tabHover: "hover:text-blue-700",
    badge: "bg-blue-100 text-blue-800",
  },
  DU_DIEU_KIEN: {
    label: "Đủ điều kiện xuất kho",
    color: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
    tabActive: "bg-emerald-50 text-emerald-700 border-emerald-600",
    tabHover: "hover:text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
  },
};

const Chip = ({ children, tone = "default" }) => {
  const tones = {
    default:
      "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300",
    softBlue: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="border-b">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 w-full max-w-[220px] animate-pulse rounded bg-slate-100" />
        {i === 1 && (
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-100" />
        )}
      </td>
    ))}
  </tr>
);

const EmptyState = ({
  title = "Không có dữ liệu",
  desc = "Thử đổi bộ lọc hoặc tìm kiếm mã khách.",
}) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
      <Package className="h-6 w-6 text-blue-600" />
    </div>
    <div className="mt-4 text-base font-semibold text-slate-900">{title}</div>
    <div className="mt-1 text-sm text-slate-500">{desc}</div>
  </div>
);

const ShipmentChips = ({ codes }) => {
  const list = Array.isArray(codes) ? codes : [];
  const maxShow = 6;

  if (!list.length)
    return <span className="text-sm text-slate-400">Không có</span>;

  const shown = list.slice(0, maxShow);
  const remain = list.length - shown.length;

  return (
    <div className="flex flex-wrap gap-2">
      {shown.map((code, idx) => (
        <Chip key={`${code}-${idx}`}>{code}</Chip>
      ))}
      {remain > 0 && <Chip tone="softBlue">+{remain}</Chip>}
    </div>
  );
};

const Row = ({ row }) => {
  const statusMeta = STATUS_OPTIONS[row.status];

  return (
    <tr className="border-b hover:bg-slate-50/70 transition">
      <td className="px-6 py-4">
        <div className="font-semibold text-slate-900">
          {row.customerCode || "—"}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="font-medium text-slate-900">
          {row.customerName || "—"}
        </div>
        <div className="mt-0.5 text-sm text-slate-500">
          {row.phoneNumber || "—"}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="text-sm text-slate-700 line-clamp-2">
          {row.address || "—"}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="font-medium text-slate-900">{row.staffName || "—"}</div>
        <div className="mt-0.5 text-sm text-slate-500">
          {row.staffCode || "—"}
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
            statusMeta?.color || "bg-slate-50 text-slate-700 ring-slate-200"
          }`}
        >
          {statusMeta?.icon
            ? React.createElement(statusMeta.icon, { className: "h-4 w-4" })
            : null}
          {statusMeta?.label || row.status || "—"}
        </span>
      </td>

      <td className="px-6 py-4">
        <ShipmentChips codes={row.shipmentCode} />
      </td>
    </tr>
  );
};

const OrderWarehouse = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedStatus, setSelectedStatus] = useState("CHUA_DU_DIEU_KIEN");

  // input đang gõ
  const [searchInput, setSearchInput] = useState("");
  // term áp dụng gọi API
  const [searchCode, setSearchCode] = useState("");

  useEffect(() => {
    fetchDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, selectedStatus, searchCode]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);

      const params = { status: selectedStatus };
      if (searchCode) params.customerCode = searchCode;

      const response = await DomesticService.getDeliveryList(
        page,
        rowsPerPage,
        params
      );

      if (response?.content) {
        setDeliveries(response.content);
        setTotalCount(response.totalElements || 0);
      } else {
        setDeliveries(response || []);
        setTotalCount(response?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      const errorMessage =
        error?.response?.data?.error || "Không thể tải danh sách đơn hàng";
      toast.error(errorMessage);
      setDeliveries([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / rowsPerPage)),
    [totalCount, rowsPerPage]
  );

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchCode(searchInput.trim());
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchCode("");
    setPage(0);
  };

  return (
    <div className="min-h-screen ">
      <div className="mx-auto  px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Quản lý đơn hàng kho
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters card */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {/* Tabs */}
          <div className="flex">
            {Object.entries(STATUS_OPTIONS).map(([key, s]) => {
              const active = selectedStatus === key;
              return (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  className={`flex-1 border-b-2 px-6 py-4 text-sm font-semibold transition ${
                    active
                      ? `${s.tabActive}`
                      : `border-transparent text-slate-600 ${s.tabHover}`
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {s.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.badge}`}
                      title="Tổng bản ghi theo bộ lọc hiện tại"
                    >
                      {active ? totalCount : "…"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* ✅ Search (Enter hoặc bấm button đều chạy) */}
              <form onSubmit={handleSearch} className="w-full lg:max-w-xl">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Tìm theo mã khách hàng…"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />

                    {searchInput && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                        aria-label="Xóa tìm kiếm"
                        title="Xóa"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Tìm kiếm"
                  >
                    <Search size={16} />
                    <span className="hidden sm:inline">Tìm kiếm</span>
                  </button>
                </div>
              </form>

              {/* Paging controls */}
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="w-[88px] appearance-none cursor-pointer rounded-xl border border-slate-200 bg-white
               pl-3 pr-9 py-2 text-sm text-slate-900 outline-none transition
               focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Mã KH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    Mã vận đơn
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <tr>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                          Đang tải dữ liệu…
                        </div>
                      </td>
                    </tr>
                  </>
                ) : deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  deliveries.map((row, idx) => <Row key={idx} row={row} />)
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Trang{" "}
              <span className="font-semibold text-slate-700">{page + 1}</span> /{" "}
              <span className="font-semibold text-slate-700">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderWarehouse;
