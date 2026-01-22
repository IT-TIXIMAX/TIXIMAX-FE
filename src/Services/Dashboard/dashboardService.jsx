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
  getFlightRevenue: (flightCode, inputCost) => {
    return api.get("/dashboard/admin/flight-revenue", {
      params: {
        flightCode,
        inputCost,
      },
    });
  },
  getActualProfit: ({ startDate, endDate, routeId }) => {
    return api.get("/dashboard/admin/actual-profit", {
      params: { startDate, endDate, routeId },
    });
  },

  getEstimatedProfit: ({ startDate, endDate, routeId }) => {
    return api.get("/dashboard/admin/estimated-profit", {
      params: { startDate, endDate, routeId },
    });
  },
  getStaffCustomersSummary: ({ filterType, startDate, endDate }) => {
    return api.get("/dashboard/staff/customers-summary", {
      params: { filterType, startDate, endDate },
    });
  },
  getRoutesWeightSummary: ({ filterType, startDate, endDate }) => {
    return api.get("/dashboard/routes/weight-summary", {
      params: { filterType, startDate, endDate },
    });
  },
  getRoutesRevenueSummary: ({ filterType, startDate, endDate, status }) => {
    return api.get("/dashboard/routes/revenue-summary", {
      params: { filterType, startDate, endDate, status },
    });
  },
  getRoutesOrdersSummary: ({ filterType, startDate, endDate }) => {
    return api.get("/dashboard/routes/orders-summary", {
      params: { filterType, startDate, endDate },
    });
  },

  getRoutesKPI: ({
    startDate,
    endDate,
    filterType = "MONTH",
    routeId,
  } = {}) => {
    const params = { filterType };

    if (filterType === "CUSTOM") {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    }

    if (routeId) params.routeId = Number(routeId);

    return api.get("/dashboard/routes/kpi", { params });
  },
  getTopCustomers: async (page = 0, size = 10, filters = {}) => {
    const params = new URLSearchParams();

    if (filters.customerTopType) {
      params.append("customerTopType", filters.customerTopType);
    }

    if (filters.customerCode) {
      params.append("customerCode", filters.customerCode);
    }

    const response = await api.get(
      `/dashboard/customers/top/${page}/${size}?${params.toString()}`,
    );

    return response.data;
  },
  dailyInventory: (p = {}) =>
    api.get("/dashboard/daily-inventory", { params: p }).then((r) => r.data),
};

export default dashboardService;
