import React, { useState, useEffect } from "react";
import orderlinkService from "../../Services/StaffPurchase/orderlinkService";
import toast from "react-hot-toast";
import { Copy, Check } from "lucide-react";

const DetailExchangeMoney = ({ linkId, onClose }) => {
  const [orderLink, setOrderLink] = useState(null);
  const [staff, setStaff] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (linkId) fetchOrderLinkDetail();
    // eslint-disable-next-line
  }, [linkId]);

  const fetchOrderLinkDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderlinkService.getOrderLinkById(linkId);
      setOrderLink(data?.orderLink || null);
      setStaff(data?.staff || null);
      setCustomer(data?.customer || null);
    } catch (err) {
      toast.error("Unable to load money exchange details");
      setError("Load failed");
    } finally {
      setLoading(false);
    }
  };

  const parseBankInfo = (note) => {
    if (!note || note === "string") {
      return { accountNumber: "", accountHolder: "", bankName: "" };
    }
    const lines = note.split("\n").map((l) => l.trim());
    const parts = (lines[0] || "").split(/\s+/);
    return {
      accountNumber: parts[0] || "",
      accountHolder: parts.slice(1).join(" "),
      bankName: lines[1] || "",
    };
  };

  const handleCopy = async (text, field) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const formatCurrency = (v) => Number(v || 0).toLocaleString("en-US");

  const getStatusLabel = (s) =>
    ({
      HOAT_DONG: "Active",
      CHO_MUA: "Pending",
      TAM_DUNG: "Hold",
      HUY: "Cancel",
    }[s] || s);

  if (loading)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white px-6 py-4 rounded">Loading…</div>
      </div>
    );

  if (error)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded space-y-3">
          <p className="text-red-600 text-sm">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={fetchOrderLinkDetail}
              className="px-3 py-1.5 border rounded"
            >
              Retry
            </button>
            <button onClick={onClose} className="px-3 py-1.5 border rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    );

  if (!orderLink) return null;

  const bankInfo = parseBankInfo(orderLink.note);

  return (
    <>
      {/* MODAL */}
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-2 sm:p-4">
        <div className="bg-white w-full max-w-4xl rounded-lg overflow-hidden">
          {/* HEADER – SIMPLE BLUE */}
          <div className="sticky top-0 bg-blue-600 px-3 py-2 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-sm sm:text-base font-semibold">
                Money Exchange
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] bg-white/20 text-white">
                  {getStatusLabel(orderLink.status)}
                </span>
                <button
                  onClick={onClose}
                  className="text-white text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-3 sm:p-5 space-y-4 text-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* LEFT */}
              <div className="space-y-4">
                {/* QR */}
                {orderLink.purchaseImage && (
                  <div className="border rounded-lg p-3 text-center">
                    <img
                      src={orderLink.purchaseImage}
                      alt="QR"
                      className="mx-auto max-h-64 cursor-pointer"
                      onClick={() => setImagePreview(orderLink.purchaseImage)}
                    />
                  </div>
                )}

                {/* BANK */}
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      {bankInfo.bankName || "N/A"}
                    </span>
                    <CopyBtn
                      copied={copiedField === "bank"}
                      onClick={() => handleCopy(bankInfo.bankName, "bank")}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xl text-blue-700">
                      {bankInfo.accountNumber || "N/A"}
                    </span>
                    <CopyBtn
                      copied={copiedField === "acc"}
                      onClick={() => handleCopy(bankInfo.accountNumber, "acc")}
                    />
                  </div>

                  <p className="text-gray-700">
                    {bankInfo.accountHolder || "N/A"}
                  </p>
                </div>

                {/* STAFF */}
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Staff</p>
                  <p className="font-medium">
                    {staff?.name} · {staff?.staffCode}
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-4">
                {/* AMOUNT */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 mb-1">Exchange Amount</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(orderLink.totalWeb)}
                  </p>
                </div>

                {/* DETAILS */}
                <div className="border rounded-lg p-3 space-y-1">
                  <Row
                    label="Price"
                    value={formatCurrency(orderLink.totalWeb)}
                  />
                  <Row label="Innfomation BankAccout" value={orderLink.note} />
                  <Row
                    label="Extra"
                    value={formatCurrency(orderLink.extraCharge)}
                  />
                </div>

                {/* CUSTOMER */}
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium">
                    {customer?.name} · {customer?.customerCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t px-3 py-2">
            <button
              onClick={onClose}
              className="w-full border rounded-md py-2 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* IMAGE PREVIEW */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-60"
          onClick={() => setImagePreview(null)}
        >
          <img
            src={imagePreview}
            alt="QR Preview"
            className="max-w-full max-h-full"
          />
        </div>
      )}
    </>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const CopyBtn = ({ onClick, copied }) => (
  <button onClick={onClick}>
    {copied ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <Copy className="w-4 h-4 text-gray-600" />
    )}
  </button>
);

export default DetailExchangeMoney;
