import api from "../../config/api";
export const getGoodsAndWeight = (params = {}) =>
  api.get("/dashboard/goods-and-weight", { params }).then((r) => r.data);
export const getSummaryStaff = (params = {}) =>
  api.get("/dashboard/summary-staff", { params }).then((r) => r.data);
