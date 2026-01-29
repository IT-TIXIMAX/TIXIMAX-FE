// src/Components/Manager/Flight/CreateInforFlight.jsx
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Loader2,
  Plane,
  Save,
  FileText,
  DollarSign,
  CalendarCheck,
} from "lucide-react";
import managerInforFlightService from "../../Services/Manager/managerInforFlightService";
import UploadFile from "../../common/UploadFile";

const toNumberOrZero = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const isYYYYMMDD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

const CreateInforFlight = ({ onSuccess = () => {}, onCancel = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const makeInitialForm = () => ({
    flightCode: "",
    awbFilePath: "",
    exportLicensePath: "",
    singleInvoicePath: "",
    invoiceFilePath: "",
    packingListPath: "",
    totalVolumeWeight: 0,
    airFreightCost: 0,
    customsClearanceCost: 0,
    airportShippingCost: 0,
    otherCosts: 0,
    arrivalDate: "",
    airFreightPaidDate: "",
    customsPaidDate: "",
  });

  const [form, setForm] = useState(makeInitialForm);

  const totalCost = useMemo(() => {
    return (
      toNumberOrZero(form.airFreightCost) +
      toNumberOrZero(form.customsClearanceCost) +
      toNumberOrZero(form.airportShippingCost) +
      toNumberOrZero(form.otherCosts)
    );
  }, [
    form.airFreightCost,
    form.customsClearanceCost,
    form.airportShippingCost,
    form.otherCosts,
  ]);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const validate = () => {
    if (!String(form.flightCode || "").trim())
      return "Vui lòng nhập Flight Code";
    if (!isYYYYMMDD(form.arrivalDate))
      return "Arrival Date phải dạng YYYY-MM-DD";
    // Chỉ validate date nếu đã nhập
    if (form.airFreightPaidDate && !isYYYYMMDD(form.airFreightPaidDate))
      return "Air Freight Paid Date phải dạng YYYY-MM-DD";
    if (form.customsPaidDate && !isYYYYMMDD(form.customsPaidDate))
      return "Customs Paid Date phải dạng YYYY-MM-DD";
    return "";
  };

  const buildPayload = () => {
    return {
      flightCode: String(form.flightCode || "").trim(),
      awbFilePath: String(form.awbFilePath || "").trim(),
      exportLicensePath: String(form.exportLicensePath || "").trim(),
      singleInvoicePath: String(form.singleInvoicePath || "").trim(),
      invoiceFilePath: String(form.invoiceFilePath || "").trim(),
      packingListPath: String(form.packingListPath || "").trim(),
      totalVolumeWeight: toNumberOrZero(form.totalVolumeWeight),
      airFreightCost: toNumberOrZero(form.airFreightCost),
      customsClearanceCost: toNumberOrZero(form.customsClearanceCost),
      airportShippingCost: toNumberOrZero(form.airportShippingCost),
      otherCosts: toNumberOrZero(form.otherCosts),
      arrivalDate: form.arrivalDate,
      // Tự động set paid = true nếu có date
      airFreightPaid: !!form.airFreightPaidDate,
      airFreightPaidDate: form.airFreightPaidDate || null,
      customsPaid: !!form.customsPaidDate,
      customsPaidDate: form.customsPaidDate || null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    const payload = buildPayload();

    try {
      setLoading(true);
      const res = await managerInforFlightService.create(payload);
      toast.success("Tạo thông tin flight thành công!");
      onSuccess(res);

      setForm(makeInitialForm());
      setFormKey((k) => k + 1);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Tạo flight thất bại";
      toast.error(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <form key={formKey} onSubmit={handleSubmit}>
        {/* HEADER LỚN - Vàng với border đen */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-[1px] border-black rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
              <div className="w-11 h-11 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0">
                <Plane className="w-6 h-6 text-black" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-black leading-tight">
                  Tạo Thông Tin Chuyến Bay
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* SECTION ĐẶC BIỆT - "Nhập Thông Tin" màu BLUE */}
            <BlueSection title="Nhập Thông Tin">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Flight Code"
                  required
                  value={form.flightCode}
                  onChange={(e) => setField("flightCode", e.target.value)}
                  placeholder="VD: VN-1"
                />
                <InputField
                  label="Ngày Đến (Arrival Date)"
                  required
                  type="date"
                  value={form.arrivalDate}
                  onChange={(e) => setField("arrivalDate", e.target.value)}
                />
              </div>
            </BlueSection>

            {/* SECTIONS THƯỜNG - Xám uppercase */}
            <Section
              icon={FileText}
              title="Tài Liệu & Chứng Từ"
              description="Upload file (tối đa 50MB) hoặc xóa file"
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

                <UploadFile
                  label="Single Invoice"
                  fileUrl={form.singleInvoicePath}
                  onFileUpload={(url) => setField("singleInvoicePath", url)}
                  onFileRemove={() => setField("singleInvoicePath", "")}
                  maxSizeMB={50}
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
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
                  className="md:col-span-2"
                />
              </div>
            </Section>

            <Section icon={DollarSign} title="Trọng Lượng & Chi Phí">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  label="Tổng Trọng Lượng Quy Đổi (kg)"
                  inputMode="decimal"
                  value={form.totalVolumeWeight}
                  onChange={(e) =>
                    setField("totalVolumeWeight", e.target.value)
                  }
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
                  onChange={(e) =>
                    setField("customsClearanceCost", e.target.value)
                  }
                  placeholder="0.00"
                />
                <InputField
                  label="Chi Phí Vận Chuyển Sân Bay"
                  inputMode="numeric"
                  value={form.airportShippingCost}
                  onChange={(e) =>
                    setField("airportShippingCost", e.target.value)
                  }
                  placeholder="0.00"
                />
                <InputField
                  label="Chi Phí Khác"
                  inputMode="numeric"
                  value={form.otherCosts}
                  onChange={(e) => setField("otherCosts", e.target.value)}
                  placeholder="0.00"
                />
                <div className="flex items-end">
                  <div className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="text-xs font-medium text-blue-700 mb-1">
                      Tổng Chi Phí
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {totalCost.toLocaleString("en-US")} VNĐ
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            <Section icon={CalendarCheck} title="Trạng Thái Thanh Toán">
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
            </Section>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang Lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Lưu Thông Tin
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const BlueSection = ({ title, children }) => {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md overflow-hidden mb-4">
        <div className="px-4 md:px-6 py-4">
          <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

const Section = ({ icon: Icon, title, description, children }) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}
      <div>{children}</div>
    </div>
  );
};

const InputField = ({ label, required, type = "text", ...props }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        {...props}
      />
    </div>
  );
};

// ✅ PaymentCard đã đơn giản hóa - không có toggle switch
const PaymentCard = ({ title, date, onDateChange }) => {
  const hasDate = !!date;

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        hasDate ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="mb-3">
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Ngày Thanh Toán
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default CreateInforFlight;
