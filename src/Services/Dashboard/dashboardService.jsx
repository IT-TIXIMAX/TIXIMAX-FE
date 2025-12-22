// api/dashboardService.jsx
import api from "../../config/api"; // axios instance

const dashboardService = {
  // 1. GET Weights
  getWeights: (params) => {
    return api.get("/dashboard/admin/weights", { params });
  },

  // 2. GET Payments
  getPayments: (params) => {
    return api.get("/dashboard/admin/payments", { params });
  },

  // 3. GET Orders
  getOrders: (params) => {
    return api.get("/dashboard/admin/orders", { params });
  },

  // 4. GET Customers
  getCustomers: (params) => {
    return api.get("/dashboard/admin/customers", { params });
  },

  // 5. GET Dashboard Filter
  getDashboardFilter: (filterType) => {
    return api.get("/dashboard", {
      params: { filterType },
    });
  },

  getYearlyOrders: (year) => {
    return api.get(`/dashboard/yearly-order/${year}`);
  },
  getYearlyPayments: (year) => {
    return api.get(`/dashboard/yearly-payment/${year}`);
  },
  getYearlyWarehouse: (year) => {
    return api.get(`/dashboard/yearly-warehouse/${year}`);
  },
  getYearlyCustomer: (year) => {
    return api.get(`/dashboard/yearly-customer/${year}`);
  },
  getDebtsTotal: () => {
    return api.get("/dashboard/admin/debts-total");
  },
  getFlightRevenue: (flightCode, inputCost, minWeight) => {
    return api.get("/dashboard/admin/flight-revenue", {
      params: {
        flightCode,
        inputCost,
        minWeight,
      },
    });
  },
  getActualProfit: ({ startDate, endDate, exchangeRate, routeId }) => {
    return api.get("/dashboard/admin/actual-profit", {
      params: { startDate, endDate, exchangeRate, routeId },
    });
  },

  getEstimatedProfit: ({ startDate, endDate, exchangeRate, routeId }) => {
    return api.get("/dashboard/admin/estimated-profit", {
      params: { startDate, endDate, exchangeRate, routeId },
    });
  },
};

export default dashboardService;
