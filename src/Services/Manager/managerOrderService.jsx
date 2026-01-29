// // src/Services/Manager/managerOrderService.js
// import api from "../../config/api.js";

// const managerOrderService = {
//   // Get orders with pagination and status filter
//   getOrdersPaging: async (page = 0, size = 100, status = "DA_XAC_NHAN") => {
//     try {
//       // Basic validation
//       if (page < 0 || size < 1 || size > 200 || !status) {
//         throw new Error("Invalid parameters");
//       }

//       const validStatuses = [
//         "CHO_XAC_NHAN",
//         "DA_XAC_NHAN",
//         "CHO_THANH_TOAN",
//         "CHO_THANH_TOAN_DAU_GIA",
//         "CHO_THANH_TOAN_SHIP",
//         "CHO_MUA",
//         "CHO_NHAP_KHO_NN",
//         "CHO_DONG_GOI",
//         "DANG_XU_LY",
//         "DA_GIAO",
//         "DA_HOAN_THANH",
//         "CHO_GIAO",
//         "DA_DU_HANG",
//         "DA_HUY",
//       ];

//       if (!validStatuses.includes(status)) {
//         throw new Error(`Invalid status: ${status}`);
//       }

//       // Updated API format: /orders/{page}/{size}/{status}/paging?size={size}
//       const response = await api.get(
//         `/orders/info/${page}/${size}/${status}/paging?size=${size}`,
//       );
//       return response.data;
//     } catch (error) {
//       console.error(`Error fetching orders:`, error);

//       if (error.response?.status === 404) {
//         throw new Error("API endpoint not found");
//       } else if (error.response?.status === 400) {
//         throw new Error("Invalid request parameters");
//       } else if (error.response?.status === 500) {
//         throw new Error("Server error");
//       }

//       throw error;
//     }
//   },
//   getOrdersPaginated: async (page = 0, size = 10, searchParams = {}) => {
//     const params = new URLSearchParams();

//     if (searchParams.shipmentCode) {
//       params.append("shipmentCode", searchParams.shipmentCode);
//     }
//     if (searchParams.customerCode) {
//       params.append("customerCode", searchParams.customerCode);
//     }
//     if (searchParams.orderCode) {
//       params.append("orderCode", searchParams.orderCode);
//     }

//     const queryString = params.toString();
//     const url = `/orders/${page}/${size}${
//       queryString ? `?${queryString}` : ""
//     }`;

//     const response = await api.get(url);
//     return {
//       content: response.data.content || [],
//       totalPages: response.data.totalPages || 1,
//       totalElements: response.data.totalElements || 0,
//       number: response.data.number || 0,
//       size: response.data.size || size,
//     };
//   },
//   // Get orders by specific status
//   getOrdersByStatus: async (status, page = 0, size = 20) => {
//     return await managerOrderService.getOrdersPaging(page, size, status);
//   },
//   getOrderDetail: async (orderId) => {
//     try {
//       const response = await api.get(`/orders/detail/${orderId}`);

//       if (response.data?.error) {
//         throw new Error(`API Error: ${response.data.error}`);
//       }

//       return response.data;
//     } catch (error) {
//       console.error(`Error fetching order detail ${orderId}:`, error);
//       throw error;
//     }
//   },
//   cancelOrderLink: async (orderId, linkId) => {
//     try {
//       const url = `/orders/order-link/cancel/${orderId}/${linkId}`;
//       console.log("cancelOrderLink URL:", url);

//       // Dùng PUT đúng như curl
//       const response = await api.put(url); // ⬅️ ĐỔI từ post → put

//       if (response.data?.error) {
//         throw new Error(`API Error: ${response.data.error}`);
//       }

//       return response.data;
//     } catch (error) {
//       console.error(
//         `Error canceling order link orderId=${orderId}, linkId=${linkId}:`,
//         error,
//       );
//       throw error;
//     }
//   },

