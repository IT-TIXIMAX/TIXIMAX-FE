import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Loader2, X } from "lucide-react";
import expenseService from "../../Services/Manager/expenseService";
import { getApiErrorMessage } from "../../Utils/getApiErrorMessage";

const ExpenseAction = ({
  id,
  status,
  onDone,
  className = "",
  size = "icon", // "icon" | "button"
}) => {
  const [loading, setLoading] = useState(false);

  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("approve"); // approve | reject
  const [reason, setReason] = useState("");

  const canAction = String(status || "").toUpperCase() === "CHO_DUYET";
  const title = mode === "approve" ? "Duyệt yêu cầu" : "Từ chối yêu cầu";

  const reasonPlaceholder = useMemo(() => {
    return mode === "approve"
      ? "Nhập lý do duyệt (bắt buộc)..."
      : "Nhập lý do từ chối (bắt buộc)...";
  }, [mode]);

  if (!id) return null;
  if (!canAction) return null;

  const openModal = (m) => {
    if (loading) return;
    setMode(m);
    setReason("");
    setOpen(true);
  };

  const closeModal = () => {
    if (loading) return;
    setOpen(false);
    setReason("");
  };

  const submit = async () => {
    const r = String(reason || "").trim();
    if (!r) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    setLoading(true);
    try {
      if (mode === "approve") {
        await expenseService.approve(id, r);
        toast.success("Đã duyệt!");
        onDone?.("approve");
      } else {
        await expenseService.reject(id, r);
        toast.success("Đã từ chối!");
        onDone?.("reject");
      }
      closeModal();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Thao tác thất bại"));
    } finally {
      setLoading(false);
    }
  };

  // ✅ nhỏ hơn để đồng bộ nút nhỏ
  const LoadingIcon = <Loader2 size={16} className="animate-spin" />;

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {size === "button" ? (
          <>
            {/* ✅ Nút nhỏ lại */}
            <button
              type="button"
              onClick={() => openModal("reject")}
              disabled={loading}
              className="px-3.5 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold inline-flex items-center gap-2 disabled:opacity-50 text-xs md:text-sm"
            >
              {loading ? LoadingIcon : <XCircle size={16} />}
              Từ chối
            </button>

            {/* ✅ Nút nhỏ lại */}
            <button
              type="button"
              onClick={() => openModal("approve")}
              disabled={loading}
              className="px-3.5 py-2 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold inline-flex items-center gap-2 disabled:opacity-50 text-xs md:text-sm"
            >
              {loading ? LoadingIcon : <CheckCircle2 size={16} />}
              Duyệt
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => openModal("approve")}
              disabled={loading}
              className="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              title="Duyệt"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </button>

            <button
              type="button"
              onClick={() => openModal("reject")}
              disabled={loading}
              className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              title="Từ chối"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <XCircle size={18} />
              )}
            </button>
          </>
        )}
      </div>

      {/* Modal Reason */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div
              className={`px-5 py-4 flex items-center justify-between ${
                mode === "approve"
                  ? "bg-gradient-to-r from-green-600 to-green-700"
                  : "bg-gradient-to-r from-red-600 to-red-700"
              }`}
            >
              <div>
                <h3 className="text-white font-semibold text-lg">{title}</h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="text-white/90 hover:text-white disabled:opacity-60"
                title="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <label className="text-sm font-semibold text-gray-800">
                Lý do <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reasonPlaceholder}
                disabled={loading}
                className="mt-2 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none resize-none"
              />

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold disabled:opacity-60"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-xl text-white font-semibold inline-flex items-center gap-2 disabled:opacity-50 ${
                    mode === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseAction;
