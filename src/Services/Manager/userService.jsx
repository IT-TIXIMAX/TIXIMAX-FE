// // src/Services/userService.js
// import api from "../../config/api.js";

// const validatePagination = (page, size) => {
//   if (page < 0 || size < 1 || size > 300) {
//     throw new Error("Invalid parameters");
//   }
// };

// const handleApiError = (error, defaultMessage) => {
//   const status = error?.response?.status;

//   if (status === 404) {
//     throw new Error("API endpoint not found");
//   }
//   if (status === 400) {
//     throw new Error("Invalid request parameters");
//   }
//   if (status === 403) {
//     throw new Error("Access denied - insufficient permissions");
//   }
//   if (status === 500) {
//     throw new Error("Server error");
//   }

//   if (error instanceof Error) throw error;
//   throw new Error(defaultMessage || "Request failed");
// };

// const userService = {
//   getAccountById: async (id) => {
//     if (!id) throw new Error("Account ID is required");
//     try {
//       const response = await api.get(`/accounts/${id}`);
//       return response.data;
//     } catch (error) {
//       handleApiError(error, "Failed to fetch account by ID");
//     }
//   },

//   // Get staff accounts with pagination
//   getStaffAccounts: async (page = 0, size = 10) => {
//     validatePagination(page, size);
//     try {
//       const response = await api.get(`/accounts/staff/${page}/${size}`);
//       return response.data;
//     } catch (error) {
//       handleApiError(error, "Failed to fetch staff accounts");
//     }
//   },

//   // Get customer accounts with pagination
//   getCustomerAccounts: async (page = 0, size = 10) => {
//     validatePagination(page, size);
//     try {
//       const response = await api.get(`/accounts/customers/${page}/${size}`);
//       return response.data;
//     } catch (error) {
//       handleApiError(error, "Failed to fetch customer accounts");
//     }
//   },

//   // Get my customers (assigned to current staff)
//   getMyCustomers: async (page = 0, size = 10, search = "") => {
//     validatePagination(page, size);
//     try {
//       const response = await api.get(`/accounts/my-customers/${page}/${size}`, {
//         params: { search },
//       });
//       return response.data;
//     } catch (error) {
//       handleApiError(error, "Failed to fetch my customers");
//       return null;
//     }
//   },

//   // Get sale lead staff with pagination
//   getSaleLeadStaff: async (page = 0, size = 10) => {
//     validatePagination(page, size);
//     try {
//       const response = await api.get(
//         `/accounts/sale-lead-staff/${page}/${size}`
//       );
//       return response.data;
//     } catch (error) {
//       handleApiError(error, "Failed to fetch sale lead staff");
//     }
//   },

//   // Roles
//   getAvailableRoles: () => [
//     { key: "ADMIN", label: "Quản trị viên", color: "red" },
//     { key: "MANAGER", label: "Quản lý", color: "orange" },
//     { key: "STAFF_SALE", label: "Nhân viên bán hàng", color: "blue" },
//     { key: "STAFF_WAREHOUSE", label: "Nhân viên kho", color: "purple" },
//     {
//       key: "STAFF_WAREHOUSE_DOMESTIC",
//       label: "Nhân viên kho nội địa",
//       color: "indigo",
//     },
//     { key: "LEAD_SALE", label: "Trưởng nhóm bán hàng", color: "green" },
//   ],

//   // Status
//   getAvailableStatuses: () => [
//     { key: "HOAT_DONG", label: "Hoạt động", color: "green" },
//     { key: "KHONG_HOAT_DONG", label: "Không hoạt động", color: "gray" },
//   ],
// };

// export default userService;

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
