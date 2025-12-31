import api from "../../config/api.js";

// Danh sách các status có sẵn
const ORDER_STATUSES = {
  CONFIRMED: { key: "DA_XAC_NHAN", label: "Đã xác nhận", color: "green" },
  PENDING_SHIP: {
    key: "CHO_THANH_TOAN_SHIP",
    label: "Chờ thanh toán ship",
    color: "yellow",
  },
  PENDING_PAYMENT: {
    key: "CHO_THANH_TOAN",
    label: "Chờ thanh toán",
    color: "orange",
  },
  AUCTION_SUCCESS: {
    key: "DAU_GIA_THANH_CONG",
    label: "Đấu giá thành công",
    color: "purple",
  },
  WAREHOUSE_READY: { key: "DA_DU_HANG", label: "Đã đủ hàng", color: "blue" },
};

const createOrderPaymentService = {
  // Lấy đơn hàng theo status (có thể search)
  getOrdersByStatus: async (status, page = 0, size = 50, searchParams = {}) => {
    // Build params object cho axios
    const params = {};

    // Thêm các search params nếu có
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params[key] = value;
      }
    });

    const response = await api.get(
      `/orders/for-payment/${page}/${size}/${status}`,
      {
        params: params, // Axios sẽ tự động serialize thành query string
      }
    );

    return response.data;
  },

  // Lấy nhiều loại đơn hàng cùng lúc
  getOrdersByMultipleStatuses: async (
    statusKeys,
    page = 0,
    size = 100,
    searchParams = {}
  ) => {
    const results = await Promise.all(
      statusKeys.map((key) =>
        createOrderPaymentService.getOrdersByStatus(
          key,
          page,
          size,
          searchParams
        )
      )
    );

    return {
      orders: results.reduce((acc, result, index) => {
        acc[statusKeys[index]] = result;
        return acc;
      }, {}),
      totalOrders: results.flatMap((result) => result.content || []),
    };
  },

  // Lấy 2 loại đơn hàng ban đầu
  getFilteredOrders: async (page = 0, size = 100, searchParams = {}) => {
    return createOrderPaymentService.getOrdersByMultipleStatuses(
      [ORDER_STATUSES.CONFIRMED.key, ORDER_STATUSES.PENDING_SHIP.key],
      page,
      size,
      searchParams
    );
  },

  // Lấy tất cả các loại đơn hàng
  getAllFilteredOrders: async (page = 0, size = 100, searchParams = {}) => {
    return createOrderPaymentService.getOrdersByMultipleStatuses(
      [
        ORDER_STATUSES.CONFIRMED.key,
        ORDER_STATUSES.PENDING_SHIP.key,
        ORDER_STATUSES.AUCTION_SUCCESS.key,
        ORDER_STATUSES.PENDING_PAYMENT.key,
        ORDER_STATUSES.WAREHOUSE_READY.key,
      ],
      page,
      size,
      searchParams
    );
  },

  // Lấy danh sách các status
  getAvailableStatuses: () => Object.values(ORDER_STATUSES),

  // Lấy thống kê đơn hàng
  getOrderStatistics: async () => {
    const statuses = createOrderPaymentService.getAvailableStatuses();
    const results = await Promise.allSettled(
      statuses.map(async (status) => {
        try {
          const data = await createOrderPaymentService.getOrdersByStatus(
            status.key,
            0,
            1
          );
          return { ...status, total: data.totalElements || 0 };
        } catch {
          return { ...status, total: 0 };
        }
      })
    );

    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
  },

  // Lấy danh sách payments đấu giá
  getAuctionPayments: async () => {
    const response = await api.get(`/payments/auction`);
    return response.data;
  },
  getPartialShipments: async (page, status, limit = 100) => {
    const res = await api.get(`/partial-shipment/${page}/${limit}`, {
      params: { status },
    });
    return res.data;
  },
};

export default createOrderPaymentService;
