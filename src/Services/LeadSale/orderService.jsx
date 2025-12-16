import api from "../../config/api.js";

const orderService = {
  createOrder: async (customerCode, routeId, addressId, orderData) => {
    const url = `/orders/${encodeURIComponent(customerCode)}/${Number(
      routeId
    )}/${Number(addressId)}`;
    const res = await api.post(url, orderData);
    return res.data;
  },

  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get("/orders");
    return response.data;
  },

  getOrdersByCustomer: async (customerCode) => {
    const response = await api.get(`/orders/customer/${customerCode}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  getRefundOrders: async (offset = 0, limit = 10) => {
    const response = await api.get(`/orders/refund/${offset}/${limit}`);
    return response.data;
  },

  confirmRefundOrder: async (orderId, refundToCustomer, imageString) => {
    // Encode URL đúng cách
    const imageParam = imageString ? encodeURIComponent(imageString) : "string";

    const response = await api.put(
      `/orders/refund-confirm/${orderId}/${imageParam}?refundToCustomer=${refundToCustomer}`,
      null, // body
      {
        headers: {
          accept: "*/*",
        },
      }
    );
    return response.data;
  },
};

export default orderService;
export const createOrderService = orderService.createOrder;
