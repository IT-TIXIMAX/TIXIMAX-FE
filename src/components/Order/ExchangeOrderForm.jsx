import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronDown,
  AlertCircle,
  CheckCircle,
  User,
  MapPin,
  Banknote,
  Calculator,
  DollarSign,
  ArrowRightLeft,
} from "lucide-react";
import exchangeOrderService from "../../Services/LeadSale/exchangeOrderService"; // ✅ NEW
import routesService from "../../Services/StaffSale/routeService";
import toast from "react-hot-toast";
import AccountSearch from "./AccountSearch";
import ConfirmDialog from "../../common/ConfirmDialog";

// 🎯 Helper functions để format số
const formatNumber = (value) => {
  if (!value && value !== 0) return "";
  const num = String(value).replace(/\./g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumber = (value) => {
  if (!value) return "";
  const cleaned = String(value).replace(/\./g, "");
  return cleaned;
};

const ExchangeOrderForm = () => {
  // States
  const [preliminary, setPreliminary] = useState({
    customerCode: "",
    routeId: "",
  });

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form, setForm] = useState({
    exchangeRate: "",
    moneyExChange: "",
    fee: "",
    note: "", // ✅ NEW
  });

  const [masterData, setMasterData] = useState({
    routes: [],
  });

  const [ui, setUi] = useState({
    error: null,
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch routes on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setUi((prev) => ({ ...prev, error: null }));
        const token = localStorage.getItem("token");

        const routesData = await routesService.getRoutesByAccount(token);

        setMasterData({
          routes: routesData || [],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage =
          error.response?.status === 401
            ? "Token đã hết hạn. Vui lòng đăng nhập lại."
            : error.response?.status === 404
            ? "Không tìm thấy API. Kiểm tra cấu hình server."
            : "Lỗi khi tải dữ liệu.";
        setUi((prev) => ({ ...prev, error: errorMessage }));
      }
    };

    fetchData();
  }, []);

  // Handlers
  const handleSelectCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setPreliminary((prev) => ({
      ...prev,
      customerCode: customer.customerCode,
    }));

    toast.success(
      `Đã chọn khách hàng: ${customer.name} (${customer.customerCode})`
    );
  }, []);

  const handleCustomerCodeChange = useCallback(
    (e) => {
      const value = e.target.value;
      setPreliminary((prev) => ({
        ...prev,
        customerCode: value,
      }));

      if (
        !value ||
        (selectedCustomer && value !== selectedCustomer.customerCode)
      ) {
        setSelectedCustomer(null);
      }
    },
    [selectedCustomer]
  );

  const handleClearCustomer = useCallback(() => {
    setPreliminary((prev) => ({ ...prev, customerCode: "" }));
    setSelectedCustomer(null);
    toast("Đã xóa thông tin khách hàng");
  }, []);

  const handleRouteChange = useCallback(
    (e) => {
      const routeId = Number(e.target.value || 0);

      const selectedRoute = masterData.routes.find(
        (route) => route.routeId === routeId
      );

      setPreliminary((prev) => ({
        ...prev,
        routeId: routeId,
      }));

      // Auto-fill tỷ giá
      if (selectedRoute?.exchangeRate) {
        setForm((prev) => ({
          ...prev,
          exchangeRate: Number(selectedRoute.exchangeRate) || "",
        }));

        toast.success(
          `Tỷ giá hôm nay: ${formatNumber(selectedRoute.exchangeRate)} VND`
        );
      } else {
        setForm((prev) => ({
          ...prev,
          exchangeRate: "",
        }));
      }
    },
    [masterData.routes]
  );

  // 🎯 Handler cho number inputs với format
  const handleNumberChange = useCallback((e) => {
    const { name, value } = e.target;

    // Chỉ cho phép số và dấu chấm
    const cleaned = value.replace(/[^\d.]/g, "");

    // Parse về number (remove dots)
    const numberValue = parseNumber(cleaned);

    // Validate: chỉ số
    if (numberValue && !/^\d+$/.test(numberValue)) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: numberValue ? Number(numberValue) : "",
    }));
  }, []);

  // ✅ NEW: handler cho text input (note)
  const handleTextChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Calculations
  const calculations = useMemo(() => {
    const rate = Number(form.exchangeRate) || 0;
    const moneyExchange = Number(form.moneyExChange) || 0;
    const fee = Number(form.fee) || 0;

    const totalVND = moneyExchange * rate;
    const totalWithFee = totalVND + fee;
    const feePercent = totalVND > 0 ? (fee / totalVND) * 100 : 0;

    return {
      totalVND,
      totalWithFee,
      feePercent,
      isValid: rate > 0 && moneyExchange > 0 && fee >= 0,
    };
  }, [form.exchangeRate, form.moneyExChange, form.fee]);

  // Submit handlers
  const handleSubmitClick = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  const handleConfirmSubmit = useCallback(async () => {
    // Validation
    if (!preliminary.customerCode) {
      toast.error("Vui lòng chọn khách hàng");
      setShowConfirmDialog(false);
      return;
    }
    if (!preliminary.routeId) {
      toast.error("Vui lòng chọn tuyến đường");
      setShowConfirmDialog(false);
      return;
    }

    const rate = Number(form.exchangeRate || 0);
    const money = Number(form.moneyExChange || 0);
    const fee = Number(form.fee || 0);

    if (!Number.isFinite(rate) || rate <= 0) {
      toast.error("Tỷ giá phải > 0");
      setShowConfirmDialog(false);
      return;
    }
    if (!Number.isFinite(money) || money <= 0) {
      toast.error("Số tiền chuyển phải > 0");
      setShowConfirmDialog(false);
      return;
    }
    if (!Number.isFinite(fee) || fee < 0) {
      toast.error("Phí dịch vụ phải ≥ 0");
      setShowConfirmDialog(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        exchangeRate: rate,
        moneyExChange: money,
        fee: fee,
        note: form.note || "", // ✅ NEW
      };

      // ✅ CHANGED: Use exchangeOrderService.createExchangeOrder
      const result = await exchangeOrderService.createExchangeOrder(
        preliminary.customerCode,
        Number(preliminary.routeId),
        orderData
      );

      toast.success(
        `Tạo đơn chuyển tiền thành công! Mã đơn: ${result.orderCode || ""}`
      );

      // Reset form
      setPreliminary({ customerCode: "", routeId: "" });
      setSelectedCustomer(null);
      setForm({
        exchangeRate: "",
        moneyExChange: "",
        fee: "",
        note: "", // ✅ NEW
      });
    } catch (error) {
      console.error("Error creating exchange order:", error);

      let errorMessage = "Tạo đơn chuyển tiền thất bại";
      if (error.response) {
        const backendError =
          error.response.data?.error ||
          error.response.data?.message ||
          error.response.data?.detail ||
          error.response.data?.errors;

        if (backendError) {
          if (
            typeof backendError === "object" &&
            !Array.isArray(backendError)
          ) {
            const errorMessages = Object.entries(backendError)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(", ");
            errorMessage = `Lỗi validation: ${errorMessages}`;
          } else if (Array.isArray(backendError)) {
            errorMessage = backendError.join(", ");
          } else {
            errorMessage = backendError;
          }
        } else {
          errorMessage = `Lỗi ${error.response.status}: ${
            error.response.statusText || "Không xác định"
          }`;
        }
      } else if (error.request) {
        errorMessage =
          "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.";
      } else {
        errorMessage = error.message || "Đã xảy ra lỗi không xác định";
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  }, [preliminary, form]);

  const isFormEnabled = preliminary.customerCode && preliminary.routeId;

  const selectedRoute = useMemo(
    () =>
      masterData.routes.find(
        (route) => route.routeId === Number(preliminary.routeId)
      ),
    [masterData.routes, preliminary.routeId]
  );

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">
              Tạo đơn chuyển tiền
            </h1>
          </div>

          {ui.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{ui.error}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Form Info */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            {/* Customer & Route & Exchange Details - Combined into ONE Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-6">
                {/* Customer Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Thông tin khách hàng <span className="text-red-500">*</span>
                  </h3>
                  <AccountSearch
                    onSelectAccount={handleSelectCustomer}
                    value={preliminary.customerCode}
                    onChange={handleCustomerCodeChange}
                    onClear={handleClearCustomer}
                  />
                  {selectedCustomer && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-900">
                        {selectedCustomer.name}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {selectedCustomer.email}
                      </p>
                      <p className="text-xs text-blue-600">
                        {selectedCustomer.phone}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200" />

                {/* Route Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Tuyến đường <span className="text-red-500">*</span>
                  </h3>
                  <div className="relative">
                    <select
                      name="routeId"
                      value={preliminary.routeId}
                      onChange={handleRouteChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
                      required
                      disabled={!!ui.error}
                    >
                      <option value="">
                        {ui.error
                          ? "Không thể tải tuyến đường"
                          : "Chọn tuyến đường"}
                      </option>
                      {masterData.routes.map((route) => (
                        <option key={route.routeId} value={route.routeId}>
                          {route.name} ({route.shipTime} ngày)
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Exchange Details Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-purple-500" />
                    Thông tin chuyển tiền
                  </h3>

                  {/* Tỷ giá */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỷ giá (VND) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="exchangeRate"
                        value={formatNumber(form.exchangeRate)}
                        onChange={handleNumberChange}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Nhập tỷ giá "
                        disabled={!isFormEnabled}
                      />
                    </div>
                  </div>

                  {/* Số tiền chuyển */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số tiền chuyển (¥/$/₩){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="moneyExChange"
                        value={formatNumber(form.moneyExChange)}
                        onChange={handleNumberChange}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Nhập số tiền "
                        disabled={!isFormEnabled}
                      />
                    </div>
                  </div>

                  {/* Phí dịch vụ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phí dịch vụ (VND) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="fee"
                        value={formatNumber(form.fee)}
                        onChange={handleNumberChange}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Nhập phí dịch vụ "
                        disabled={!isFormEnabled}
                      />
                    </div>
                  </div>

                  {/* ✅ NEW: Ghi chú */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleTextChange}
                      rows={3}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Nhập ghi chú (không bắt buộc)"
                      disabled={!isFormEnabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Summary & Preview */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Chi tiết tính toán
                </h2>
              </div>

              {!isFormEnabled ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Vui lòng chọn khách hàng và tuyến đường để xem chi tiết
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Input Summary */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">
                      Thông tin đầu vào
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-blue-600 mb-1">Tỷ giá</p>
                        <p className="text-lg font-bold text-blue-900">
                          {form.exchangeRate
                            ? `${formatNumber(form.exchangeRate)} VND`
                            : "---"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 mb-1">
                          Số tiền chuyển
                        </p>
                        <p className="text-lg font-bold text-blue-900">
                          {form.moneyExChange
                            ? formatNumber(form.moneyExChange)
                            : "---"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Calculation Details */}
                  {calculations.totalVND > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">
                          Giá trị quy đổi
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatNumber(calculations.totalVND)} VND
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">
                          Phí dịch vụ
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatNumber(form.fee || 0)} VND
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-4">
                        <span className="text-base font-semibold text-gray-800">
                          Tổng thanh toán
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {formatNumber(calculations.totalWithFee)} VND
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Customer Info */}
                  {selectedCustomer && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Thông tin người nhận
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tên khách hàng:</span>
                          <span className="font-semibold text-gray-900">
                            {selectedCustomer.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã khách hàng:</span>
                          <span className="font-mono text-blue-600">
                            {selectedCustomer.customerCode}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số điện thoại:</span>
                          <span className="text-gray-900">
                            {selectedCustomer.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {!isFormEnabled && (
                <span className="text-amber-600 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Vui lòng chọn khách hàng và tuyến đường để tiếp tục
                  </span>
                </span>
              )}
              {isFormEnabled && !calculations.isValid && (
                <span className="text-amber-600 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Vui lòng nhập đầy đủ thông tin chuyển tiền
                  </span>
                </span>
              )}
              {isFormEnabled && calculations.isValid && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Sẵn sàng tạo đơn chuyển tiền
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleSubmitClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center space-x-2"
              disabled={!isFormEnabled || !calculations.isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Hoàn thành tạo đơn</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ConfirmDialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmSubmit}
          title="Xác nhận tạo đơn chuyển tiền"
          message={
            <div className="space-y-3">
              <p className="text-gray-700">
                Vui lòng xem lại thông tin đơn trước khi tạo
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedCustomer?.name} ({selectedCustomer?.customerCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tuyến đường:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedRoute?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tỷ giá:</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(form.exchangeRate)} VND
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền chuyển:</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(form.moneyExChange)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí dịch vụ:</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(form.fee)} VND
                  </span>
                </div>

                {/* ✅ NEW: Note in confirm */}
                {form.note && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600 shrink-0">Ghi chú:</span>
                    <span className="font-semibold text-gray-900 text-right whitespace-pre-wrap">
                      {form.note}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold">
                      Tổng cộng:
                    </span>
                    <span className="font-bold text-green-600 text-base">
                      {formatNumber(calculations.totalWithFee)} VND
                    </span>
                  </div>
                </div>
              </div>
            </div>
          }
          confirmText="Tạo đơn chuyển tiền"
          cancelText="Hủy"
          loading={isSubmitting}
          loadingText="Đang tạo đơn"
          type="info"
        />
      </div>
    </div>
  );
};

export default ExchangeOrderForm;
