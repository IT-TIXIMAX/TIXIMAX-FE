// src/Components/Manager/Flight/UpdateFlightInfor.jsx
import React, { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Loader2,
  Plane,
  Save,
  FileText,
  DollarSign,
  CalendarCheck,
  X,
} from "lucide-react";
import managerInforFlightService from "../../Services/Manager/managerInforFlightService";
import UploadFile from "../../common/UploadFile";
import UploadFolder from "../../common/UploadFolder";

const toNumberOrZero = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const isYYYYMMDD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

const formatDateForInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const parseSingleInvoice = (path) => {
  if (!path) return [];
  try {
    const parsed = JSON.parse(path);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [
    {
      path: path.split("/").pop() || path,
      url: path,
      name: path.split("/").pop() || path,
      size: 0,
      type: "",
    },
  ];
};

const serializeSingleInvoice = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) return "";
  return JSON.stringify(files);
};

const UpdateFlightInfor = ({
  initialData,
  onSuccess = () => {},
  onCancel = () => {},
}) => {
  const [loading, setLoading] = useState(false);

  const makeInitialForm = () => ({
    flightCode: initialData?.flightCode || "",
    awbFilePath: initialData?.awbFilePath || "",
    exportLicensePath: initialData?.exportLicensePath || "",
    singleInvoiceFiles: parseSingleInvoice(initialData?.singleInvoicePath),
    invoiceFilePath: initialData?.invoiceFilePath || "",
    packingListPath: initialData?.packingListPath || "",
    totalVolumeWeight: initialData?.totalVolumeWeight || 0,
    airFreightCost: initialData?.airFreightCost || 0,
    customsClearanceCost: initialData?.customsClearanceCost || 0,
    airportShippingCost: initialData?.airportShippingCost || 0,
    otherCosts: initialData?.otherCosts || 0,
    arrivalDate: formatDateForInput(initialData?.arrivalDate) || "",
    airFreightPaidDate:
      formatDateForInput(initialData?.airFreightPaidDate) || "",
    customsPaidDate: formatDateForInput(initialData?.customsPaidDate) || "",
  });

  const [form, setForm] = useState(makeInitialForm);

  useEffect(() => {
    if (initialData) setForm(makeInitialForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const totalCost = useMemo(
    () =>
      toNumberOrZero(form.airFreightCost) +
      toNumberOrZero(form.customsClearanceCost) +
      toNumberOrZero(form.airportShippingCost) +
      toNumberOrZero(form.otherCosts),
    [
      form.airFreightCost,
      form.customsClearanceCost,
      form.airportShippingCost,
      form.otherCosts,
    ],
  );

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const validate = () => {
    if (!String(form.flightCode || "").trim())
      return "Vui lòng nhập Flight Code";
    if (!isYYYYMMDD(form.arrivalDate))
      return "Arrival Date phải dạng YYYY-MM-DD";
    if (form.airFreightPaidDate && !isYYYYMMDD(form.airFreightPaidDate))
      return "Air Freight Paid Date phải dạng YYYY-MM-DD";
    if (form.customsPaidDate && !isYYYYMMDD(form.customsPaidDate))
      return "Customs Paid Date phải dạng YYYY-MM-DD";
    return "";
  };

  const buildPayload = () => ({
    flightCode: String(form.flightCode || "").trim(),
    awbFilePath: String(form.awbFilePath || "").trim(),
    exportLicensePath: String(form.exportLicensePath || "").trim(),
    singleInvoicePath: serializeSingleInvoice(form.singleInvoiceFiles),
    invoiceFilePath: String(form.invoiceFilePath || "").trim(),
    packingListPath: String(form.packingListPath || "").trim(),
    totalVolumeWeight: toNumberOrZero(form.totalVolumeWeight),
    airFreightCost: toNumberOrZero(form.airFreightCost),
    customsClearanceCost: toNumberOrZero(form.customsClearanceCost),
    airportShippingCost: toNumberOrZero(form.airportShippingCost),
    otherCosts: toNumberOrZero(form.otherCosts),
    arrivalDate: form.arrivalDate,
    airFreightPaid: !!form.airFreightPaidDate,
    airFreightPaidDate: form.airFreightPaidDate || null,
    customsPaid: !!form.customsPaidDate,
    customsPaidDate: form.customsPaidDate || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);
    if (!initialData?.flightShipmentId) {
      toast.error("Không tìm thấy ID chuyến bay");
      return;
    }

    try {
      setLoading(true);
      const res = await managerInforFlightService.update(
        initialData.flightShipmentId,
        buildPayload(),
      );
      toast.success("Cập nhật thông tin flight thành công!");
      onSuccess(res);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Cập nhật flight thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <form onSubmit={handleSubmit}>
        {/* ── Section: Thông tin cơ bản ── */}
        <FormSection
          icon={<Plane className="w-5 h-5 text-white" />}
          title="Thông Tin Cơ Bản"
          accentColor="blue"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Flight Code"
              required
              value={form.flightCode}
              onChange={(e) => setField("flightCode", e.target.value)}
              placeholder="VD: VN123"
            />
            <InputField
              label="Ngày Đến (Arrival Date)"
              required
              type="date"
              value={form.arrivalDate}
              onChange={(e) => setField("arrivalDate", e.target.value)}
            />
          </div>
        </FormSection>

        {/* ── Section: Tài liệu & Chứng từ ── */}
        <FormSection
          icon={<FileText className="w-5 h-5 text-white" />}
          title="Tài Liệu & Chứng Từ"
          description="Upload file (tối đa 50MB) hoặc folder (tối đa 200MB)"
          accentColor="purple"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UploadFile
              label="AWB File"
              fileUrl={form.awbFilePath}
              onFileUpload={(url) => setField("awbFilePath", url)}
              onFileRemove={() => setField("awbFilePath", "")}
              maxSizeMB={50}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
            />
            <UploadFile
              label="Export License"
              fileUrl={form.exportLicensePath}
              onFileUpload={(url) => setField("exportLicensePath", url)}
              onFileRemove={() => setField("exportLicensePath", "")}
              maxSizeMB={50}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
            />
            <UploadFolder
              label="Single Invoice (Files/Folder)"
              folderUrl={form.singleInvoiceFiles}
              onFolderUpload={(files) => setField("singleInvoiceFiles", files)}
              onFolderRemove={() => setField("singleInvoiceFiles", [])}
              maxSizeMB={200}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
              placeholder="Chưa có files/folder"
              className="md:col-span-2"
            />
            <UploadFile
              label="Invoice File"
              fileUrl={form.invoiceFilePath}
              onFileUpload={(url) => setField("invoiceFilePath", url)}
              onFileRemove={() => setField("invoiceFilePath", "")}
              maxSizeMB={50}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
            />
            <UploadFile
              label="Packing List"
              fileUrl={form.packingListPath}
              onFileUpload={(url) => setField("packingListPath", url)}
              onFileRemove={() => setField("packingListPath", "")}
              maxSizeMB={50}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
            />
          </div>
        </FormSection>

        {/* ── Section: Trọng lượng & Chi phí ── */}
        <FormSection
          icon={<DollarSign className="w-5 h-5 text-white" />}
          title="Trọng Lượng & Chi Phí"
          accentColor="orange"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="Tổng Trọng Lượng Quy Đổi (kg)"
              inputMode="decimal"
              value={form.totalVolumeWeight}
              onChange={(e) => setField("totalVolumeWeight", e.target.value)}
              placeholder="0.00"
            />
            <InputField
              label="Chi Phí Vận Chuyển Hàng Không"
              inputMode="numeric"
              value={form.airFreightCost}
              onChange={(e) => setField("airFreightCost", e.target.value)}
              placeholder="0.00"
            />
            <InputField
              label="Chi Phí Thủ Tục Hải Quan"
              inputMode="numeric"
              value={form.customsClearanceCost}
              onChange={(e) => setField("customsClearanceCost", e.target.value)}
              placeholder="0.00"
            />
            <InputField
              label="Chi Phí Vận Chuyển Sân Bay"
              inputMode="numeric"
              value={form.airportShippingCost}
              onChange={(e) => setField("airportShippingCost", e.target.value)}
              placeholder="0.00"
            />
            <InputField
              label="Chi Phí Khác"
              inputMode="numeric"
              value={form.otherCosts}
              onChange={(e) => setField("otherCosts", e.target.value)}
              placeholder="0.00"
            />

            {/* Tổng chi phí tự động */}
            <div className="flex items-end">
              <div className="w-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl px-4 py-3">
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                  Tổng Chi Phí
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {totalCost.toLocaleString("en-US")}
                </div>
                <div className="text-xs text-gray-600 font-medium mt-0.5">
                  VNĐ
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* ── Section: Trạng thái thanh toán ── */}
        <FormSection
          icon={<CalendarCheck className="w-5 h-5 text-white" />}
          title="Trạng Thái Thanh Toán"
          accentColor="emerald"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PaymentCard
              title="Chi Phí Vận Chuyển Hàng Không"
              date={form.airFreightPaidDate}
              onDateChange={(date) => setField("airFreightPaidDate", date)}
            />
            <PaymentCard
              title="Chi Phí Thủ Tục Hải Quan"
              date={form.customsPaidDate}
              onDateChange={(date) => setField("customsPaidDate", date)}
            />
          </div>
        </FormSection>

        {/* ── Footer Actions ── */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl px-6 py-4 flex items-center justify-between gap-4 mt-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Hủy Bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang Cập Nhật...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Cập Nhật Thông Tin
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Sub-components ──

const accentMap = {
  blue: {
    iconBg: "bg-blue-600",
    headerBg: "from-blue-50 to-blue-100",
    border: "border-blue-200",
    title: "text-blue-900",
  },
  orange: {
    iconBg: "bg-orange-500",
    headerBg: "from-orange-50 to-orange-100",
    border: "border-orange-200",
    title: "text-orange-900",
  },
  emerald: {
    iconBg: "bg-emerald-600",
    headerBg: "from-emerald-50 to-emerald-100",
    border: "border-emerald-200",
    title: "text-emerald-900",
  },
  purple: {
    iconBg: "bg-purple-600",
    headerBg: "from-purple-50 to-purple-100",
    border: "border-purple-200",
    title: "text-purple-900",
  },
};

const FormSection = ({
  icon,
  title,
  description,
  accentColor = "blue",
  children,
}) => {
  const c = accentMap[accentColor] || accentMap.blue;
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6">
      <div
        className={`px-5 md:px-6 py-4 bg-gradient-to-r ${c.headerBg} border-b ${c.border} flex items-center gap-3`}
      >
        <div className={`p-2 rounded-lg ${c.iconBg} flex-shrink-0`}>{icon}</div>
        <div>
          <h2 className={`text-base font-bold ${c.title}`}>{title}</h2>
          {description && (
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </div>
  );
};

const InputField = ({ label, required, type = "text", ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
      {...props}
    />
  </div>
);

const PaymentCard = ({ title, date, onDateChange }) => {
  const hasDate = !!date;
  return (
    <div
      className={`rounded-xl px-4 py-4 border-2 transition-all ${hasDate ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}
    >
      <div className="text-sm font-semibold text-gray-800 mb-3">{title}</div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Ngày Thanh Toán
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {hasDate && (
        <button
          type="button"
          onClick={() => onDateChange("")}
          className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Xóa ngày thanh toán
        </button>
      )}
    </div>
  );
};

export default UpdateFlightInfor;
