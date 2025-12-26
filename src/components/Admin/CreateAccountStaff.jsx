import React, { useState, useEffect } from "react";
import { UserPlus, CheckCircle, AlertTriangle, Loader2, X } from "lucide-react";
import registrationService from "../../Services/Auth/Registration";
import managerRoutesService from "../../Services/Manager/managerRoutesService";
import ConfirmDialog from "../../common/ConfirmDialog";
import toast from "react-hot-toast";
import registrationByStaffService from "../../Services/Auth/RegistrationByStaffService";

const CreateAccountStaff = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    name: "",
    role: "",
    department: "",
    location: "",
    routeIds: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    managerRoutesService
      .getRoutes()
      .then(setRoutes)
      .catch(() => toast.error("Không thể tải danh sách tuyến"));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleRouteToggle = (routeId) => {
    setFormData((p) => ({
      ...p,
      routeIds: p.routeIds.includes(routeId)
        ? p.routeIds.filter((id) => id !== routeId)
        : [...p.routeIds, routeId],
    }));
  };

  const handleSubmitClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      const validation =
        registrationByStaffService.validateStaffRegistrationData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setShowConfirmDialog(false);
        return;
      }

      const { confirmPassword, ...payload } = formData;
      const res = await registrationService.registerStaff(payload);

      toast.success(`Tạo tài khoản thành công! Mã NV: ${res.staffCode}`);

      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        phone: "",
        name: "",
        role: "",
        department: "",
        location: "",
        routeIds: [],
      });
    } catch (err) {
      console.error("Registration error:", err);

      // Xử lý lỗi từ Backend
      const errorMessage = err.response?.data?.message || "";
      const errorData = err.response?.data;

      // Case 1: Username đã tồn tại
      if (
        errorMessage.toLowerCase().includes("username") ||
        errorMessage.includes("đăng nhập") ||
        errorMessage.includes("trùng") ||
        errorData?.field === "username"
      ) {
        setErrors((prev) => ({
          ...prev,
          username: errorMessage || "Tên đăng nhập đã tồn tại!",
        }));
        toast.error("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
      }
      // Case 2: Email đã tồn tại
      else if (
        errorMessage.toLowerCase().includes("email") ||
        errorData?.field === "email"
      ) {
        setErrors((prev) => ({
          ...prev,
          email: errorMessage || "Email đã được sử dụng!",
        }));
        toast.error("Email đã được sử dụng!");
      }
      // Case 3: Phone đã tồn tại
      else if (
        errorMessage.toLowerCase().includes("phone") ||
        errorMessage.toLowerCase().includes("số điện thoại") ||
        errorData?.field === "phone"
      ) {
        setErrors((prev) => ({
          ...prev,
          phone: errorMessage || "Số điện thoại đã được sử dụng!",
        }));
        toast.error("Số điện thoại đã được sử dụng!");
      }
      // Case 4: Validation errors từ backend (object)
      else if (errorData?.errors && typeof errorData.errors === "object") {
        setErrors(errorData.errors);
        toast.error("Vui lòng kiểm tra lại thông tin!");
      }
      // Case 5: Lỗi chung
      else {
        setErrors((prev) => ({
          ...prev,
          general: errorMessage || "Có lỗi xảy ra khi tạo tài khoản",
        }));
        toast.error(errorMessage || "Có lỗi xảy ra khi tạo tài khoản");
      }
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="min-h-screen p-6 ">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white border rounded-xl p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-3 rounded-lg">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tạo tài khoản nhân viên
          </h1>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="bg-white border rounded-xl p-6 space-y-5">
            <h3 className="font-semibold text-gray-800">Thông tin tài khoản</h3>

            {["username", "password", "confirmPassword"].map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-600 mb-1 capitalize">
                  {field === "confirmPassword" ? "Xác nhận mật khẩu" : field}
                </label>
                <input
                  type={field.includes("password") ? "password" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2.5 focus:border-indigo-500 outline-none ${
                    errors[field] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[field] && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT */}
          <div className="bg-white border rounded-xl p-6 space-y-5">
            <h3 className="font-semibold text-gray-800">
              Thông tin cá nhân & công việc
            </h3>

            {["name", "email", "phone"].map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-600 mb-1 capitalize">
                  {field}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2.5 focus:border-indigo-500 outline-none ${
                    errors[field] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[field] && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Vai trò
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2.5 focus:border-indigo-500 outline-none ${
                  errors.role ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">-- Chọn vai trò --</option>
                <option value="STAFF_SALE">Nhân viên bán hàng</option>
                <option value="LEAD_SALE">Trưởng nhóm bán hàng</option>
                <option value="STAFF_PURCHASER">Nhân viên mua hàng</option>
                <option value="STAFF_WAREHOUSE_FOREIGN">
                  Nhân viên kho ngoại
                </option>
                <option value="STAFF_WAREHOUSE_DOMESTIC">
                  Nhân viên kho nội
                </option>
                <option value="MANAGER">Quản lý</option>
              </select>
              {errors.role && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {errors.role}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ROUTES */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Tuyến đường phụ trách
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
            {routes.map((r) => (
              <label
                key={r.routeId}
                className="flex items-center gap-3 border rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.routeIds.includes(r.routeId)}
                  onChange={() => handleRouteToggle(r.routeId)}
                  className="cursor-pointer"
                />
                <span className="text-sm text-gray-700">{r.name}</span>
              </label>
            ))}
          </div>
          {errors.routeIds && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errors.routeIds}
            </p>
          )}
        </div>

        {/* ACTION */}
        <div className="bg-white border rounded-xl p-6 flex justify-between items-center">
          {errors.general && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">{errors.general}</span>
            </div>
          )}
          <button
            onClick={handleSubmitClick}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors hover:bg-indigo-700 ml-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tạo
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Tạo tài khoản
              </>
            )}
          </button>
        </div>

        {/* CONFIRM */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
          title="Xác nhận tạo tài khoản"
          message={`Tạo tài khoản cho ${formData.username}?`}
          confirmText="Tạo"
          cancelText="Hủy"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CreateAccountStaff;
