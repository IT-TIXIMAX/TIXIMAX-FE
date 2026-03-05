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
  Plane,
  Package,
  TrendingUp,
  BarChart3,
  DollarSign,
  Calendar,
  User,
  Hash,
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
  onUpdate,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

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
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateSuccess = (updatedData) => {
    setShowUpdate(false);
    if (onUpdate) onUpdate(updatedData);
  };

  const grossProfitNum = Number(data?.grossProfit || 0);

  return (
    <>
      {/* ── Main Modal ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header — đồng bộ gradient blue */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {showUpdate
                    ? `Cập nhật chuyến bay${data?.flightCode ? ` — ${data.flightCode}` : ""}`
                    : `Chi tiết chuyến bay${data?.flightCode ? ` — ${data.flightCode}` : ""}`}
                </h3>
                <p className="text-blue-100 text-sm font-medium mt-0.5">
                  {showUpdate
                    ? "Chỉnh sửa thông tin chuyến bay"
                    : "Thông tin đầy đủ về chuyến bay"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* ── Inline Update Form ── */}
            {showUpdate && data ? (
              <UpdateFlightInfor
                initialData={data}
                onSuccess={handleUpdateSuccess}
                onCancel={() => setShowUpdate(false)}
              />
            ) : (
              <div className="p-6 space-y-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600 font-medium">
                      Đang tải chi tiết...
                    </p>
                  </div>
                ) : error ? (
                  <div className="rounded-xl bg-red-50 border-2 border-red-200 px-4 py-6 text-center text-red-700 font-medium">
                    {error}
                  </div>
                ) : !data ? (
                  <div className="text-center py-16">
                    <div className="p-4 bg-gray-100 rounded-full inline-flex mb-3">
                      <Plane className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      Không có dữ liệu
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ── Stat Cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-blue-700" />
                            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                              SL kho
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-blue-700">
                            {Number(
                              data.numberOfWarehouses || 0,
                            ).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-md border border-purple-100 overflow-hidden">
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-purple-700" />
                            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                              Khối lượng
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-purple-700">
                            {Number(data.totalVolumeWeight || 0).toLocaleString(
                              "vi-VN",
                            )}
                            <span className="text-sm font-medium ml-1">kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-orange-700" />
                            <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                              Tổng chi phí
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-orange-700">
                            {money(data.totalCost)}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`bg-white rounded-xl shadow-md overflow-hidden border ${grossProfitNum >= 0 ? "border-emerald-100" : "border-red-100"}`}
                      >
                        <div
                          className={`p-4 bg-gradient-to-br ${grossProfitNum >= 0 ? "from-emerald-50 to-emerald-100" : "from-red-50 to-red-100"}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp
                              className={`w-4 h-4 ${grossProfitNum >= 0 ? "text-emerald-700" : "text-red-600"}`}
                            />
                            <span
                              className={`text-xs font-semibold uppercase tracking-wide ${grossProfitNum >= 0 ? "text-emerald-700" : "text-red-600"}`}
                            >
                              Lợi nhuận
                            </span>
                          </div>
                          <div
                            className={`text-2xl font-bold ${grossProfitNum >= 0 ? "text-emerald-700" : "text-red-600"}`}
                          >
                            {grossProfitNum >= 0 ? "+" : ""}
                            {money(data.grossProfit)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Thông tin cơ bản ── */}
                    <SectionBlock
                      title="Thông tin cơ bản"
                      icon={<Plane className="w-5 h-5 text-white" />}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <InfoRow
                          icon={<Hash className="w-4 h-4" />}
                          label="ID Chuyến bay"
                          value={data.flightShipmentId}
                        />
                        <InfoRow
                          icon={<Plane className="w-4 h-4" />}
                          label="Mã chuyến bay"
                          value={data.flightCode}
                          highlight
                        />
                        <InfoRow
                          icon={<BarChart3 className="w-4 h-4" />}
                          label="Trạng thái"
                          value={data.status}
                        />
                        <InfoRow
                          icon={<User className="w-4 h-4" />}
                          label="Nhân viên"
                          value={data.staffName}
                        />
                        <InfoRow
                          icon={<Calendar className="w-4 h-4" />}
                          label="Ngày đến"
                          value={fmtDateTime(data.arrivalDate)}
                        />
                        <InfoRow
                          icon={<Calendar className="w-4 h-4" />}
                          label="Ngày tạo"
                          value={fmtDateTime(data.createdAt)}
                        />
                      </div>
                    </SectionBlock>

                    {/* ── Chi phí chi tiết ── */}
                    <SectionBlock
                      title="Chi phí chi tiết"
                      icon={<DollarSign className="w-5 h-5 text-white" />}
                      accentColor="orange"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <CostRow
                          label="Chi phí gốc / Kg"
                          value={`${money(data.originCostPerKg)} VNĐ`}
                        />
                        <CostRow
                          label="Chi phí vận chuyển HK"
                          value={`${money(data.airFreightCost)} VNĐ`}
                        />
                        <CostRow
                          label="Chi phí thông quan"
                          value={`${money(data.customsClearanceCost)} VNĐ`}
                        />
                        <CostRow
                          label="Chi phí vận chuyển sân bay"
                          value={`${money(data.airportShippingCost)} VNĐ`}
                        />
                        <CostRow
                          label="Chi phí khác"
                          value={`${money(data.otherCosts)} VNĐ`}
                        />
                      </div>
                    </SectionBlock>

                    {/* ── Trạng thái thanh toán ── */}
                    <SectionBlock
                      title="Trạng thái thanh toán"
                      icon={<BadgeCheck className="w-5 h-5 text-white" />}
                      accentColor="emerald"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PaymentCard
                          title="Vận chuyển hàng không"
                          paid={data.airFreightPaid}
                          paidDate={data.airFreightPaidDate}
                        />
                        <PaymentCard
                          title="Hải quan"
                          paid={data.customsPaid}
                          paidDate={data.customsPaidDate}
                        />
                      </div>
                    </SectionBlock>

                    {/* ── Tệp đính kèm ── */}
                    <SectionBlock
                      title="Tệp đính kèm"
                      icon={<FileText className="w-5 h-5 text-white" />}
                      accentColor="purple"
                    >
                      {files.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="p-3 bg-gray-100 rounded-full inline-flex mb-2">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium">
                            Không có tệp đính kèm
                          </p>
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
                                onClick={() =>
                                  handleDownloadFile(url, filename)
                                }
                                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 text-blue-700 transition-all group"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-sm">
                                    {f.label}
                                  </span>
                                </div>
                                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                              </button>
                            ) : (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="w-4 h-4" />
                                  <span className="text-sm">{f.label}</span>
                                </div>
                                <span className="text-xs">Không khả dụng</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </SectionBlock>
                  </>
                )}
              </div>
            )}{" "}
            {/* end showUpdate ternary */}
          </div>
          {/* Footer — hidden while editing */}
          {!showUpdate && (
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200 flex justify-between items-center flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpdate(true)}
                  disabled={loading || !data}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading || !data}
                  className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors"
              >
                Đóng
              </button>
            </div>
          )}{" "}
          {/* end !showUpdate */}
        </div>
      </div>

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Xác nhận xóa</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700 font-medium mb-4">
                Bạn có chắc chắn muốn xóa chuyến bay này không? Hành động này
                không thể hoàn tác.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-600 font-medium">
                    Mã chuyến bay:
                  </span>
                  <span className="font-semibold text-blue-700">
                    {data?.flightCode}
                  </span>
                  <span className="text-gray-600 font-medium">ID:</span>
                  <span className="font-semibold text-gray-800">
                    {data?.flightShipmentId}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg border-2 border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-gray-700 font-semibold text-sm transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-md"
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

// ── Sub-components ──

const accentMap = {
  blue: {
    icon: "bg-blue-600",
    border: "border-blue-200",
    title: "text-blue-900",
  },
  orange: {
    icon: "bg-orange-500",
    border: "border-orange-200",
    title: "text-orange-900",
  },
  emerald: {
    icon: "bg-emerald-600",
    border: "border-emerald-200",
    title: "text-emerald-900",
  },
  purple: {
    icon: "bg-purple-600",
    border: "border-purple-200",
    title: "text-purple-900",
  },
};

const SectionBlock = ({ title, icon, accentColor = "blue", children }) => {
  const c = accentMap[accentColor] || accentMap.blue;
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div
        className={`px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b ${c.border} flex items-center gap-3`}
      >
        <div className={`p-2 rounded-lg ${c.icon}`}>{icon}</div>
        <h4 className={`text-base font-bold ${c.title}`}>{title}</h4>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const InfoRow = ({ icon, label, value, highlight }) => (
  <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
    <div className="flex items-center gap-1.5 mb-1 text-gray-500">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
    <div
      className={`text-sm font-semibold ${highlight ? "text-blue-700" : "text-gray-800"}`}
    >
      {value ?? "-"}
    </div>
  </div>
);

const CostRow = ({ label, value }) => (
  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
      {label}
    </div>
    <div className="text-sm font-semibold text-gray-900">{value}</div>
  </div>
);

const PaymentCard = ({ title, paid, paidDate }) => (
  <div
    className={`rounded-xl px-4 py-4 border-2 ${paid ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
  >
    <div className="text-sm font-semibold text-gray-800 mb-3">{title}</div>
    <div className="flex items-center gap-2 mb-2">
      {paid ? (
        <BadgeCheck className="w-5 h-5 text-emerald-600" />
      ) : (
        <BadgeX className="w-5 h-5 text-red-500" />
      )}
      <span
        className={`font-semibold text-sm ${paid ? "text-emerald-700" : "text-red-600"}`}
      >
        {paid ? "Đã thanh toán" : "Chưa thanh toán"}
      </span>
    </div>
    {paid && paidDate && (
      <div className="text-xs text-gray-600 font-medium ml-7">
        Ngày TT: {fmtDateTime(paidDate)}
      </div>
    )}
  </div>
);

export default DetailInfoFlight;
