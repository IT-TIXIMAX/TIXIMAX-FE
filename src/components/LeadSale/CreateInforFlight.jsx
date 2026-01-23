import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Loader2,
  Plane,
  Save,
  X,
  FileText,
  DollarSign,
  CalendarCheck,
  FileCheck,
} from "lucide-react";
import managerInforFlightService from "../../Services/Manager/managerInforFlightService";
import UploadFile from "../../common/UploadFile";
const toNumberOrZero = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const isYYYYMMDD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

const CreateInforFlight = ({
  defaultFlightCode = "VN123",
  onSuccess = () => {},
  onCancel = () => {},
}) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    flightCode: defaultFlightCode || "",
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
    airFreightPaid: false,
    airFreightPaidDate: "",
    customsPaid: false,
    customsPaidDate: "",
  });

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
    if (form.airFreightPaid && !isYYYYMMDD(form.airFreightPaidDate))
      return "Air Freight Paid Date phải dạng YYYY-MM-DD";
    if (form.customsPaid && !isYYYYMMDD(form.customsPaidDate))
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
      airFreightPaid: !!form.airFreightPaid,
      airFreightPaidDate: form.airFreightPaid ? form.airFreightPaidDate : null,
      customsPaid: !!form.customsPaid,
      customsPaidDate: form.customsPaid ? form.customsPaidDate : null,
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
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
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
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Plane className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Tạo Thông Tin Chuyến Bay
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Đóng</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Basic Information */}
            <Section icon={Plane} title="Thông Tin Cơ Bản">
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
            </Section>

            {/* Documents Section */}
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

            {/* Weight & Costs */}
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

            {/* Payment Status */}
            <Section icon={CalendarCheck} title="Trạng Thái Thanh Toán">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PaymentCard
                  title="Chi Phí Vận Chuyển Hàng Không"
                  checked={form.airFreightPaid}
                  onCheckedChange={(checked) =>
                    setField("airFreightPaid", checked)
                  }
                  date={form.airFreightPaidDate}
                  onDateChange={(date) => setField("airFreightPaidDate", date)}
                />
                <PaymentCard
                  title="Chi Phí Thủ Tục Hải Quan"
                  checked={form.customsPaid}
                  onCheckedChange={(checked) =>
                    setField("customsPaid", checked)
                  }
                  date={form.customsPaidDate}
                  onDateChange={(date) => setField("customsPaidDate", date)}
                />
              </div>
            </Section>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">(*)</span> Trường bắt buộc
                </div>
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

const Section = ({ icon: Icon, title, description, children }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description ? (
            <p className="text-sm text-gray-500">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="pl-0 md:pl-13">{children}</div>
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

const PaymentCard = ({
  title,
  checked,
  onCheckedChange,
  date,
  onDateChange,
}) => {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        checked ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileCheck
            className={`w-5 h-5 ${
              checked ? "text-green-600" : "text-gray-400"
            }`}
          />
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </label>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Ngày Thanh Toán
        </label>
        <input
          type="date"
          disabled={!checked}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${
            checked
              ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        />
      </div>
    </div>
  );
};

export default CreateInforFlight;
