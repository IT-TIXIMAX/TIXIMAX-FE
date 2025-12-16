// src/Services/TrackingCustomer/trackingCustomerService.jsx
import api from "../../config/api";

const trackingCustomerService = {
  getShipmentsByPhone(phone) {
    return api.get(`/orders/shipments-by-phone/${phone}`);
  },
};

export default trackingCustomerService;
