// // src/Services/Payment/paymentShipService.jsx
// import api from "../../config/api";

// export const getPaymentShipByShipCode = (shipCode, page = 0, size = 10) =>
//   api
//     .get(`/draft-domestics/ship-code/payment/${page}/${size}`, {
//       params: { shipCode },
//     })
//     .then((r) => r.data);

// src/Services/Payment/paymentShipService.jsx
import api from "../../config/api";

export const getPaymentShipByShipCode = (
  keyword,
  payment = false,
  page = 0,
  size = 10,
) =>
  api
    .get(`/draft-domestics/ship-code/payment/${page}/${size}`, {
      params: { keyword, payment },
    })
    .then((r) => r.data);
