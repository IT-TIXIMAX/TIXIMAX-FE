// // /src/Services/Payment/createPaymentShipService.jsx
// import api from "../../config/api.js";

// const createPaymentShipService = {
//   async createPaymentShipping(
//     isUseBalance,
//     customerVoucherId,
//     bankId,
//     priceShipDos,
//     itemCodes,
//   ) {
//     if (!Array.isArray(itemCodes) || !itemCodes.length)
//       throw new Error("itemCodes phải là mảng và không được rỗng.");
//     if (!bankId) throw new Error("bankId là bắt buộc.");

//     const flag = !!isUseBalance;
//     const voucherSeg = customerVoucherId ?? "null";
//     const url = `/payments/merged-shipping/${flag}/${bankId}/${priceShipDos}/${voucherSeg}`;

//     const { data } = await api.post(url, itemCodes);
//     return data;
//   },
//   async createPartialShipment(
//     isUseBalance,
//     bankId,
//     customerVoucherId,
//     priceShipDos,
//     selectedShipmentCodes,
//   ) {
//     if (
//       !Array.isArray(selectedShipmentCodes) ||
//       selectedShipmentCodes.length === 0
//     ) {
//       throw new Error("selectedShipmentCodes phải là mảng và không được rỗng.");
//     }
//     if (!bankId) throw new Error("bankId là bắt buộc.");

//     const flag = !!isUseBalance;
//     // Nếu không có voucher, backend nhận giá trị "null" (string)
//     const url = `/partial-shipment/partial-shipment/${flag}/${bankId}/${priceShipDos}/${
//       customerVoucherId ?? "null"
//     }`;
//     const body = { selectedShipmentCodes };

//     const { data } = await api.post(url, body);
//     return data;
//   },
// };

// export default createPaymentShipService;

// src/Services/Payment/createPaymentShipService.js
import api from "../../config/api.js";

export const createPartialShipmentByShipCode = (
  shipCode,
  isUseBalance,
  bankId,
  priceShipDos,
  customerVoucherId = null,
) => {
  const basePath = `/partial-shipment/by-ship-code/${shipCode}/${!!isUseBalance}/${bankId}/${priceShipDos}`;

  const fullPath = customerVoucherId
    ? `${basePath}/${customerVoucherId}`
    : basePath;

  console.log("🔍 API Call URL:", fullPath);

  return api.post(fullPath, null).then((r) => r.data);
};
