// src/Services/Manager/managerInforFlightService.jsx
import api from "../../config/api";

const managerInforFlightService = {
  create: (payload) =>
    api.post("/flight-shipment", payload).then((r) => r.data),
  getAll: (params = {}) =>
    api.get("/flight-shipment", { params }).then((r) => r.data),
  getDetail: (flightShipmentId) =>
    api
      .get(`/flight-shipment/${encodeURIComponent(flightShipmentId)}`)
      .then((r) => r.data),
  delete: (flightShipmentId) =>
    api
      .delete(`/flight-shipment/${encodeURIComponent(flightShipmentId)}`)
      .then((r) => r.data),
  update: (flightShipmentId, payload) =>
    api
      .patch(
        `/flight-shipment/${encodeURIComponent(flightShipmentId)}`,
        payload,
      )
      .then((r) => r.data),
};

export default managerInforFlightService;
