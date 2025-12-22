// src/Components/Packing/AddShipment.jsx
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Loader2,
  X,
  Scan,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import packingsService from "../../Services/Warehouse/packingsService";

const AddShipment = ({
  packingCode,
  onSuccess,
  className = "",
  disabled: disabledProp = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCodes, setScannedCodes] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [invalidCodes, setInvalidCodes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  // Auto focus input khi mở scanner
  useEffect(() => {
    if (showScanner && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [showScanner]);

  // Auto focus edit input khi bắt đầu edit
  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingIndex]);

  // Parse invalid codes từ error message
  const parseInvalidCodes = (errorMsg) => {
    const match = errorMsg.match(/\[(.*?)\]/);
    if (match && match[1]) {
      return match[1]
        .split(",")
        .map((code) => code.trim())
        .filter(Boolean);
    }
    return [];
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // Handle barcode scan/input
  const handleScanInput = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const code = inputValue.trim();

      if (scannedCodes.includes(code)) {
        setErrorMessage(`Code "${code}" already scanned!`);
        return;
      }

      setScannedCodes((prev) => [...prev, code]);
      setErrorMessage("");
      setInputValue("");
      toast.success(`Added: ${code}`, { duration: 1500, icon: "✅" });

      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Start editing - click vào code để edit
  const startEdit = (index, code) => {
    setEditingIndex(index);
    setEditValue(code);
  };

  // Save edited code
  const saveEdit = () => {
    if (editingIndex === null) return;

    const newCode = editValue.trim();

    if (!newCode) {
      // Nếu empty thì cancel
      setEditingIndex(null);
      setEditValue("");
      return;
    }

    // Check duplicate (excluding current index)
    const isDuplicate = scannedCodes.some(
      (code, idx) => idx !== editingIndex && code === newCode
    );

    if (isDuplicate) {
      toast.error(`Code "${newCode}" already exists!`);
      return;
    }

    // Nếu không thay đổi gì thì chỉ cancel
    if (newCode === scannedCodes[editingIndex]) {
      setEditingIndex(null);
      setEditValue("");
      return;
    }

    // Update code
    const newCodes = [...scannedCodes];
    const oldCode = newCodes[editingIndex];
    newCodes[editingIndex] = newCode;
    setScannedCodes(newCodes);

    // Remove from invalid list if fixed
    setInvalidCodes((prev) => prev.filter((c) => c !== oldCode));

    // Clear API error if all invalid codes are fixed
    if (invalidCodes.length === 1 && invalidCodes.includes(oldCode)) {
      setApiError("");
    }

    setEditingIndex(null);
    setEditValue("");
    toast.success("Code updated", { duration: 1500 });
  };

  // Handle blur - auto save
  const handleEditBlur = () => {
    saveEdit();
  };

  // Handle Enter/Escape in edit input
  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      setEditingIndex(null);
      setEditValue("");
    }
  };

  // Remove single scanned code
  const removeScannedCode = (code, index, e) => {
    e.stopPropagation(); // Prevent triggering edit

    setScannedCodes((prev) => prev.filter((_, idx) => idx !== index));
    setInvalidCodes((prev) => prev.filter((c) => c !== code));

    if (invalidCodes.includes(code) && invalidCodes.length === 1) {
      setApiError("");
    }

    toast.success(`Removed: ${code}`, { duration: 1500 });
  };

  // Clear all scanned codes
  const clearAllScanned = () => {
    setScannedCodes([]);
    setInvalidCodes([]);
    setApiError("");
    toast.success("Cleared all scanned codes", { duration: 1500 });
  };

  // Close scanner and reset
  const closeScanner = () => {
    setShowScanner(false);
    setScannedCodes([]);
    setInputValue("");
    setErrorMessage("");
    setApiError("");
    setInvalidCodes([]);
    setEditingIndex(null);
    setEditValue("");
  };

  // Handle add
  const handleAdd = async () => {
    if (scannedCodes.length === 0) {
      setApiError("Please scan at least 1 shipment to add.");
      return;
    }

    setLoading(true);
    setApiError("");
    setInvalidCodes([]);

    try {
      await packingsService.addShipments(packingCode, scannedCodes);

      toast.success("Shipment(s) added successfully!", { duration: 2000 });
      closeScanner();
      onSuccess && onSuccess();
    } catch (err) {
      let errorMsg = "Unknown error occurred";

      if (err?.response?.data?.error) {
        errorMsg = err.response.data.error;
        const codes = parseInvalidCodes(errorMsg);
        setInvalidCodes(codes);
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.response) {
        errorMsg = `HTTP ${err.response.status}: ${
          err.response.statusText || "Server error"
        }`;
      } else if (err?.request) {
        errorMsg = "Network error - No response received from server";
      } else if (err?.message) {
        errorMsg = err.message;
      }

      setApiError(errorMsg);

      const modalContent = document.querySelector(".modal-content-add");
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    } finally {
      setLoading(false);
    }
  };

  const disabled = disabledProp || loading || !packingCode;
  const isInvalidCode = (code) => invalidCodes.includes(code);

  // Scanner Modal
  const ScannerModal = () => {
    if (!showScanner) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={!loading ? closeScanner : undefined}
        />

        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-blue-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Add Shipments
                  </h3>
                  <p className="text-sm text-blue-100">
                    Packing: {packingCode}
                  </p>
                </div>
              </div>
              <button
                onClick={!loading ? closeScanner : undefined}
                disabled={loading}
                className="rounded-lg p-2 text-white hover:bg-white/10 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="modal-content-add max-h-[70vh] overflow-y-auto p-6">
              {/* API Error Message */}
              {apiError && (
                <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600" />
                    <div className="flex-1">
                      <h4 className="font-bold text-red-900">
                        Failed to Add Shipments
                      </h4>
                      <p className="mt-1 text-sm text-red-800">{apiError}</p>
                      <button
                        onClick={() => {
                          setApiError("");
                          setInvalidCodes([]);
                        }}
                        className="mt-3 text-sm font-semibold text-red-700 hover:text-red-800 underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Scanner Input */}
              <div className="mb-4">
                <div className="mb-3 flex items-center gap-2">
                  <Scan className="h-5 w-5 text-blue-600" />
                  <label className="text-sm font-bold text-gray-900">
                    Scan Shipment Barcode
                  </label>
                </div>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleScanInput}
                    placeholder="Scan or enter shipment code..."
                    disabled={loading}
                    autoFocus
                    autoComplete="off"
                    className={`w-full rounded-lg border-2 bg-white px-4 py-3 text-base font-semibold focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                      errorMessage
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-blue-400 focus:border-blue-600 focus:ring-blue-200"
                    }`}
                  />

                  {errorMessage && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">
                        {errorMessage}
                      </p>
                      <p className="mt-1 text-xs text-red-600">
                        Please check the code and try again
                      </p>
                    </div>
                  </div>
                )}

                {!errorMessage && (
                  <p className="mt-2 text-xs text-gray-600">
                    Press{" "}
                    <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 font-mono font-semibold">
                      Enter
                    </kbd>{" "}
                    after scanning or typing the code
                  </p>
                )}
              </div>

              {/* Scanned Codes List */}
              {scannedCodes.length > 0 ? (
                <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-bold text-gray-900">
                        Scanned: {scannedCodes.length} shipment
                        {scannedCodes.length !== 1 ? "s" : ""}
                      </p>
                      {invalidCodes.length > 0 && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          {invalidCodes.length} invalid
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearAllScanned}
                      disabled={loading}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {scannedCodes.map((code, index) => {
                      const isInvalid = isInvalidCode(code);
                      const isEditing = editingIndex === index;

                      return (
                        <div
                          key={`${code}-${index}`}
                          className={`flex items-center justify-between rounded-lg border-2 px-3 py-2.5 transition ${
                            isInvalid
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <div className="flex flex-1 items-center gap-3">
                            <span
                              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs font-bold ${
                                isInvalid
                                  ? "bg-red-200 text-red-800"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {index + 1}
                            </span>

                            {isEditing ? (
                              // Edit Mode - Input
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                onBlur={handleEditBlur}
                                className="flex-1 rounded border-2 border-blue-400 bg-white px-2 py-1 font-mono text-sm font-bold focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-200"
                              />
                            ) : (
                              // View Mode - Clickable Text
                              <span
                                onClick={() => startEdit(index, code)}
                                className={`flex-1 cursor-text font-mono text-sm font-bold ${
                                  isInvalid
                                    ? "text-red-900"
                                    : "text-gray-900 hover:text-blue-700"
                                }`}
                              >
                                {code}
                              </span>
                            )}

                            {isInvalid && !isEditing && (
                              <span className="text-xs font-semibold text-red-700">
                                Invalid
                              </span>
                            )}
                          </div>

                          {/* Delete Button - Always visible */}
                          <button
                            onClick={(e) => removeScannedCode(code, index, e)}
                            disabled={loading}
                            className={`ml-2 rounded p-1 disabled:opacity-50 ${
                              isInvalid
                                ? "text-red-600 hover:bg-red-100"
                                : "text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                            title="Remove this code"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <Scan className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-600">
                    No shipments scanned yet
                  </p>
                  <p className="text-xs text-gray-500">
                    Start scanning to add shipments
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex gap-3">
                <button
                  onClick={closeScanner}
                  disabled={loading}
                  className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={loading || scannedCodes.length === 0}
                  className={`flex-1 rounded-lg px-4 py-2.5 font-semibold text-white transition ${
                    loading || scannedCodes.length === 0
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Add{" "}
                      {scannedCodes.length > 0 && `(${scannedCodes.length})`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => {
          if (!packingCode) {
            toast.error("Missing packing code.");
            return;
          }
          setShowScanner(true);
        }}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
          disabled
            ? "cursor-not-allowed bg-gray-200 text-gray-400"
            : "bg-blue-600 text-white hover:bg-blue-700"
        } ${className}`}
        title="Add shipments"
      >
        <Plus className="h-4 w-4" />
        Add Shipment
      </button>

      <ScannerModal />
    </>
  );
};

export default AddShipment;