//   // Status configuration - Updated with new statuses
//   getAvailableStatuses: () => [
//     // { key: "CHO_XAC_NHAN", label: "Chờ xác nhận", color: "yellow" },
//     // { key: "DA_XAC_NHAN", label: "Đã xác nhận", color: "green" },
//     // {
//     //   key: "CHO_THANH_TOAN",
//     //   label: "Chờ thanh toán tiền hàng",
//     //   color: "orange",
//     // },
//     // {
//     //   key: "CHO_THANH_TOAN_DAU_GIA",
//     //   label: "Chờ thanh toán đấu giá",
//     //   color: "pink",
//     // },
//     // { key: "CHO_THANH_TOAN_SHIP", label: "Chờ thanh toán ship", color: "teal" },
//     // { key: "CHO_MUA", label: "Chờ mua", color: "blue" },
//     // { key: "CHO_NHAP_KHO_NN", label: "Chờ nhập kho NN", color: "cyan" },
//     // { key: "CHO_DONG_GOI", label: "Chờ đóng gói", color: "purple" },
//     // { key: "DANG_XU_LY", label: "Đang xử lý", color: "indigo" },
//     // { key: "DA_GIAO", label: "Đã giao", color: "emerald" },
//     // { key: "DA_HOAN_THANH", label: "Đã hoàn thành", color: "emerald" },
//     // { key: "DA_HUY", label: "Đã hủy", color: "red" },

//     {
//       key: "CHO_THANH_TOAN",
//       label: "Chờ thanh toán tiền hàng",
//       color: "orange",
//     },
//     {
//       key: "CHO_THANH_TOAN_DAU_GIA",
//       label: "Chờ thanh toán đấu giá",
//       color: "pink",
//     },
//     { key: "CHO_MUA", label: "Chờ mua", color: "blue" },
//     { key: "CHO_NHAP_KHO_NN", label: "Đang về kho NN", color: "cyan" },
//     { key: "CHO_DONG_GOI", label: "Đã về kho NN", color: "purple" },
//     { key: "DANG_XU_LY", label: "Đang về kho VN", color: "indigo" },
//     { key: "DA_DU_HANG", label: "Đã về kho VN", color: "lime" },
//     { key: "CHO_THANH_TOAN_SHIP", label: "Chờ thanh toán ship", color: "teal" },
//     { key: "CHO_GIAO", label: "Đang giao hàng", color: "amber" },
//     { key: "DA_GIAO", label: "Hoàn thành đơn hàng", color: "amber" },
//     { key: "DA_HUY", label: "Đã hủy", color: "red" },

//     // { key: "DANG_XU_LY", label: "Đang xử lý", color: "indigo" },
//     // { key: "DA_GIAO", label: "Đã giao", color: "emerald" },
//     // { key: "DA_HOAN_THANH", label: "Đã hoàn thành", color: "emerald" },
//     // { key: "DA_HUY", label: "Đã hủy", color: "red" },
//   ],
//   getOrderDetails: async (orderId) => {
//     const { data } = await api.get(`/orders/${orderId}`);
//     return data;
//   },
//   updateOrder: async (orderId, payload) => {
//     const { data } = await api.patch(`/orders/${orderId}`, payload);
//     return data;
//   },
// };

// export default managerOrderService;

// src/Services/Manager/managerOrderService.js
import api from "../../config/api.js";

const managerOrderService = {
  /**
   * Get orders with pagination & status
   * API: /orders/info/{page}/{size}/{status}/paging?size={size}
   */
  getOrdersPaging: async (page = 0, size = 100, status = "DA_XAC_NHAN") => {
    const safePage = Number.isFinite(+page) && +page >= 0 ? +page : 0;
    const safeSize = Number.isFinite(+size) && +size > 0 ? +size : 100;
    const safeStatus = status || "DA_XAC_NHAN";

    const response = await api.get(
      `/orders/info/${safePage}/${safeSize}/${safeStatus}/paging?size=${safeSize}`,
    );
    return response.data;
  },

  getOrdersByStatus: async (status, page = 0, size = 20) => {
    return managerOrderService.getOrdersPaging(page, size, status);
  },

  getOrderDetail: async (orderId) => {
    const response = await api.get(`/orders/detail/${orderId}`);
    return response.data;
  },

  cancelOrderLink: async (orderId, linkId) => {
    const url = `/orders/order-link/cancel/${orderId}/${linkId}`;
    const response = await api.put(url);
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },

  updateOrder: async (orderId, payload) => {
    const { data } = await api.patch(`/orders/${orderId}`, payload);
    return data;
  },
};

export default managerOrderService;
