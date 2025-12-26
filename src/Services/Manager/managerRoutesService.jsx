import api from "../../config/api";

const routesService = {
  getRoutes: async () => {
    const res = await api.get("/routes");
    return res.data;
  },

  getRouteById: async (id) => {
    const res = await api.get(`/routes/${id}`);
    return res.data;
  },

  createRoute: async (data) => {
    const apiData = {
      name: data.name,
      shipTime: data.shipTime.toString(),
      unitBuyingPrice: data.unitBuyingPrice || 0,
      unitDepositPrice: data.unitDepositPrice || 0,
      exchangeRate: data.exchangeRate || 0,
      differenceRate: data.differenceRate || 0,
      updateAuto: data.updateAuto ?? false,
      note: data.note || "",
    };

    const res = await api.post("/routes", apiData);
    return res.data;
  },
  updateRoute: async (id, data) => {
    const apiData = {
      name: data.name,
      shipTime: data.shipTime.toString(),
      unitBuyingPrice: data.unitBuyingPrice ?? 0,
      unitDepositPrice: data.unitDepositPrice ?? 0,
      exchangeRate: data.exchangeRate ?? 0,
      differenceRate: data.differenceRate ?? 0, // mới
      updateAuto: data.updateAuto ?? false, // mới
      note: data.note || "",
    };

    const res = await api.put(`/routes/${id}`, apiData);
    return res.data;
  },

  deleteRoute: async (id) => {
    const res = await api.delete(`/routes/${id}`);
    return res.data;
  },

  updateExchangeRates: async () => {
    const res = await api.put("/routes/update-exchange-rates");
    return res.data;
  },
  getRouteExchangeByRouteId: async (routeId) => {
    const res = await api.get(`/route-exchange/route/${routeId}`);
    return res.data;
  },
  getEffectiveRouteExchange: async (routeId, date) => {
    const res = await api.get(`/route-exchange/effective/${routeId}`, {
      params: { date },
    });
    return res.data;
  },
  createRouteExchange: async (payload) => {
    const res = await api.post("/route-exchange", payload);
    return res.data;
  },
  deleteRouteExchange: async (id) => {
    const res = await api.delete(`/route-exchange/${id}`);
    return res.data;
  },
};

export default routesService;
