// src/Pages/Expense/CreateExpense.jsx
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Save,
  DollarSign,
  Calculator,
  FileText,
  ImagePlus,
  Loader2,
} from "lucide-react";
import expenseService from "../../Services/Manager/expenseService";
import { getApiErrorMessage } from "../../Utils/getApiErrorMessage";
import UploadImg from "../../common/UploadImg";

/* ================= Helpers ================= */
const n0 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toNumber = (v) => {
  const s = String(v ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/,/g, "")
    .replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

const formatNumber = (v) => {
  const num = toNumber(v);
  return num.toLocaleString("vi-VN");
};

const money = (v) => `${n0(v).toLocaleString("vi-VN")} ₫`;

const PAYMENT_METHODS = [
  { value: "TIEN_MAT", label: "Tiền mặt" },
  { value: "CHUYEN_KHOAN", label: "Chuyển khoản" },
  { value: "THE", label: "Thẻ" },
];

const VAT_STATUSES = [
  { value: "CHUA_VAT", label: "Chưa VAT" },
  { value: "CO_VAT", label: "Có VAT" },
];

const Input = ({ label, required, hint, error, className = "", ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-sm font-semibold text-gray-800">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg border bg-white outline-none transition text-sm
      ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      }`}
    />
    {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : null}
  </div>
);

const TextArea = ({
  label,
  required,
  hint,
  error,
  className = "",
  ...props
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-sm font-semibold text-gray-800">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <textarea
      {...props}
      className={`w-full px-3 py-2 rounded-lg border bg-white outline-none transition resize-none text-sm
      ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      }`}
    />
    {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : null}
  </div>
);

const Select = ({
  label,
  required,
  error,
  className = "",
  children,
  ...props
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-sm font-semibold text-gray-800">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <select
      {...props}
      className={`w-full px-3 py-2 rounded-lg border bg-white outline-none transition text-sm
      ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      }`}
    >
      {children}
    </select>
    {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : null}
  </div>
);

const SoftButton = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition text-sm disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

const PrimaryButton = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition text-sm disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

const CreateExpense = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    unitPriceDisplay: "0",
    note: "",
    paymentMethod: "TIEN_MAT",
    bankInfo: "",
    vatStatus: "CHUA_VAT",
    vatInfo: "",
    invoiceImage: "",
    transferImage: "",
    department: "",
  });

  const [errors, setErrors] = useState({});

  const totalAmount = useMemo(() => {
    return n0(form.quantity) * n0(form.unitPrice);
  }, [form.quantity, form.unitPrice]);

  const setField = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleUnitPriceChange = (value) => {
    const numValue = toNumber(value);
    const displayValue = value === "" ? "" : formatNumber(value);
    setForm((s) => ({
      ...s,
      unitPrice: numValue,
      unitPriceDisplay: displayValue,
    }));
    setErrors((e) => ({ ...e, unitPrice: "" }));
  };

  const validate = () => {
    const e = {};
    if (!String(form.description || "").trim())
      e.description = "Vui lòng nhập mô tả";
    if (n0(form.quantity) < 0) e.quantity = "Số lượng phải >= 0";
    if (n0(form.unitPrice) < 0) e.unitPrice = "Đơn giá phải >= 0";

    if (
      form.paymentMethod === "CHUYEN_KHOAN" &&
      !String(form.bankInfo || "").trim()
    ) {
      e.bankInfo = "Vui lòng nhập thông tin ngân hàng";
    }
    if (form.vatStatus === "CO_VAT" && !String(form.vatInfo || "").trim()) {
      e.vatInfo = "Vui lòng nhập thông tin VAT";
    }

    if (!String(form.department || "").trim()) {
      e.department = "Vui lòng nhập phòng ban";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({
      description: "",
      quantity: 1,
      unitPrice: 0,
      unitPriceDisplay: "0",
      note: "",
      paymentMethod: "TIEN_MAT",
      bankInfo: "",
      vatStatus: "CHUA_VAT",
      vatInfo: "",
      invoiceImage: "",
      transferImage: "",
      department: "",
    });
    setErrors({});
  };

  const submit = async () => {
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        description: String(form.description || "").trim(),
        quantity: n0(form.quantity),
        unitPrice: n0(form.unitPrice),
        note: String(form.note || ""),
        paymentMethod: form.paymentMethod,
        bankInfo: String(form.bankInfo || ""),
        vatStatus: form.vatStatus,
        vatInfo: String(form.vatInfo || ""),
        invoiceImage: String(form.invoiceImage || ""),
        transferImage: String(form.transferImage || ""),
        department: String(form.department || "").trim(),
      };

      await expenseService.create(payload);
      toast.success("Tạo yêu cầu chi phí thành công!");
      resetForm();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Tạo yêu cầu thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FileText size={22} className="text-white" />
              </div>
              <h1 className="text-lg md:text-xl font-bold text-white">
                Tạo yêu cầu chi phí
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <FileText size={18} className="text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">
                Thông tin cơ bản
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Mô tả chi phí"
                required
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="......"
                error={errors.description}
                className="md:col-span-2"
              />

              <Input
                label="Phòng ban"
                required
                value={form.department}
                onChange={(e) => setField("department", e.target.value)}
                placeholder="......"
                error={errors.department}
              />

              <div></div>

              <Input
                label="Số lượng"
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setField("quantity", toNumber(e.target.value))}
                error={errors.quantity}
              />

              <Input
                label="Đơn giá (VND)"
                type="text"
                value={form.unitPriceDisplay}
                onChange={(e) => handleUnitPriceChange(e.target.value)}
                placeholder="Ví dụ: 1.000.000"
                error={errors.unitPrice}
              />

              <Select
                label="Phương thức thanh toán"
                value={form.paymentMethod}
                onChange={(e) => setField("paymentMethod", e.target.value)}
              >
                {PAYMENT_METHODS.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Trạng thái VAT"
                value={form.vatStatus}
                onChange={(e) => setField("vatStatus", e.target.value)}
              >
                {VAT_STATUSES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </Select>

              {form.paymentMethod === "CHUYEN_KHOAN" && (
                <Input
                  label="Thông tin ngân hàng"
                  required
                  value={form.bankInfo}
                  onChange={(e) => setField("bankInfo", e.target.value)}
                  placeholder="Tên NH - STK - Chủ TK..."
                  error={errors.bankInfo}
                  className="md:col-span-2"
                />
              )}

              {form.vatStatus === "CO_VAT" && (
                <Input
                  label="Thông tin VAT"
                  required
                  value={form.vatInfo}
                  onChange={(e) => setField("vatInfo", e.target.value)}
                  placeholder="MST / tên công ty / địa chỉ..."
                  error={errors.vatInfo}
                  className="md:col-span-2"
                />
              )}

              <TextArea
                label="Ghi chú"
                rows={3}
                value={form.note}
                onChange={(e) => setField("note", e.target.value)}
                placeholder="Ghi chú thêm ..."
                className="md:col-span-2"
              />
            </div>
          </div>

          {/* Upload hình ảnh */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <ImagePlus size={18} className="text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">
                Hình ảnh đính kèm
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Invoice Image */}
              <div>
                <UploadImg
                  imageUrl={form.invoiceImage}
                  onImageUpload={(url) => setField("invoiceImage", url)}
                  onImageRemove={() => setField("invoiceImage", "")}
                  label="Ảnh hóa đơn"
                  required={false}
                  maxSizeMB={3}
                  placeholder="Chưa có ảnh hóa đơn"
                />
                {errors.invoiceImage && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.invoiceImage}
                  </p>
                )}
              </div>

              {/* Transfer Image */}
              <div>
                <UploadImg
                  imageUrl={form.transferImage}
                  onImageUpload={(url) => setField("transferImage", url)}
                  onImageRemove={() => setField("transferImage", "")}
                  label="Ảnh chuyển khoản"
                  required={false}
                  maxSizeMB={3}
                  placeholder="Chưa có ảnh chuyển khoản"
                />
                {errors.transferImage && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.transferImage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          {/* Tổng tiền */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Tổng tạm tính
              </h2>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calculator size={16} />
                  <span className="text-sm font-semibold">Tổng tiền</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {money(totalAmount)}
              </div>
            </div>
          </div>

          {/* Action Buttons - Đặt ở đây */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col gap-2">
              <PrimaryButton
                type="button"
                onClick={submit}
                disabled={loading}
                className="w-full justify-center"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Đang tạo yêu cầu...
                  </span>
                ) : (
                  <>
                    <Save size={16} />
                    Tạo yêu cầu chi phí
                  </>
                )}
              </PrimaryButton>

              <SoftButton
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="w-full justify-center lg:hidden"
              ></SoftButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExpense;
