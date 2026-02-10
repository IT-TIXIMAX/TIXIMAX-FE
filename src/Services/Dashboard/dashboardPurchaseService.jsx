import api from "../../config/api"; // chỉnh path nếu cần

const dashboardPurchaseService = {
  purchaseSummary: (p = {}) =>
    api.get("/dashboard/purchase-summary", { params: p }).then((r) => r.data),

  purchaseDetail: (page = 0, size = 10, p = {}) =>
    api
      .get(`/dashboard/purchase-detail/${page}/${size}`, { params: p })
      .then((r) => r.data),
};

export default dashboardPurchaseService;
