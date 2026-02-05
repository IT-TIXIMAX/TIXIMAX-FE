// src/Services/Expense/expenseService.jsx
import api from "../../config/api";

const expenseService = {
  // GET /expense-request/{page}/{size}/{status}
  getList: async (page = 0, size = 10, status = "ALL") => {
    const { data } = await api.get(
      `/expense-request/${page}/${size}/${status}`,
    );
    return data;
  },

  // GET /expense-request/detail/{id}
  getDetail: async (id) => {
    if (!id) throw new Error("ExpenseRequest ID is required");
    const { data } = await api.get(`/expense-request/detail/${id}`);
    return data;
  },

  create: async (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new Error("Payload is required");
    }
    if (!String(payload.description || "").trim()) {
      throw new Error("description is required");
    }
    if (!String(payload.department || "").trim()) {
      throw new Error("department is required");
    }

    const body = {
      description: String(payload.description || "").trim(),
      quantity: Number(payload.quantity ?? 0),
      unitPrice: Number(payload.unitPrice ?? 0),
      note: payload.note ?? "",
      paymentMethod: payload.paymentMethod ?? "TIEN_MAT",
      bankInfo: payload.bankInfo ?? "",
      vatStatus: payload.vatStatus ?? "CHUA_VAT",
      vatInfo: payload.vatInfo ?? "",
      invoiceImage: payload.invoiceImage ?? "",
      transferImage: payload.transferImage ?? "",
      department: String(payload.department || "").trim(),
    };

    const { data } = await api.post("/expense-request", body);
    return data;
  },
  // PUT/PATCH /expense-request/approve/{id}
  approve: async (id, reason = "") => {
    if (!id) throw new Error("ExpenseRequest ID is required");
    // server của bạn đang nhận reason dạng raw string -> giữ nguyên
    const { data } = await api.patch(`/expense-request/approve/${id}`, reason);
    return data;
  },

  // PUT/PATCH /expense-request/reject/{id}
  reject: async (id, reason = "") => {
    if (!id) throw new Error("ExpenseRequest ID is required");
    const { data } = await api.patch(`/expense-request/reject/${id}`, reason);
    return data;
  },
};

export default expenseService;
