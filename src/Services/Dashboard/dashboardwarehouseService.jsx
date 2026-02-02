import api from "../../config/api";

class DashboardWarehouseService {
  // Dashboard kho nội địa
  getDashboardData(params) {
    return api.get("/dashboard/warehouse/domestic-summary", { params });
  }

  // Dashboard tồn kho khách hàng
  getCustomerInventory({ page = 0, size = 100, month }) {
    return api.get(`/dashboard/customer/inventory/${page}/${size}`, {
      params: { month },
    });
  }
}

export default new DashboardWarehouseService();
