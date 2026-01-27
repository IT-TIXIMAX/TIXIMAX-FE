import api from "../../config/api";

const registrationByStaffService = {
  // Register customer by staff
  registerCustomerByStaff: async (registrationData, token) => {
    try {
      // Input validation
      if (!registrationData) {
        throw new Error("Registration data is required");
      }

      if (!token) {
        throw new Error("Authorization token is required");
      }

      // Required fields - username and password can be empty (auto-generated)
      const requiredFields = ["email", "phone", "name"];
      for (const field of requiredFields) {
        if (!registrationData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Set default values if not provided
      const dataWithDefaults = {
        role: "CUSTOMER",
        username: "", // Can be empty - will be auto-generated
        password: "", // Can be empty - will be auto-generated
        ...registrationData,
      };

      // Clean up data - remove null/undefined values
      const cleanedData = Object.keys(dataWithDefaults).reduce((acc, key) => {
        const value = dataWithDefaults[key];
        // Include all fields, even empty strings for username/password
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log("Sending staff registration data:", cleanedData);

      const response = await api.post(
        "/accounts/register/customer/by-staff",
        cleanedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error registering customer by staff:",
        error.response || error,
      );
      throw error;
    }
  },

  // Validate registration data for staff
  validateStaffRegistrationData: (data) => {
    const errors = {};

    // Email validation (required)
    if (!data.email) {
      errors.email = "Email là bắt buộc";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = "Vui lòng nhập địa chỉ email hợp lệ";
      }
    }

    // Phone validation (required)
    if (!data.phone) {
      errors.phone = "Số điện thoại là bắt buộc";
    } else {
      // Remove all spaces and check if valid 10 digits
      const cleanPhone = data.phone.replace(/\s/g, "");
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = "Số điện thoại phải có đúng 10 chữ số";
      }
    }

    // Name validation (required)
    if (!data.name) {
      errors.name = "Họ và tên là bắt buộc";
    } else if (data.name.trim().length < 2) {
      errors.name = "Họ và tên phải có ít nhất 2 ký tự";
    }

    // Note: Username and password are auto-generated, no validation needed

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Get customer roles available for staff to create
  getAvailableRoles: () => {
    return [{ value: "CUSTOMER", label: "Khách hàng" }];
  },
};

export default registrationByStaffService;

// Export individual functions for backward compatibility
export const registerCustomerByStaff =
  registrationByStaffService.registerCustomerByStaff;
export const validateStaffRegistrationData =
  registrationByStaffService.validateStaffRegistrationData;
export const getAvailableRoles = registrationByStaffService.getAvailableRoles;
