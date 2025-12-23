import api from "../../config/api.js";

const exchangeOrderService = {
  createExchangeOrder: async (customerCode, routeId, orderData) => {
    const url = `/orders/money-exchange/${encodeURIComponent(
      customerCode
    )}/${Number(routeId)}`;

    console.log("=== CREATE EXCHANGE ORDER ===");
    console.log("URL:", url);
    console.log("Customer Code:", customerCode);
    console.log("Route ID:", routeId);
    console.log("Order Data:", orderData);

    const response = await api.post(url, orderData);

    console.log("Response:", response.data);
    console.log("=============================");

    return response.data;
  },
};
export default exchangeOrderService;
export const { createExchangeOrder } = exchangeOrderService;
