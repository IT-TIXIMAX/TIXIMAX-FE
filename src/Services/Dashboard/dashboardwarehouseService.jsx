import api from "../../config/api";

class DashboardWarehouseService {
  getDashboardData(params) {
    return api.get("/dashboard/warehouse/domestic-summary", { params });
  }
}

export default new DashboardWarehouseService();
