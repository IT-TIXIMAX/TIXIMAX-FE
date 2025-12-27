// src/Services/userService.js
import api from "../../config/api.js";

const validatePagination = (page, size) => {
  if (page < 0 || size < 1 || size > 100) {
    throw new Error("Invalid parameters");
  }
};

const handleApiError = (error, defaultMessage) => {
  const status = error?.response?.status;

  if (status === 404) {
    throw new Error("API endpoint not found");
  }
  if (status === 400) {
    throw new Error("Invalid request parameters");
  }
  if (status === 403) {
    throw new Error("Access denied - insufficient permissions");
  }
  if (status === 500) {
    throw new Error("Server error");
  }

  if (error instanceof Error) throw error;
  throw new Error(defaultMessage || "Request failed");
};

const userService = {
  // ----------------------------
  // GET account by ID (NEW)
  // ----------------------------
  getAccountById: async (id) => {
    if (!id) throw new Error("Account ID is required");
    try {
      const response = await api.get(`/accounts/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch account by ID");
    }
  },

  // Get staff accounts with pagination
  getStaffAccounts: async (page = 0, size = 10) => {
    validatePagination(page, size);
    try {
      const response = await api.get(`/accounts/staff/${page}/${size}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch staff accounts");
    }
  },

  // Get customer accounts with pagination
  getCustomerAccounts: async (page = 0, size = 10) => {
    validatePagination(page, size);
    try {
      const response = await api.get(`/accounts/customers/${page}/${size}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch customer accounts");
    }
  },

  // Get my customers (assigned to current staff)
  getMyCustomers: async (page = 0, size = 10, search = "") => {
    validatePagination(page, size);
    try {
      const response = await api.get(`/accounts/my-customers/${page}/${size}`, {
        params: { search },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch my customers");
      return null;
    }
  },

  // Get sale lead staff with pagination
  getSaleLeadStaff: async (page = 0, size = 10) => {
    validatePagination(page, size);
    try {
      const response = await api.get(
        `/accounts/sale-lead-staff/${page}/${size}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch sale lead staff");
    }
  },

  // Roles
  getAvailableRoles: () => [
    { key: "ADMIN", label: "Quản trị viên", color: "red" },
    { key: "MANAGER", label: "Quản lý", color: "orange" },
    { key: "STAFF_SALE", label: "Nhân viên bán hàng", color: "blue" },
    { key: "STAFF_WAREHOUSE", label: "Nhân viên kho", color: "purple" },
    {
      key: "STAFF_WAREHOUSE_DOMESTIC",
      label: "Nhân viên kho nội địa",
      color: "indigo",
    },
    { key: "LEAD_SALE", label: "Trưởng nhóm bán hàng", color: "green" },
  ],

  // Status
  getAvailableStatuses: () => [
    { key: "HOAT_DONG", label: "Hoạt động", color: "green" },
    { key: "KHONG_HOAT_DONG", label: "Không hoạt động", color: "gray" },
  ],
};

export default userService;

// import api from "../../config/api.js";

// /* ================= Helpers ================= */
// const checkPage = (page, size) => {
//   if (page < 0 || size < 1 || size > 200) {
//     throw new Error("Invalid pagination");
//   }
// };

// const throwApiError = (err, fallback = "Request failed") => {
//   const msg = err?.response?.data?.message || err?.message || fallback;
//   throw new Error(msg);
// };

// const getPaging = async (url, page, size, params = {}) => {
//   checkPage(page, size);
//   try {
//     const res = await api.get(`${url}/${page}/${size}`, { params });
//     return res.data;
//   } catch (e) {
//     throwApiError(e);
//   }
// };

// const userService = {
//   // GET /accounts/{id}
//   getAccountById: async (id) => {
//     if (!id) throw new Error("Account ID is required");
//     try {
//       const res = await api.get(`/accounts/${id}`);
//       return res.data;
//     } catch (e) {
//       throwApiError(e, "Failed to load account");
//     }
//   },

//   // GET /accounts/customers/{page}/{size}
//   getCustomerAccounts: (page = 0, size = 100) =>
//     getPaging("/accounts/customers", page, size),

//   // GET /accounts/staff/{page}/{size}
//   getStaffAccounts: (page = 0, size = 100) =>
//     getPaging("/accounts/staff", page, size),

//   // GET /accounts/my-customers/{page}/{size}?search=
//   getMyCustomers: (page = 0, size = 100, search = "") =>
//     getPaging("/accounts/my-customers", page, size, { search }),

//   // GET /accounts/sale-lead-staff/{page}/{size}
//   getSaleLeadStaff: (page = 0, size = 100) =>
//     getPaging("/accounts/sale-lead-staff", page, size),
// };

// export default userService;
