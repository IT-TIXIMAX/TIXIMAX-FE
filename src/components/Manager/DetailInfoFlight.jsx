// src/Pages/Manager/Flight/DetailInfoFlight.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  Loader2,
  Download,
  FileText,
  BadgeCheck,
  BadgeX,
  Trash2,
  AlertTriangle,
  Edit,
} from "lucide-react";
import UpdateFlightInfor from "./UpdateFlightInfor";

const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("vi-VN", { hour12: false });
};

const money = (n) => {
  const v = Number(n || 0);
  return Number.isFinite(v) ? v.toLocaleString("en-US") : "0";
};

const isUrlLike = (s) => /^https?:\/\//i.test(String(s || "").trim());

const DetailInfoFlight = ({
  open,
  onClose,
  loading,
  error,
  data,
  onDelete,
  onUpdate, // ✅ Thêm callback để refresh data sau khi update
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false); // ✅ State cho update modal

  if (!open) return null;

  const files = data
    ? [
        { label: "AWB File", value: data.awbFilePath },
        { label: "Invoice File", value: data.invoiceFilePath },
        { label: "Export License", value: data.exportLicensePath },
        { label: "Single Invoice", value: data.singleInvoicePath },
        { label: "Packing List", value: data.packingListPath },
      ].filter((x) => x.value)
    : [];

  const handleDownloadFile = (url, filename) => {
    if (!isUrlLike(url)) {
      toast.error("URL không hợp lệ!");
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "download";
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Đang tải ${filename}...`);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!data?.flightShipmentId) return;

    try {
      setDeleting(true);
      await onDelete(data.flightShipmentId);
      toast.success("Xóa chuyến bay thành công!");
      setShowDeleteConfirm(false);
      onClose();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Lỗi xóa chuyến bay";
      toast.error(msg);
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Handle update
  const handleUpdateSuccess = (updatedData) => {
    setShowUpdate(false);
    if (onUpdate) {
      onUpdate(updatedData);
    }
  };

  const handleUpdateCancel = () => {
    setShowUpdate(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h3 className="text-xl font-bold">
              Chi tiết chuyến bay{" "}
              {data?.flightCode ? `- ${data.flightCode}` : ""}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                <p className="text-slate-600">Đang tải chi tiết...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-6 text-center text-red-700">
                {error}
              </div>
            ) : !data ? (
              <div className="text-center py-12 text-slate-500">
                Không có dữ liệu.
              </div>
            ) : (
              <>
                {/* Thông tin cơ bản */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b-2 border-blue-500">
                    Thông tin cơ bản
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard
                      label="ID Chuyến bay"
                      value={data.flightShipmentId}
                    />
                    <InfoCard label="Mã chuyến bay" value={data.flightCode} />
                    <InfoCard label="Trạng thái" value={data.status} />
                    <InfoCard label="Nhân viên" value={data.staffName} />
                    <InfoCard
                      label="Ngày đến"
                      value={fmtDateTime(data.arrivalDate)}
                    />
                    <InfoCard
                      label="Ngày tạo"
                      value={fmtDateTime(data.createdAt)}
                    />
                  </div>
                </div>

                {/* Số liệu thống kê */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b-2 border-green-500">
                    Số liệu thống kê
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Số lượng kho"
                      value={Number(
                        data.numberOfWarehouses || 0,
                      ).toLocaleString("vi-VN")}
                      color="blue"
                    />
                    <StatCard
                      label="Tổng khối lượng"
                      value={`${Number(data.totalVolumeWeight || 0).toLocaleString("vi-VN")} kg`}
                      color="purple"
                    />
                    <StatCard
                      label="Tổng chi phí"
                      value={`${money(data.totalCost)} VNĐ`}
                      color="orange"
                    />
                    <StatCard
                      label="Lợi nhuận"
                      value={`${money(data.grossProfit)} VNĐ`}
                      color={
                        Number(data.grossProfit || 0) >= 0 ? "green" : "red"
                      }
                    />
                  </div>
                </div>

                {/* Chi phí chi tiết */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b-2 border-purple-500">
                    Chi phí chi tiết
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CostCard
                      label="Chi phí gốc/Kg"
                      value={`${money(data.originCostPerKg)} VNĐ`}
                    />
                    <CostCard
                      label="Chi phí vận chuyển HK"
                      value={`${money(data.airFreightCost)} VNĐ`}
                    />
                    <CostCard
                      label="Chi phí thông quan"
                      value={`${money(data.customsClearanceCost)} VNĐ`}
                    />
                    <CostCard
                      label="Chi phí vận chuyển sân bay"
                      value={`${money(data.airportShippingCost)} VNĐ`}
                    />
                    <CostCard
                      label="Chi phí khác"
                      value={`${money(data.otherCosts)} VNĐ`}
                    />
                  </div>
                </div>

                {/* Trạng thái thanh toán */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b-2 border-yellow-500">
                    Trạng thái thanh toán
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PaymentCard
                      title="Thanh toán vận chuyển hàng không"
                      paid={data.airFreightPaid}
                      paidDate={data.airFreightPaidDate}
                    />
                    <PaymentCard
                      title="Thanh toán hải quan"
                      paid={data.customsPaid}
                      paidDate={data.customsPaidDate}
                    />
                  </div>
                </div>

                {/* Tệp đính kèm */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b-2 border-indigo-500">
                    Tệp đính kèm
                  </h4>
                  {files.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                      Không có tệp đính kèm
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {files.map((f, idx) => {
                        const url = String(f.value);
                        const clickable = isUrlLike(url);
                        const filename =
                          f.label.replace(/\s+/g, "_") +
                          "_" +
                          (data.flightCode || "flight");

                        return clickable ? (
                          <button
                            key={idx}
                            onClick={() => handleDownloadFile(url, filename)}
                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 text-blue-700 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <span className="font-medium">{f.label}</span>
                            </div>
                            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                          </button>
                        ) : (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5" />
                              <span>{f.label}</span>
                            </div>
                            <span className="text-xs">Không khả dụng</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between">
            <div className="flex gap-3">
              {/* ✅ Button Chỉnh sửa */}
              <button
                onClick={() => setShowUpdate(true)}
                disabled={loading || !data}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={loading || !data}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Update Modal */}
      {showUpdate && data && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="relative w-full max-w-7xl my-8">
            <button
              onClick={handleUpdateCancel}
              className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gray-50 rounded-2xl shadow-2xl">
              <UpdateFlightInfor
                initialData={data}
                onSuccess={handleUpdateSuccess}
                onCancel={handleUpdateCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-red-600 text-white">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Xác nhận xóa</h3>
            </div>

            <div className="p-6">
              <p className="text-slate-700 mb-2">
                Bạn có chắc chắn muốn xóa chuyến bay này không?
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-600">Mã chuyến bay:</span>
                  <span className="font-semibold text-slate-800">
                    {data?.flightCode}
                  </span>
                  <span className="text-slate-600">ID:</span>
                  <span className="font-semibold text-slate-800">
                    {data?.flightShipmentId}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Xác nhận xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper Components
const InfoCard = ({ label, value }) => (
  <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
    <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
    <div className="text-sm font-semibold text-slate-800">{value ?? "-"}</div>
  </div>
);

const StatCard = ({ label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    red: "bg-red-50 border-red-200 text-red-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div className={`rounded-lg px-4 py-3 border ${colorClasses[color]}`}>
      <div className="text-xs font-medium mb-1 opacity-75">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
};

const CostCard = ({ label, value }) => (
  <div className="bg-white rounded-lg px-4 py-3 border border-slate-200 shadow-sm">
    <div className="text-sm text-slate-600 mb-1">{label}</div>
    <div className="text-base font-semibold text-slate-800">{value}</div>
  </div>
);

const PaymentCard = ({ title, paid, paidDate }) => (
  <div
    className={`rounded-lg px-4 py-4 border-2 ${
      paid ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
    }`}
  >
    <div className="font-semibold text-slate-800 mb-3">{title}</div>
    <div className="flex items-center gap-2 mb-2">
      {paid ? (
        <BadgeCheck className="w-5 h-5 text-green-600" />
      ) : (
        <BadgeX className="w-5 h-5 text-red-600" />
      )}
      <span
        className={`font-medium ${paid ? "text-green-700" : "text-red-700"}`}
      >
        {paid ? "Đã thanh toán" : "Chưa thanh toán"}
      </span>
    </div>
    {paid && (
      <div className="text-sm text-slate-600 ml-7">
        Ngày TT: {fmtDateTime(paidDate)}
      </div>
    )}
  </div>
);

export default DetailInfoFlight;
