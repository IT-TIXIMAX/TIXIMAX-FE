import api from "../../config/api.js";

const orderCustomerService = {
  getOrdersByCustomer: async (customerId, token) => {
    if (!customerId) {
      throw new Error("Customer ID is required");
    }
    if (!token) {
      throw new Error("Authorization token is required");
    }

    try {
      const response = await api.get(
        `/orders/orders/by-customer/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching orders by customer:", error);
      throw error;
    }
  },

  getPaymentAuctionByCustomer: async (customerId, token) => {
    if (!customerId) {
      throw new Error("Customer ID is required");
    }
    if (!token) {
      throw new Error("Authorization token is required");
    }

    try {
      const response = await api.get(
        `/orders/payment-auction/by-customer/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching orders by customer:", error);
      throw error;
    }
  },

  getOrdersShippingByCustomer: async (customerId, token) => {
    if (!customerId) {
      throw new Error("Customer ID is required");
    }
    if (!token) {
      throw new Error("Authorization token is required");
    }

    try {
      const response = await api.get(
        `/orders/orders-shipping/by-customer/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching shipping orders by customer:", error);
      throw error;
    }
  },
  getPartialOrdersByCustomer: async (customerId, token) => {
    if (!customerId) throw new Error("Customer ID is required");
    if (!token) throw new Error("Authorization token is required");

    try {
      const response = await api.get(
        `/orders/partial-for-customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching partial orders by customer:", error);
      throw error;
    }
  },
};

export default orderCustomerService;
