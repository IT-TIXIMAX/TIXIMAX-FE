import api from "../../config/api";

const draftWarehouseService = {
  // Lấy danh sách đơn hàng nháp có thể thêm vào kho
  getAvailableToAdd: async (page = 0, size = 10, params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.customerCode)
      queryParams.append("customerCode", params.customerCode);
    if (params.routeId) queryParams.append("routeId", params.routeId);

    const queryString = queryParams.toString();
    const url = `/draft-domestics/available-add/${page}/${size}${
      queryString ? `?${queryString}` : ""
    }`;

    const { data } = await api.get(url);
    return data;
  },
  addDeliveryAddress: async (payload) => {
    const { data } = await api.post("/draft-domestics/add", payload);
    return data;
  },
  getShippingAddressList: async (page = 0, size = 10, params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.customerCode)
      queryParams.append("customerCode", params.customerCode);
    if (params.shipmentCode)
      queryParams.append("shipmentCode", params.shipmentCode);

    const queryString = queryParams.toString();
    const url = `/draft-domestics/${page}/${size}${
      queryString ? `?${queryString}` : ""
    }`;

    const { data } = await api.get(url);
    return data;
  },
  addShipmentsToAddress: async (addressId, shippingCodes) => {
    const { data } = await api.post(
      `/draft-domestics/${addressId}/shipments/add`,
      {
        shippingCodes,
      }
    );
    return data;
  },

  removeShipmentsFromAddress: async (addressId, shippingCodes) => {
    const { data } = await api.post(
      `/draft-domestics/${addressId}/shipments/remove`,
      {
        shippingCodes,
      }
    );
    return data;
  },
};

export default draftWarehouseService;
