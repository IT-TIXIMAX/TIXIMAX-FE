// import api from "../../config/api";

// class ReceivePackingService {
//   // Confirm receipt of packings
//   async confirmReceipt(packingCodes, note = "") {
//     try {
//       const response = await api.post("/domestics/received", {
//         packingCode: packingCodes,
//         note: note,
//       });
//       if (response.data && response.data.error) {
//         throw new Error(`API Error: ${response.data.error}`);
//       }
//       return response.data;
//     } catch (error) {
//       console.error(
//         `Error confirming receipt for packing codes ${packingCodes.join(
//           ", "
//         )}:`,
//         error
//       );
//       throw error;
//     }
//   }
// }

// // Create and export a singleton instance
// const receivePackingService = new ReceivePackingService();

// export default receivePackingService;

import api from "../../config/api";

const receivePackingService = {
  confirmReceipt(packingCodes, note = "") {
    return api
      .post("/domestics/received", { packingCode: packingCodes, note })
      .then((res) => res.data);
  },
  async checkInDomestic(shipmentCode) {
    const code = encodeURIComponent(shipmentCode);
    const { data } = await api.get(`/domestics/check-in-domestic/${code}`, {
      params: { shipmentCode },
    });
    if (data?.error) throw new Error(data.error);
    return data;
  },
  async scanImport(shipmentCode) {
    const code = encodeURIComponent(shipmentCode);
    const { data } = await api.post(`/domestics/scan-import/${code}`);
    if (data?.error) throw new Error(data.error);
    return data;
  },
};

export default receivePackingService;
