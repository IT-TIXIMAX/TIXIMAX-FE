import api from "../../config/api";
export const getGoodsAndWeight = (params = {}) =>
  api.get("/dashboard/goods-and-weight", { params }).then((r) => r.data);
