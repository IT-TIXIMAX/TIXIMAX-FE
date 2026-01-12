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
  getStaffAccounts: async (page = 0, size = 100) => {
    const { data } = await api.get(`/accounts/staff/${page}/${size}`);
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
};

export default userService;
