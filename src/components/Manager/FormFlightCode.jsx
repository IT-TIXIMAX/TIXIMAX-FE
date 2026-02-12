// src/Components/Manager/Flight/FormFlightCode.jsx
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import FilterRoute from "../../components/Filter/FilterRoute";
import managerInforFlightService from "../../Services/Manager/managerInforFlightService";

const Spinner = () => (
  <svg
    className="animate-spin h-3.5 w-3.5 text-blue-400"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8H4z"
    />
  </svg>
);

const FormFlightCode = ({ isOpen, onClose, onSubmit }) => {
  const [routeId, setRouteId] = useState("");
  const [flightCodes, setFlightCodes] = useState([]);
  const [flightCode, setFlightCode] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef(null);

  /* reset khi mở dialog */
  useEffect(() => {
    if (isOpen) {
      setRouteId("");
      setFlightCodes([]);
      setFlightCode("");
    }
  }, [isOpen]);

  /* close on backdrop */
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [isOpen, onClose]);

  /* close on ESC */
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  /* ===================== FETCH FLIGHT CODES (routeId OPTIONAL) ===================== */
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setFlightCode("");

        const data =
          await managerInforFlightService.getAvailableFlightCodesByRoute(
            routeId || undefined, // ✅ đúng API mới
          );

        if (!cancelled) setFlightCodes(data || []);
      } catch {
        if (!cancelled) {
          toast.error("Không thể tải flight code");
          setFlightCodes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [routeId, isOpen]);

  /* submit */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!routeId) return toast.error("Chưa chọn tuyến");
    if (!flightCode) return toast.error("Chưa chọn flight code");
    onSubmit({ routeId, flightCode });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
        style={{ animation: "fdIn 150ms ease forwards" }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Chọn flight code"
          className="w-full max-w-xs mx-4 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
          style={{
            animation: "scIn 180ms cubic-bezier(.34,1.3,.64,1) forwards",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3l14 9-14 9V3z"
                  />
                </svg>
              </span>
              <span className="text-sm font-semibold text-gray-800">
                Chọn Flight Code
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400
                         hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tuyến đường
              </label>
              <FilterRoute
                value={routeId}
                onChange={setRouteId}
                showLabel={false}
                selectClassName="h-9 rounded-lg text-sm w-full"
                placeholder="Chọn tuyến đường"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                Flight Code {loading && <Spinner />}
              </label>

              <select
                value={flightCode}
                onChange={(e) => setFlightCode(e.target.value)}
                disabled={loading || !routeId}
                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-50
                           disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50"
              >
                <option value="">
                  {!routeId
                    ? "— chọn tuyến trước —"
                    : loading
                      ? "Đang tải..."
                      : flightCodes.length === 0
                        ? "Không có mã khả dụng"
                        : "Chọn mã chuyến bay"}
                </option>

                {flightCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600
                           hover:bg-gray-50 active:scale-95 transition-all"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={!routeId || !flightCode || loading}
                className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white
                           shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fdIn { from{opacity:0} to{opacity:1} }
        @keyframes scIn { from{opacity:0;transform:scale(.95) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
    </>
  );
};

FormFlightCode.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default FormFlightCode;
