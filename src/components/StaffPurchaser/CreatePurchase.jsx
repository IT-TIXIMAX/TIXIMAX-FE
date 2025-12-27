import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import createPurchaseService from "../../Services/StaffPurchase/createPurchaseService";
import UploadImg from "../../common/UploadImg";
import { Package, ShoppingCart } from "lucide-react";

const CreatePurchase = ({
  isOpen,
  onClose,
  orderCode,
  selectedTrackingCodes = [],
  selectedProducts = [],
  onSuccess,
}) => {
  const [purchaseData, setPurchaseData] = useState({
    purchaseTotal: "",
    image: "",
    note: "",
    shipmentCode: "",
  });
  const [creatingPurchase, setCreatingPurchase] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPurchaseData({
        purchaseTotal: "",
        image: "",
        note: "",
        shipmentCode: "",
        exchangeRate: "",
      });
    }
  }, [isOpen]);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "";

    const stringValue = value.toString();

    // Nếu đang nhập và kết thúc bằng dấu chấm, giữ nguyên
    if (stringValue.endsWith(".")) {
      const integerPart = stringValue.slice(0, -1);
      if (integerPart === "") return ".";
      const formattedInteger = parseInt(integerPart).toLocaleString("en-US");
      return `${formattedInteger}.`;
    }

    const parts = stringValue.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Nếu chỉ có dấu chấm
    if (integerPart === "" && decimalPart === undefined) {
      return "";
    }

    // Format phần nguyên với dấu phẩy
    const formattedInteger = integerPart
      ? parseInt(integerPart).toLocaleString("en-US")
      : "0";

    // Nếu có phần thập phân, giữ nguyên
    if (decimalPart !== undefined) {
      return `${formattedInteger}.${decimalPart}`;
    }

    return formattedInteger;
  };

  // Hàm format với 2 chữ số thập phân cho Grand Total và Suggested
  const formatCurrencyWithDecimals = (value) => {
    if (!value && value !== 0) return "0.00";

    const number = Number(value);
    const fixed = number.toFixed(2);
    const [integerPart, decimalPart] = fixed.split(".");
    const formattedInteger = parseInt(integerPart).toLocaleString("en-US");

    return `${formattedInteger}.${decimalPart}`;
  };

  const getRawValue = (value) => value.toString().replace(/,/g, "");
  const isValidDecimal = (value) => /^\d*\.?\d*$/.test(value) || value === "";

  const handlePurchaseTotalChange = (e) => {
    const value = e.target.value;
    const cleanValue = getRawValue(value);
    if (isValidDecimal(cleanValue)) {
      setPurchaseData((prev) => ({ ...prev, purchaseTotal: cleanValue }));
    }
  };
  const handleExtraRateChange = (e) => {
    const value = e.target.value;
    const cleanValue = getRawValue(value);
    if (isValidDecimal(cleanValue)) {
      setPurchaseData((prev) => ({ ...prev, exchangeRate: cleanValue }));
    }
  };
  const handlePurchaseTotalBlur = () => {
    const currentValue = getRawValue(purchaseData.purchaseTotal);
    if (currentValue) {
      const numValue = parseFloat(currentValue);
      if (!isNaN(numValue) && numValue >= 0) {
        // Làm tròn lên 2 số thập phân
        const roundedValue = numValue.toFixed(2);
        setPurchaseData((prev) => ({
          ...prev,
          purchaseTotal: roundedValue,
        }));
      }
    }
  };

  const handleImageUpload = (imageUrl) =>
    setPurchaseData((prev) => ({ ...prev, image: imageUrl }));

  const handleImageRemove = () =>
    setPurchaseData((prev) => ({ ...prev, image: "" }));

  // Calculate total from selected products
  const calculatedTotal = selectedProducts.reduce(
    (sum, product) => sum + (product.totalWeb || 0),
    0
  );

  // Check if entered amount is higher than calculated
  const getAmountWarning = () => {
    if (!purchaseData.purchaseTotal) return null;

    const enteredAmount = Number(getRawValue(purchaseData.purchaseTotal));

    // Chỉ show warning nếu cao hơn calculated total + 1
    if (enteredAmount >= calculatedTotal + 1) {
      return {
        isHigher: true,
        enteredAmount,
      };
    }

    return null;
  };

  const amountWarning = getAmountWarning();

  const handleSubmitPurchase = async () => {
    try {
      setCreatingPurchase(true);

      if (selectedTrackingCodes.length === 0) {
        toast.error("No products selected");
        return;
      }

      const rawPurchaseTotal = getRawValue(purchaseData.purchaseTotal);
      if (!rawPurchaseTotal || Number(rawPurchaseTotal) <= 0) {
        toast.error("Please enter a valid total amount (> 0)");
        return;
      }

      if (!purchaseData.image || purchaseData.image === "string") {
        toast.error("Please upload purchase image");
        return;
      }

      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      const payload = {
        purchaseTotal: Number(rawPurchaseTotal),
        image: purchaseData.image,
        note: purchaseData.note || "",
        shipmentCode: purchaseData.shipmentCode || "",
        exchangeRate: purchaseData.exchangeRate || "",
        trackingCode: selectedTrackingCodes,
      };

      await createPurchaseService.createPurchase(orderCode, payload, token);

      toast.success("Purchase created successfully!");
      handleClose();
      onSuccess?.();
    } catch (error) {
      let errorMessage = "An error occurred while creating purchase";

      if (error.response) {
        const { data, status } = error.response;
        if (data?.message) errorMessage = data.message;
        else if (data?.error) errorMessage = data.error;
        else if (typeof data === "string") errorMessage = data;
        else if (data?.errors) {
          errorMessage = data.errors
            .map((err) => err.message || err.msg)
            .join(", ");
        }

        if (status === 401) {
          localStorage.removeItem("jwt");
          errorMessage = "Session expired. Please login again.";
        }
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setCreatingPurchase(false);
    }
  };

  const handleClose = () => {
    setPurchaseData({
      purchaseTotal: "",
      image: "",
      note: "",
      shipmentCode: "",
      exchangeRate: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="inline-block w-1 h-6 bg-blue-600 rounded"></span>
                Purchase Order - {orderCode}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Product Details Table */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Selected Product Details
            </h4>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        No.
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        Product Name
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">
                        Web Price
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">
                        Shipping
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedProducts.map((product, index) => (
                      <tr
                        key={product.trackingCode || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>

                        <td className="px-4 py-3 text-gray-900">
                          <div
                            className="max-w-xs truncate"
                            title={product.productName}
                          >
                            {product.productName || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-900 font-medium">
                          {product.quantity || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {formatCurrency(product.priceWeb || 0)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {formatCurrency(product.shipWeb || 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatCurrency(product.totalWeb || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-3 text-right font-bold text-gray-900"
                      >
                        Grand Total:
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-700 text-base">
                        {formatCurrencyWithDecimals(calculatedTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Warning if entered amount is higher than calculated */}
            {amountWarning && (
              <div className="mt-3 p-3 border rounded-lg flex items-start gap-2 bg-red-50 border-red-200">
                <div className="text-sm text-red-800">
                  <span className="font-medium">Warning:</span> The total amount
                  is (
                  <span className="font-semibold">
                    {formatCurrency(amountWarning.enteredAmount)}
                  </span>
                  ) is <span className="font-semibold">HIGHER</span> than the
                  calculated product total (
                  <span className="font-semibold">
                    {formatCurrencyWithDecimals(calculatedTotal)}
                  </span>
                  )<p>Please contact your Sale team.</p>
                </div>
              </div>
            )}
          </div>

          {/* Purchase Form */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Purchase Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatCurrency(purchaseData.purchaseTotal || "")}
                  onChange={handlePurchaseTotalChange}
                  onBlur={handlePurchaseTotalBlur}
                  className="w-full border-2 border-red-500 rounded-md px-3 py-2 focus:border-black focus:ring-0 outline-none"
                  placeholder={`Suggested: ${formatCurrencyWithDecimals(
                    calculatedTotal
                  )}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={purchaseData.shipmentCode}
                  onChange={(e) =>
                    setPurchaseData((prev) => ({
                      ...prev,
                      shipmentCode: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-gray-500 rounded-md px-3 py-2 focus:border-black focus:ring-0 outline-none"
                  placeholder="Shipment code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ExtraRate (Only US-Route)
                </label>
                <input
                  type="text"
                  onChange={handleExtraRateChange}
                  className="w-full border-2 border-gray-500 rounded-md px-3 py-2 focus:border-black focus:ring-0 outline-none"
                  placeholder="Extra rate"
                />
              </div>
            </div>

            <UploadImg
              imageUrl={purchaseData.image}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              label="Purchase Image"
              required={true}
              maxSizeMB={3}
            />

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={purchaseData.note}
                onChange={(e) =>
                  setPurchaseData((prev) => ({ ...prev, note: e.target.value }))
                }
                rows={3}
                className="w-full border-2 border-gray-500 rounded-md px-3 py-2 focus:border-black focus:ring-0 outline-none"
                placeholder="Add notes (optional)"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmitPurchase}
              disabled={
                creatingPurchase ||
                !purchaseData.purchaseTotal ||
                selectedTrackingCodes.length === 0 ||
                !purchaseData.image
              }
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {creatingPurchase && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {creatingPurchase ? "Creating..." : "Create Purchase"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchase;
