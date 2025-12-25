import React, { useState, useEffect, useRef } from "react";
import {
  createShipment,
  getShipmentInfo,
} from "../../Services/Warehouse/warehouseShipmentService";
import warehouseService from "../../Services/Warehouse/warehouseService";
import UploadImg from "../../common/UploadImg";
import toast from "react-hot-toast";
import { Loader2, Package, CheckCircle2 } from "lucide-react";

const WarehouseJapan = () => {
  /* ================= STATE ================= */
  const [shipmentCodes, setShipmentCodes] = useState([]);
  const [shipmentId, setShipmentId] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingCodes, setLoadingCodes] = useState(false);

  const [orderInfo, setOrderInfo] = useState(null);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    length: "",
    width: "",
    height: "",
    weight: "",
    image: "",
    imageCheck: "",
  });

  const inputRef = useRef(null);

  /* ================= LOAD SHIPMENT CODES ================= */
  useEffect(() => {
    const fetchShipmentCodes = async () => {
      try {
        setLoadingCodes(true);
        const res = await warehouseService.getReadyWarehouses(0, 50, {
          trackingCode: "",
        });

        const codes =
          res?.content?.map((item) => item.trackingCode).filter(Boolean) || [];

        setShipmentCodes(codes);
      } catch (err) {
        console.error(err);
        toast.error("Cannot load shipment codes");
      } finally {
        setLoadingCodes(false);
      }
    };

    fetchShipmentCodes();
  }, []);

  /* ================= FETCH ORDER INFO ================= */
  const handleFetchOrderInfo = async (code) => {
    if (!code) return;
    setFetchingInfo(true);

    try {
      const data = await getShipmentInfo(code);
      setOrderInfo(data);
      toast.success("Order information loaded");
    } catch (err) {
      setOrderInfo(null);
      toast.error(
        err?.response?.data?.message || "Order information not found"
      );
    } finally {
      setFetchingInfo(false);
    }
  };

  /* ================= HANDLERS ================= */
  const handleSelectShipment = (code) => {
    setShipmentId(code);
    setShowDropdown(false);
    handleFetchOrderInfo(code);
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && !/^(\d+(\.\d*)?)$/.test(value)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (name, url) => {
    setFormData((prev) => ({ ...prev, [name]: url }));
  };

  const handleImageRemove = (name) => {
    setFormData((prev) => ({ ...prev, [name]: "" }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shipmentId) return toast.error("Please select a shipment code");
    if (!orderInfo) return toast.error("Order info not loaded");

    const { length, width, height, weight, image, imageCheck } = formData;

    if ([length, width, height, weight].some((v) => v === ""))
      return toast.error("Please fill all dimensions");

    if (!image) return toast.error("Main image is required");

    if (orderInfo.orders?.checkRequired && !imageCheck)
      return toast.error("Check image is required");

    setLoading(true);
    const t = toast.loading("Checking in shipment...");

    try {
      await createShipment(shipmentId, {
        length: Number(length),
        width: Number(width),
        height: Number(height),
        weight: Number(weight),
        image,
        imageCheck: imageCheck || "",
      });

      toast.dismiss(t);
      toast.success("Check-in successful");

      setShipmentId("");
      setOrderInfo(null);
      setFormData({
        length: "",
        width: "",
        height: "",
        weight: "",
        image: "",
        imageCheck: "",
      });
    } catch (err) {
      toast.dismiss(t);
      toast.error(err?.response?.data?.message || "Cannot check in shipment");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER SHIPMENT CODE ================= */
  const filteredCodes = shipmentCodes.filter((code) =>
    code.toUpperCase().includes(shipmentId.toUpperCase())
  );

  /* ================= RENDER ================= */
  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl p-5 mb-5 flex items-center gap-3">
          <Package className="text-white" />
          <h1 className="text-white font-semibold text-xl">
            Warehouse Japan – Import
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-5 space-y-5"
        >
          {/* Shipment Code */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              Shipment Code <span className="text-red-500">*</span>
            </label>

            <input
              ref={inputRef}
              value={shipmentId}
              onChange={(e) => {
                setShipmentId(e.target.value.toUpperCase());
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder={
                loadingCodes
                  ? "Loading shipment codes..."
                  : "Select shipment code"
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 uppercase font-mono"
              disabled={loading || loadingCodes}
            />

            {showDropdown && filteredCodes.length > 0 && (
              <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow max-h-60 overflow-auto">
                {filteredCodes.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSelectShipment(code)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 font-mono"
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}

            {fetchingInfo && (
              <Loader2 className="absolute right-3 top-9 w-4 h-4 animate-spin text-blue-600" />
            )}
          </div>

          {/* ================= ORDER INFORMATION (NEW UI) ================= */}
          {orderInfo && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">
                  Order Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white/60 rounded-lg p-2.5">
                  <p className="text-xs text-gray-600 mb-0.5">Order Code</p>
                  <p className="font-semibold text-gray-900 truncate">
                    {orderInfo.orders?.orderCode || "N/A"}
                  </p>
                </div>

                <div className="bg-white/60 rounded-lg p-2.5">
                  <p className="text-xs text-gray-600 mb-0.5">Customer Code</p>
                  <p className="font-semibold text-gray-900">
                    {orderInfo.customerCode || "N/A"}
                  </p>
                </div>

                <div className="bg-white/60 rounded-lg p-2.5">
                  <p className="text-xs text-gray-600 mb-0.5">Order Type</p>
                  <p className="font-semibold text-gray-900">
                    {orderInfo.orders?.orderType || "N/A"}
                  </p>
                </div>

                <div className="bg-white/60 rounded-lg p-2.5">
                  <p className="text-xs text-gray-600 mb-0.5">Customer Name</p>
                  <p className="font-semibold text-gray-900 truncate">
                    {orderInfo.orders?.customer?.name || "N/A"}
                  </p>
                </div>

                <div className="bg-yellow-300 border border-yellow-400 rounded-md p-2.5 text-center">
                  <p className="text-[11px] font-semibold text-gray-800 uppercase tracking-wide">
                    Destination
                  </p>
                  <p className="font-bold text-lg text-gray-900 truncate">
                    {orderInfo.destinationName || "N/A"}
                  </p>
                </div>

                <div className="bg-blue-200 border border-blue-300 rounded-md p-2.5 text-center">
                  <p className="text-[11px] font-semibold text-gray-800 uppercase tracking-wide">
                    Price
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    {orderInfo.price !== undefined
                      ? Number(orderInfo.price).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dimensions */}
          <div className="grid grid-cols-4 gap-3">
            {["length", "width", "height", "weight"].map((f) => (
              <input
                key={f}
                name={f}
                value={formData[f]}
                onChange={handleDimensionChange}
                placeholder={f}
                disabled={!orderInfo}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
            ))}
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <UploadImg
              imageUrl={formData.image}
              onImageUpload={(url) => handleImageUpload("image", url)}
              onImageRemove={() => handleImageRemove("image")}
              disabled={!orderInfo}
            />
            <UploadImg
              imageUrl={formData.imageCheck}
              onImageUpload={(url) => handleImageUpload("imageCheck", url)}
              onImageRemove={() => handleImageRemove("imageCheck")}
              disabled={!orderInfo}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !orderInfo}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing
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
  );
};

export default WarehouseJapan;
