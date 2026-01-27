import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  Mail,
  Phone,
  User,
  MapPin,
  Users,
  Copy,
  Check,
  UserPlus,
  Lock,
  AlertCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import registrationByStaffService from "../../Services/Auth/RegistrationByStaffService";
import { getToken } from "../../Services/Auth/authService";
import { toast } from "react-hot-toast";

// Optimized InputField component with React.memo
const InputField = React.memo(
  ({
    label,
    icon: Icon,
    name,
    type = "text",
    placeholder,
    required,
    isTextarea,
    value,
    onChange,
    error,
  }) => (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
        <Icon className="w-4 h-4 mr-2" />
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {isTextarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className={`w-full border-2 rounded-lg p-3 pl-10 text-sm outline-none focus:ring-0 resize-none transition-all ${
              error
                ? "border-red-500 bg-red-50 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full border-2 rounded-lg p-3 pl-10 text-sm outline-none focus:ring-0 transition-all ${
              error
                ? "border-red-500 bg-red-50 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
            required={required}
          />
        )}
        <Icon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-2 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  ),
);

// Empty state khi chưa có account
const EmptyLoginState = React.memo(() => (
  <div className="text-center py-12 text-gray-500">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Lock className="w-8 h-8 text-gray-300" />
    </div>
    <p className="text-sm font-medium">Chưa có thông tin đăng nhập</p>
  </div>
));

const CopyButton = React.memo(({ onClick, copied, text }) => (
  <button
    onClick={onClick}
    type="button"
    className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-all ${
      copied
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {copied ? (
      <>
        <Check className="w-4 h-4" />
        Đã sao chép
      </>
    ) : (
      <>
        <Copy className="w-4 h-4" />
        {text || "Sao chép"}
      </>
    )}
  </button>
));

const CreateAccountUser = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [createdAccount, setCreatedAccount] = useState(null);
  const [copiedField, setCopiedField] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    name: "",
    role: "CUSTOMER",
    address: "",
    source: "",
  });

  // Refs for debouncing
  const errorTimeoutRef = useRef({});
  const copyTimeoutRef = useRef();

  // Memoized initial form data
  const initialFormData = useMemo(
    () => ({
      email: "",
      phone: "",
      name: "",
      role: "CUSTOMER",
      address: "",
      source: "",
    }),
    [],
  );

  // Optimized copy function
  const copyToClipboard = useCallback(async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);

      const message = fieldName === "login" ? "thông tin đăng nhập" : fieldName;
      toast.success(`Đã sao chép ${message}!`);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopiedField("");
      }, 2000);
    } catch {
      toast.error("Sao chép thất bại!");
    }
  }, []);

  // Optimized input change handler
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (errors[name]) {
        if (errorTimeoutRef.current[name]) {
          clearTimeout(errorTimeoutRef.current[name]);
        }

        errorTimeoutRef.current[name] = setTimeout(() => {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }, 500);
      }
    },
    [errors],
  );

  // Optimized form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      Object.values(errorTimeoutRef.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
      errorTimeoutRef.current = {};

      const validation =
        registrationByStaffService.validateStaffRegistrationData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        toast.error("Vui lòng kiểm tra lại thông tin!");
        return;
      }

      setLoading(true);
      setErrors({});

      try {
        const token = getToken();
        if (!token) throw new Error("Không tìm thấy token xác thực");

        const registrationData = { username: "", password: "", ...formData };
        const result = await registrationByStaffService.registerCustomerByStaff(
          registrationData,
          token,
        );

        setCreatedAccount(result);
        toast.success("Tạo tài khoản thành công!");
      } catch (err) {
        let message = "Tạo tài khoản thất bại!";

        if (err.response?.data) {
          // Ưu tiên lấy message trước
          if (err.response.data.message) {
            message = err.response.data.message;
          } else if (typeof err.response.data === "string") {
            message = err.response.data;
          } else if (
            typeof err.response.data === "object" &&
            err.response.data.error
          ) {
            message = err.response.data.error;
          }
        } else if (err.message) {
          message = err.message;
        }

        setErrors({ general: message });
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [formData],
  );

  // Optimized reset function
  const handleCreateAnother = useCallback(() => {
    Object.values(errorTimeoutRef.current).forEach((timeout) => {
      if (timeout) clearTimeout(timeout);
    });
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    setCreatedAccount(null);
    setCopiedField("");
    setErrors({});
    setFormData(initialFormData);
    errorTimeoutRef.current = {};

    toast.success("Đã làm mới form!");
  }, [initialFormData]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      Object.values(errorTimeoutRef.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Memoized login info copy handler
  const handleCopyLogin = useCallback(() => {
    if (!createdAccount) return;

    const loginText = `Tên đăng nhập: ${createdAccount.username}\nMật khẩu: 123456`;
    copyToClipboard(loginText, "login");
  }, [createdAccount, copyToClipboard]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <UserPlus size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Tạo Tài Khoản Khách Hàng
              </h1>
            </div>

            {createdAccount && (
              <button
                onClick={handleCreateAnother}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
                type="button"
              >
                <RefreshCw size={16} />
                Tạo tài khoản khác
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Trạng Thái
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {createdAccount ? "Hoàn Thành" : "Chưa Tạo"}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tài Khoản Mới
                </p>
                <p className="text-xl font-bold text-green-600">
                  {createdAccount ? "1" : "0"}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserPlus className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Mật Khẩu
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {createdAccount ? "Đã Tạo" : "Chờ Tạo"}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Lock className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1  lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Nhập Thông Tin Khách Hàng
                </h2>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6">
              {/* Info Alert */}
              <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Tên đăng nhập và mật khẩu mặc định sẽ được hệ thống tạo tự
                  động.
                </span>
              </div>

              {/* Error Alert */}
              {errors.general && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.general}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Email"
                  icon={Mail}
                  name="email"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                />

                <InputField
                  label="Số điện thoại"
                  icon={Phone}
                  name="phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                />

                <InputField
                  label="Họ và tên"
                  icon={User}
                  name="name"
                  placeholder="Nhập họ và tên đầy đủ"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                />

                <InputField
                  label="Địa chỉ"
                  icon={MapPin}
                  name="address"
                  placeholder="Nhập địa chỉ (không bắt buộc)"
                  isTextarea
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                />

                <InputField
                  label="Nguồn giới thiệu"
                  icon={Users}
                  name="source"
                  placeholder="Nguồn giới thiệu (không bắt buộc)"
                  value={formData.source}
                  onChange={handleInputChange}
                  error={errors.source}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Tạo tài khoản
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Result Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Lock className="text-white" size={16} />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Thông Tin Đăng Nhập
                </h2>
              </div>
            </div>

            {/* Result Body */}
            <div className="p-6">
              {createdAccount ? (
                <div className="space-y-4">
                  {/* Login Info Card */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b-2 border-gray-200">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Thông tin đăng nhập
                      </span>
                      <CopyButton
                        onClick={handleCopyLogin}
                        copied={copiedField === "login"}
                      />
                    </div>

                    <div className="p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Tên đăng nhập:
                        </span>
                        <span className="text-sm font-semibold font-mono bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                          {createdAccount.username}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Mật khẩu:</span>
                        <span className="text-sm font-semibold font-mono bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                          123456
                        </span>
                      </div>
                    </div>

                    <div className="bg-amber-50 border-t-2 border-amber-200 px-4 py-3">
                      <p className="text-xs text-amber-700 flex items-center gap-2">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        Mật khẩu mặc định. Khuyến khích đổi mật khẩu sau lần
                        đăng nhập đầu tiên.
                      </p>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2.5 border-b-2 border-gray-200">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </span>
                    </div>
                    <div className="p-4 text-sm text-gray-900 bg-white">
                      {createdAccount.email}
                    </div>
                  </div>

                  {/* Phone Card */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2.5 border-b-2 border-gray-200">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Số điện thoại
                      </span>
                    </div>
                    <div className="p-4 text-sm text-gray-900 bg-white">
                      {createdAccount.phone}
                    </div>
                  </div>

                  {/* Name Card */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2.5 border-b-2 border-gray-200">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Họ và tên
                      </span>
                    </div>
                    <div className="p-4 text-sm text-gray-900 bg-white">
                      {createdAccount.name}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyLoginState />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountUser;
