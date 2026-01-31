// src/Pages/Expense/CreateExpense.jsx
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Save,
  RefreshCw,
  DollarSign,
  Calculator,
  ArrowLeft,
  FileText,
  Landmark,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import expenseService from "../../Services/Manager/expenseService";
import { getApiErrorMessage } from "../../Utils/getApiErrorMessage";

/* ================= Helpers ================= */
const n0 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toNumber = (v) => {
  const s = String(v ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
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
  <div className={`space-y-1 ${className}`}>
    <label className="text-sm md:text-base font-semibold text-gray-900">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-2.5 rounded-2xl border-2 bg-white outline-none transition
      ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          : "border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
      }`}
    />
    {hint ? <p className="text-xs md:text-sm text-gray-500">{hint}</p> : null}
    {error ? (
      <p className="text-xs md:text-sm text-red-600 font-semibold">{error}</p>
    ) : null}
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
  <div className={`space-y-1 ${className}`}>
    <label className="text-sm md:text-base font-semibold text-gray-900">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <textarea
      {...props}
      className={`w-full px-4 py-2.5 rounded-2xl border-2 bg-white outline-none transition resize-none
      ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          : "border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
      }`}
    />
    {hint ? <p className="text-xs md:text-sm text-gray-500">{hint}</p> : null}
    {error ? (
      <p className="text-xs md:text-sm text-red-600 font-semibold">{error}</p>
    ) : null}
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
  <div className={`space-y-1 ${className}`}>
    <label className="text-sm md:text-base font-semibold text-gray-900">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <select
      {...props}
      className={`w-full px-4 py-2.5 rounded-2xl border-2 bg-white outline-none transition
      ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          : "border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
      }`}
    >
      {children}
    </select>
    {error ? (
      <p className="text-xs md:text-sm text-red-600 font-semibold">{error}</p>
    ) : null}
  </div>
);

const SoftButton = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-semibold shadow-sm transition text-xs md:text-sm disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

const PrimaryButton = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-sm transition border-2 border-yellow-600 text-xs md:text-sm disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

const CreateExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    note: "",
    paymentMethod: "TIEN_MAT",
    bankInfo: "",
    vatStatus: "CHUA_VAT",
    vatInfo: "",
  });

  const [errors, setErrors] = useState({});

  const totalAmount = useMemo(() => {
    return n0(form.quantity) * n0(form.unitPrice);
  }, [form.quantity, form.unitPrice]);

  const setField = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
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

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({
      description: "",
      quantity: 1,
      unitPrice: 0,
      note: "",
      paymentMethod: "TIEN_MAT",
      bankInfo: "",
      vatStatus: "CHUA_VAT",
      vatInfo: "",
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
      };

      await expenseService.create(payload);
      toast.success("Tạo yêu cầu chi phí thành công!");
      resetForm();
      // navigate(-1);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Tạo yêu cầu thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6  to-white">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border border-black rounded-2xl shadow-md p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-black leading-tight">
                  Tạo yêu cầu chi phí
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SoftButton type="button" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} />
                Quay lại
              </SoftButton>

              <SoftButton type="button" onClick={resetForm} disabled={loading}>
                <RefreshCw size={16} />
                Làm mới
              </SoftButton>

              <PrimaryButton type="button" onClick={submit} disabled={loading}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Đang tạo...
                  </span>
                ) : (
                  <>
                    <Save size={16} />
                    Tạo yêu cầu
                  </>
                )}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-md p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-gray-700" />
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Thông tin yêu cầu
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mô tả"
              required
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Ví dụ: Mua thùng carton, phí vận chuyển..."
              error={errors.description}
              className="md:col-span-2"
            />

            <Input
              label="Số lượng"
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => setField("quantity", toNumber(e.target.value))}
              error={errors.quantity}
              hint="Có thể để 0 nếu không áp dụng"
            />

            <Input
              label="Đơn giá (VND)"
              type="number"
              min={0}
              value={form.unitPrice}
              onChange={(e) => setField("unitPrice", toNumber(e.target.value))}
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

            <Input
              label="Thông tin ngân hàng"
              required={form.paymentMethod === "CHUYEN_KHOAN"}
              value={form.bankInfo}
              onChange={(e) => setField("bankInfo", e.target.value)}
              placeholder="Tên NH - STK - Chủ TK..."
              error={errors.bankInfo}
              className="md:col-span-2"
            />

            <Input
              label="Thông tin VAT"
              required={form.vatStatus === "CO_VAT"}
              value={form.vatInfo}
              onChange={(e) => setField("vatInfo", e.target.value)}
              placeholder="MST / tên công ty / địa chỉ..."
              error={errors.vatInfo}
              className="md:col-span-2"
            />

            <TextArea
              label="Ghi chú"
              rows={4}
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
              placeholder="Ghi chú thêm (không bắt buộc)..."
              className="md:col-span-2"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 md:p-6 h-fit">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-yellow-700" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Tổng tạm tính
            </h2>
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <Calculator size={18} />
                <span className="text-sm md:text-base font-semibold">
                  Tổng tiền
                </span>
              </div>
              <div className="text-lg md:text-xl font-extrabold text-yellow-700">
                {money(totalAmount)}
              </div>
            </div>
            <p className="mt-1 text-xs md:text-sm text-gray-500">
              Tổng = Số lượng × Đơn giá
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Landmark size={18} />
              <p className="text-sm md:text-base font-semibold">
                Điều kiện gợi ý
              </p>
            </div>
            <ul className="space-y-2 text-xs md:text-sm text-gray-600">
              <li>• Nếu chuyển khoản: nên nhập “Thông tin ngân hàng”.</li>
              <li>• Nếu có VAT: nên nhập “Thông tin VAT”.</li>
              <li>• “Ghi chú” có thể để trống.</li>
            </ul>
          </div>

          {/* Mobile actions */}
          <div className="mt-4 flex lg:hidden gap-2">
            <SoftButton
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="flex-1"
            >
              <RefreshCw size={16} />
              Làm mới
            </SoftButton>
            <PrimaryButton
              type="button"
              onClick={submit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Tạo
                </>
              )}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExpense;
