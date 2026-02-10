// src/Services/Manager/userService.js
import api from "../../config/api";

const userService = {
  // Get account by ID
  getAccountById: async (id) => {
    if (!id) throw new Error("Account ID is required");
    const { data } = await api.get(`/accounts/${id}`);
    return data;
  },

  // Get staff accounts with pagination
  getAccounts: async (page = 0, size = 10, keyword = "", role = null) => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (role) params.set("role", role); // ✅ chỉ add khi có role

    const qs = params.toString();
    const { data } = await api.get(
      `/accounts/null/${page}/${size}${qs ? `?${qs}` : ""}`,
    );
    return data;
  },

  // Get customer accounts with pagination
  getCustomerAccounts: async (page = 0, size = 100) => {
    const { data } = await api.get(`/accounts/customers/${page}/${size}`);
    return data;
  },

  // Get my customers (assigned to current staff)
  getMyCustomers: async (page = 0, size = 100, search = "") => {
    const { data } = await api.get(`/accounts/my-customers/${page}/${size}`, {
      params: { search },
    });
    return data;
  },

  // Get sale lead staff with pagination
  getSaleLeadStaff: async (page = 0, size = 100) => {
    const { data } = await api.get(`/accounts/sale-lead-staff/${page}/${size}`);
    return data;
  },
  getInactiveCustomers: async (page = 0, size = 10) => {
    const { data } = await api.get(
      `/dashboard/inactive-customers/${page}/${size}`,
    );
    return data;
  },
  getTopCustomersAll: async (orderType = null, limit = 100, month = null) => {
    const params = new URLSearchParams();
    params.append("limit", limit);

    if (orderType) {
      params.append("orderType", orderType);
    }

    if (month) {
      params.append("month", month);
    }

    const { data } = await api.get(
      `/dashboard/top-by-type?${params.toString()}`,
    );
    return data;
  },
};

export default userService;
