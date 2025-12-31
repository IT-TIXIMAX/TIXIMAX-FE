// ExportWarehouse.jsx
import React, { useCallback, useState } from "react";
import {
  Warehouse,
  Search,
  Loader2,
  User,
  Phone,
  MapPin,
  BadgeCheck,
  ListOrdered,
  Users,
  IdCard,
  Truck,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import domesticService from "../../Services/Warehouse/domesticService";
import ExportShip from "./ExportShip";
const normalizeArray = (res) => {
  const raw = res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 h-9 w-9 rounded-xl bg-gray-50 ring-1 ring-gray-200 grid place-items-center">
      <Icon className="h-4 w-4 text-gray-500" />
    </div>
    <div className="min-w-0">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900 truncate">
        {value || "—"}
      </div>
    </div>
  </div>
);

const ExportWarehouse = () => {
  const [customerCode, setCustomerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // ✅ Modal export
  const [openExport, setOpenExport] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const fetchPreview = useCallback(async () => {
    const code = customerCode.trim();
    if (!code) return toast.error("Nhập mã khách");

    setLoading(true);
    try {
      const res = await domesticService.previewTransferByCustomer(code);
      const arr = normalizeArray(res);
      setData(arr);
      toast.success("Đã tải preview");
    } catch (e) {
      setData([]);
      toast.error(
        e?.response?.data?.message || e?.message || "Lỗi tải preview"
      );
    } finally {
      setLoading(false);
    }
  }, [customerCode]);

  const openExportModal = useCallback((code) => {
    setSelectedCustomer(code || "");
    setOpenExport(true);
  }, []);

  const closeExportModal = useCallback(() => {
    setOpenExport(false);
    setSelectedCustomer("");
  }, []);

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="no-print bg-blue-600 rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Warehouse size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">Xuất kho</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Search */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden mb-6">
          <div className="p-6 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchPreview()}
                    placeholder="Nhập mã khách hàng"
                    className="w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm outline-none
                               focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <button
                  onClick={fetchPreview}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5
                             text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 mt-2 sm:mt-0 sm:ml-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Kiểm tra
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-4">
          {loading ? (
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tải dữ liệu preview...
              </div>
            </div>
          ) : !data?.length ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <div className="text-gray-900 font-semibold">Chưa có dữ liệu</div>
              <div className="mt-1 text-sm text-gray-500">
                Nhập mã khách và bấm “Kiểm tra” để xem preview.
              </div>
            </div>
          ) : (
            data.map((c, idx) => {
              const list = c?.shippingList || [];
              const count = list.length;

              return (
                <div
                  key={`${c?.customerCode || idx}-${c?.phoneNumber || ""}`}
                  className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    {/* ✅ Action bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        onClick={() => openExportModal(c?.customerCode)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5
                                   text-sm font-semibold text-white hover:bg-red-700"
                      >
                        <Truck className="h-4 w-4" />
                        Xuất kho
                      </button>
                    </div>

                    {/* Customer vs Staff */}
                    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {/* Customer box */}
                      <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                          <div className="h-9 w-9 rounded-xl bg-white ring-1 ring-gray-200 grid place-items-center">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            Thông tin khách hàng
                          </div>
                        </div>

                        <div className="p-4 grid gap-3">
                          <InfoRow
                            icon={User}
                            label="Tên khách"
                            value={c?.customerName}
                          />
                          <InfoRow
                            icon={IdCard}
                            label="Mã khách"
                            value={c?.customerCode}
                          />
                          <InfoRow
                            icon={Phone}
                            label="Số điện thoại"
                            value={c?.phoneNumber}
                          />
                          <InfoRow
                            icon={MapPin}
                            label="Địa chỉ nhận"
                            value={c?.toAddress}
                          />
                        </div>
                      </div>

                      {/* Staff box */}
                      <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                          <div className="h-9 w-9 rounded-xl bg-white ring-1 ring-gray-200 grid place-items-center">
                            <BadgeCheck className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            Thông tin nhân viên
                          </div>
                        </div>

                        <div className="p-4 grid gap-3">
                          <InfoRow
                            icon={User}
                            label="Tên nhân viên"
                            value={c?.staffName}
                          />
                          <InfoRow
                            icon={IdCard}
                            label="Mã nhân viên"
                            value={c?.staffCode}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping list */}
                    <div className="mt-5 rounded-xl bg-gray-50 ring-1 ring-gray-200 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
                          <ListOrdered className="h-4 w-4 text-gray-400" />
                          Danh sách mã vận đơn ({count})
                        </div>
                      </div>

                      {count === 0 ? (
                        <div className="p-4 text-sm text-gray-500">
                          Không có vận đơn.
                        </div>
                      ) : (
                        <div className="overflow-x-auto max-h-[320px] overflow-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="w-16 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  STT
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Mã vận đơn
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {list.map((code, i) => (
                                <tr
                                  key={`${code}-${i}`}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                                    {i + 1}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                                    {code}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/*  Modal ExportShip */}
      {openExport && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeExportModal}
          />

          {/* dialog */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <ExportShip
                customerCode={selectedCustomer}
                onClose={closeExportModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportWarehouse;
