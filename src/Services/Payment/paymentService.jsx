import api from "../../config/api.js";
const paymentService = {
  // Create payment
  createPayment: async (orderCode, paymentData = null) => {
    try {
      if (!orderCode) {
        throw new Error("Order code is required");
      }

      const response = await api.post(
        `/payments/${orderCode}`,
        paymentData || {}
      );

      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error.response || error);
      throw error;
    }
  },

  // Get payment by order code
  getPayment: async (orderCode) => {
    try {
      if (!orderCode) {
        throw new Error("Order code is required");
      }

      const response = await api.get(`/payments/${orderCode}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment for order ${orderCode}:`, error);
      throw error;
    }
  },

  // Get all payments
  getPayments: async () => {
    try {
      const response = await api.get("/payments");
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (orderCode, status) => {
    try {
      if (!orderCode) {
        throw new Error("Order code is required");
      }
      if (!status) {
        throw new Error("Payment status is required");
      }

      const response = await api.put(`/payments/${orderCode}/status`, {
        status: status,
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error updating payment status for order ${orderCode}:`,
        error
      );
      throw error;
    }
  },

  // Cancel payment
  cancelPayment: async (orderCode) => {
    try {
      if (!orderCode) {
        throw new Error("Order code is required");
      }

      const response = await api.delete(`/payments/${orderCode}`);
      return response.data;
    } catch (error) {
      console.error(`Error canceling payment for order ${orderCode}:`, error);
      throw error;
    }
  },
  getPaymentByCode: async (paymentCode) => {
    try {
      if (!paymentCode) {
        throw new Error("Payment code is required");
      }

      const response = await api.get(`/payments/code/${paymentCode}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching payment for code ${paymentCode}:`,
        error.response || error
      );
      throw error;
    }
  },
  refundBalance: async (id, { image = "", amount = 0 } = {}) => {
    if (!id) throw new Error("Account ID is required");
    const { data } = await api.get(`/accounts/refund-balance/${id}`, {
      params: { image, amount },
    });
    return data;
  },
};

export default paymentService;

export const createPaymentService = paymentService.createPayment;
