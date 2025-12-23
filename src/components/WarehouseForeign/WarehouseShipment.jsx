import React, { useState, useRef, useEffect } from "react";
import {
  createShipment,
  getShipmentInfo,
} from "../../Services/Warehouse/warehouseShipmentService";
import UploadImg from "../../common/UploadImg";
import toast from "react-hot-toast";
import { Loader2, Package, CheckCircle2, MapPin } from "lucide-react";

const WarehouseShipment = () => {
  const [formData, setFormData] = useState({
    length: "",
    width: "",
    height: "",
    weight: "",
    image: "",
    imageCheck: "",
  });
  const [shipmentId, setShipmentId] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);

  const shipmentInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Allow decimal input while typing
  const numberRegex = /^(\d+(\.\d*)?|\.\d*)$/;

  useEffect(() => {
    shipmentInputRef.current?.focus();
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleFetchOrderInfo = async (trackingNumber) => {
    if (!trackingNumber.trim()) {
      setOrderInfo(null);
      return;
    }
    setFetchingInfo(true);
    try {
      const data = await getShipmentInfo(trackingNumber.trim());
      setOrderInfo(data);
      toast.success("Order information loaded!");
    } catch (error) {
      setOrderInfo(null);
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Order information not found";
      toast.error(errorMsg);
    } finally {
      setFetchingInfo(false);
    }
  };

  const handleTrackingChange = (e) => {
    // Tự động chuyển thành chữ hoa
    const value = e.target.value.toUpperCase();
    setShipmentId(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      if (value.trim()) handleFetchOrderInfo(value);
      else setOrderInfo(null);
      debounceTimerRef.current = null;
    }, 800);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (["length", "width", "height", "weight"].includes(name)) {
      if (value !== "" && !numberRegex.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (name, imageUrl) => {
    setFormData((prev) => ({ ...prev, [name]: imageUrl }));
  };

  const handleImageRemove = (name) => {
    setFormData((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!shipmentId?.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }

    if (!orderInfo) {
      toast.error("Please wait for order information to load");
      return;
    }

    if (
      formData.length === "" ||
      formData.width === "" ||
      formData.height === "" ||
      formData.weight === ""
    ) {
      toast.error("Please fill in all dimension and weight fields");
      return;
    }

    if (!formData.image) {
      toast.error("Please upload the main image");
      return;
    }

    // Logic: bắt buộc imageCheck nếu checkRequired = true
    const checkRequired = orderInfo.orders?.checkRequired;
    if (checkRequired === true && !formData.imageCheck) {
      toast.error(
        "Please upload the check image since order requires checking"
      );
      return;
    }

    // Convert to numbers for validation and API
    const l = Number(formData.length);
    const w = Number(formData.width);
    const h = Number(formData.height);
    const wt = Number(formData.weight);

    if ([l, w, h, wt].some((v) => isNaN(v) || v <= 0)) {
      toast.error("Dimensions and weight must be numbers greater than 0");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Checking in shipment...");

    try {
      const shipmentData = {
        length: l,
        width: w,
        height: h,
        weight: wt,
        image: formData.image,
        imageCheck: formData.imageCheck || "",
      };

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      const result = await createShipment(shipmentId.trim(), shipmentData);

      toast.dismiss(loadingToast);

      const successMessage =
        result?.message || result?.data?.message || "Check-in successful!";
      toast.success(successMessage);

      // Reset form
      setFormData({
        length: "",
        width: "",
        height: "",
        weight: "",
        image: "",
        imageCheck: "",
      });
      setShipmentId("");
      setOrderInfo(null);
      shipmentInputRef.current?.focus();
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Cannot check in shipment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading && !fetchingInfo) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      CHO_NHAP_KHO_NN: "Pending Import",
      MUA_HO: "Purchase Order",
      DAU_GIA: "Auction Order",
      KY_GUI: "Consignment Order",
      HOAT_DONG: "Active",
    };
    return statusMap[status] || status;
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Warehouse Import & Weighing
              </h1>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tracking Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Enter or scan tracking number. It will be automatically
                converted to UPPERCASE.
              </p>
              <div className="relative">
                <input
                  id="trackingNumber"
                  ref={shipmentInputRef}
                  type="text"
                  value={shipmentId}
                  onChange={handleTrackingChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Example: SPX123456678"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase font-mono"
                  disabled={loading}
                  autoFocus
                  aria-label="Tracking Number"
                />
                {fetchingInfo && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    role="status"
                    aria-live="polite"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Order Info */}
            {orderInfo && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">
                    Order Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Order Code */}
                  <div className="bg-white/60 rounded-lg p-2.5">
                    <p className="text-xs text-gray-600 mb-0.5">Order Code</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {orderInfo.orders?.orderCode}
                    </p>
                  </div>

                  {/* Customer Code */}
                  <div className="bg-white/60 rounded-lg p-2.5">
                    <p className="text-xs text-gray-600 mb-0.5">
                      Customer Code
                    </p>
                    <p className="font-semibold text-gray-900">
                      {orderInfo.customerCode}
                    </p>
                  </div>

                  {/* Order Type */}
                  <div className="bg-white/60 rounded-lg p-2.5">
                    <p className="text-xs text-gray-600 mb-0.5">Order Type</p>
                    <p className="font-semibold text-gray-900">
                      {getStatusDisplay(orderInfo.orders?.orderType)}
                    </p>
                  </div>

                  {/* Customer Name */}
                  <div className="bg-white/60 rounded-lg p-2.5">
                    <p className="text-xs text-gray-600 mb-0.5">
                      Customer Name
                    </p>
                    <p className="font-semibold text-gray-900 truncate">
                      {orderInfo.orders?.customer?.name}
                    </p>
                  </div>

                  {/* Destination */}
                  <div className="bg-yellow-300 border border-yellow-400 rounded-md  p-2.5 text-center">
                    <p className="text-[11px] font-semibold text-gray-800 uppercase tracking-wide leading-tight">
                      Destination
                    </p>
                    <p className="font-bold text-lg text-gray-900 leading-tight truncate">
                      {orderInfo.destinationName || "N/A"}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="bg-blue-200 border border-blue-300 rounded-md  p-2.5 text-center">
                    <p className="text-[11px] font-semibold text-gray-800 uppercase tracking-wide leading-tight">
                      Price
                    </p>
                    <p className="font-bold text-lg text-gray-900 leading-tight">
                      {orderInfo.price !== undefined
                        ? Number(orderInfo.price).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  {/* Check Required - Big Box */}
                  <div
                    className={`md:col-span-2 rounded-lg p-4 text-center border-2 ${
                      orderInfo.orders?.checkRequired
                        ? "bg-red-100 border-red-400"
                        : "bg-green-100 border-green-400"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-1">
                      Check Required
                    </p>
                    <p
                      className={`font-bold text-2xl ${
                        orderInfo.orders?.checkRequired
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      {orderInfo.orders?.checkRequired
                        ? "YES – MUST CHECK"
                        : "NO – PASSED"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            {orderInfo && <div className="border-t border-gray-200"></div>}

            {/* Dimensions & Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions & Weight
              </label>
              <div className="grid grid-cols-4 gap-3">
                {["length", "width", "height", "weight"].map((dim) => (
                  <div key={dim}>
                    <label className="block text-xs text-gray-600 mb-1 capitalize">
                      {dim} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name={dim}
                      value={formData[dim]}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="0"
                      disabled={loading || !orderInfo}
                      inputMode="decimal"
                      aria-label={dim}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">
                    Main Image <span className="text-red-500">*</span>
                  </label>
                  <UploadImg
                    imageUrl={formData.image}
                    onImageUpload={(url) => handleImageUpload("image", url)}
                    onImageRemove={() => handleImageRemove("image")}
                    maxSizeMB={3}
                    placeholder="Upload main image (max 3MB)"
                    disabled={!orderInfo}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-2">
                    Check Image{" "}
                    {orderInfo?.orders?.checkRequired === true && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <UploadImg
                    imageUrl={formData.imageCheck}
                    onImageUpload={(url) =>
                      handleImageUpload("imageCheck", url)
                    }
                    onImageRemove={() => handleImageRemove("imageCheck")}
                    maxSizeMB={3}
                    placeholder="Upload check image (max 3MB)"
                    disabled={!orderInfo}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || fetchingInfo || !orderInfo}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Check In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WarehouseShipment;
