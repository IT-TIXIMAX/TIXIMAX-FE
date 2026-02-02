// src/Components/Manager/BankAccountList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import managerBankAccountService from "../../Services/Manager/managerBankAccountService";
import {
  RefreshCw,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Building2,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

function BadgeYesNo({ value }) {
  return value ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
      <Check className="w-3 h-3" />
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-300 text-slate-700 text-xs font-bold border border-slate-400">
      <X className="w-3 h-3" />
      No
    </span>
  );
}

const getErrorMessage = (err, fallback) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
};

export default function ManagerBankAccountList() {
  const navigate = useNavigate();

  // data + ui
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // search, filters, sort, pagination
  const [q, setQ] = useState("");
  const [fProxy, setFProxy] = useState("all");
  const [sortBy, setSortBy] = useState({ key: "id", dir: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // dialogs
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // forms
  const emptyForm = {
    id: 0,
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    isProxy: false,
    isRevenue: false,
  };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await managerBankAccountService.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Không tải được danh sách tài khoản."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // filter + search + sort
  const filtered = useMemo(() => {
    let data = [...rows];
    const kw = q.trim().toLowerCase();
    if (kw) {
      data = data.filter(
        (r) =>
          String(r.bankName ?? "")
            .toLowerCase()
            .includes(kw) ||
          String(r.accountHolder ?? "")
            .toLowerCase()
            .includes(kw) ||
          String(r.accountNumber ?? "")
            .toLowerCase()
            .includes(kw),
      );
    }
    if (fProxy !== "all") {
      const v = fProxy === "yes";
      data = data.filter((r) => Boolean(r.isProxy) === v);
    }

    data.sort((a, b) => {
      const { key, dir } = sortBy;
      const va = a?.[key];
      const vb = b?.[key];
      if (va == null && vb == null) return 0;
      if (va == null) return dir === "asc" ? -1 : 1;
      if (vb == null) return dir === "asc" ? 1 : -1;
      if (typeof va === "number" && typeof vb === "number") {
        return dir === "asc" ? va - vb : vb - va;
      }
      return dir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return data;
  }, [rows, q, fProxy, sortBy]);

  // pagination slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => setPage(1), [q, fProxy]);

  const changeSort = (key) => {
    setSortBy((prev) => {
      if (prev.key === key)
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { key, dir: "asc" };
    });
  };

  // actions
  const openCreate = () => {
    setForm(emptyForm);
    setShowCreate(true);
  };

  const doCreate = async () => {
    try {
      setSubmitting(true);
      await managerBankAccountService.create({ ...form, id: 0 });
      setShowCreate(false);
      toast.success("Tạo tài khoản ngân hàng thành công.");
      fetchAll();
    } catch (err) {
      toast.error(getErrorMessage(err, "Tạo tài khoản thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = async (id) => {
    try {
      setSubmitting(true);
      const data = await managerBankAccountService.getById(id);
      setForm({
        id: data.id,
        bankName: data.bankName ?? "",
        accountHolder: data.accountHolder ?? "",
        accountNumber: data.accountNumber ?? "",
        isProxy: !!data.isProxy,
        isRevenue: !!data.isRevenue,
      });
      setShowEdit(true);
    } catch (err) {
      toast.error(
        getErrorMessage(err, `Không lấy được dữ liệu chỉnh sửa #${id}.`),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const doEdit = async () => {
    try {
      setSubmitting(true);
      const { id, ...rest } = form;
      await managerBankAccountService.update(id, { id, ...rest });
      setShowEdit(false);
      toast.success("Cập nhật tài khoản thành công.");
      fetchAll();
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  const openView = async (id) => {
    try {
      setSubmitting(true);
      const data = await managerBankAccountService.getById(id);
      setForm({
        id: data.id,
        bankName: data.bankName ?? "",
        accountHolder: data.accountHolder ?? "",
        accountNumber: data.accountNumber ?? "",
        isProxy: !!data.isProxy,
        isRevenue: !!data.isRevenue,
      });
      setShowView(true);
    } catch (err) {
      toast.error(
        getErrorMessage(err, `Không lấy được chi tiết tài khoản #${id}.`),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const askDelete = (id) => setDeleteId(id);

  const doDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await managerBankAccountService.delete(deleteId);
      setDeleteId(null);
      toast.success("Đã xóa tài khoản ngân hàng.");
      fetchAll();
    } catch (err) {
      toast.error(
        getErrorMessage(err, `Xóa tài khoản #${deleteId} không thành công.`),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortBy.key !== columnKey) return null;
    return sortBy.dir === "asc" ? (
      <span className="ml-1 text-xs">▲</span>
    ) : (
      <span className="ml-1 text-xs">▼</span>
    );
  };

  const SkeletonRows = () =>
    [...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-4 py-3">
          <div className="h-4 bg-slate-200 rounded w-24" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 bg-slate-200 rounded w-32" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 bg-slate-200 rounded w-28" />
        </td>
        <td className="px-4 py-3">
          <div className="h-5 bg-slate-200 rounded-full w-14" />
        </td>
        <td className="px-4 py-3">
          <div className="h-5 bg-slate-200 rounded-full w-14" />
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-2">
            <div className="h-8 bg-slate-200 rounded w-14" />
            <div className="h-8 bg-slate-200 rounded w-14" />
            <div className="h-8 bg-slate-200 rounded w-14" />
          </div>
        </td>
      </tr>
    ));

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        {/* ✅ Header với nút Back - VERSION 1 */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-700 rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col gap-4">
              {/* ✅ Back Button Row */}
              <div className="flex items-center">
                <button
                  onClick={() => navigate("/manager/settings")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md border border-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Quay lại Cấu hình</span>
                </button>
              </div>

              {/* ✅ Title Row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left side - Title */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-1.5 h-10 md:h-12 bg-white/90 rounded-full shrink-0 shadow-sm" />
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                    <Building2 className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                      Quản Lý Tài Khoản Ngân Hàng
                    </h1>
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-white/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Thêm tài khoản</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo ngân hàng, số tài khoản, chủ tài khoản..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={fProxy}
                onChange={(e) => setFProxy(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Proxy: Tất cả</option>
                <option value="yes">Proxy: Yes</option>
                <option value="no">Proxy: No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Stats bar */}
          <div className="px-4 md:px-6 py-4 bg-slate-50 border-b border-slate-200">
            {loading ? (
              <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
            ) : (
              <div className="text-sm md:text-base font-medium text-slate-700">
                Hiển thị{" "}
                <span className="text-lg font-bold text-blue-600">
                  {pageData.length}
                </span>{" "}
                /{" "}
                <span className="font-semibold text-slate-900">
                  {filtered.length}
                </span>{" "}
                bản ghi
                {filtered.length < rows.length && (
                  <span className="text-slate-500">
                    {" "}
                    (lọc từ {rows.length} tổng)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <Th onClick={() => changeSort("bankName")}>
                    Bank Name <SortIcon columnKey="bankName" />
                  </Th>
                  <Th onClick={() => changeSort("accountNumber")}>
                    Account Number <SortIcon columnKey="accountNumber" />
                  </Th>
                  <Th onClick={() => changeSort("accountHolder")}>
                    Account Holder <SortIcon columnKey="accountHolder" />
                  </Th>
                  <Th>Proxy</Th>
                  <Th>Revenue</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <SkeletonRows />
                ) : pageData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16">
                      <div className="flex flex-col items-center gap-3">
                        <Building2 className="w-16 h-16 text-slate-300" />
                        <h3 className="text-slate-500 font-medium text-lg">
                          Không có tài khoản nào
                        </h3>
                        <p className="text-sm text-slate-400">
                          {filtered.length === 0 && rows.length > 0
                            ? "Không có tài khoản nào khớp với bộ lọc hiện tại."
                            : "Thêm tài khoản ngân hàng đầu tiên để bắt đầu."}
                        </p>
                        {rows.length === 0 && (
                          <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md hover:shadow-lg mt-2"
                          >
                            <Plus className="w-4 h-4" />
                            Thêm tài khoản
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-blue-700">
                        {r.bankName}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-800 font-semibold">
                          {r.accountNumber}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {r.accountHolder}
                      </td>

                      <td className="px-4 py-3">
                        <BadgeYesNo value={r.isProxy} />
                      </td>

                      <td className="px-4 py-3">
                        <BadgeYesNo value={r.isRevenue} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openView(r.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                            title="Xem"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => openEdit(r.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-amber-200 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all shadow-sm hover:shadow-md"
                            title="Sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => askDelete(r.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-all shadow-sm hover:shadow-md"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-slate-50 px-4 md:px-6 py-3 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-sm text-slate-600">
              Trang <span className="font-semibold text-slate-900">{page}</span>{" "}
              /{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors shadow-sm"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modals giữ nguyên... */}
        {/* VIEW MODAL */}
        {showView && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowView(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  Chi tiết tài khoản
                </h2>
                <button
                  onClick={() => setShowView(false)}
                  className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Đóng"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">
                    Tên ngân hàng
                  </div>
                  <div className="text-base font-semibold text-slate-900">
                    {form.bankName || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">
                    Số tài khoản
                  </div>
                  <div className="font-mono text-sm bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-800 font-semibold">
                    {form.accountNumber || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">
                    Tên chủ thẻ
                  </div>
                  <div className="text-sm text-slate-900 font-medium">
                    {form.accountHolder || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      Nhận tiền hàng
                    </div>
                    <BadgeYesNo value={form.isProxy} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      Nhận tiền vận chuyển
                    </div>
                    <BadgeYesNo value={form.isRevenue} />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowView(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-medium transition-colors shadow-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE MODAL */}
        {showCreate && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreate(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  Thêm tài khoản ngân hàng
                </h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Đóng"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên ngân hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, bankName: e.target.value }))
                    }
                    placeholder="ACB, Vietcombank, Techcombank..."
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên tài khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.accountHolder}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, accountHolder: e.target.value }))
                    }
                    placeholder="Nguyen Van A"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Số tài khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, accountNumber: e.target.value }))
                    }
                    placeholder="23323667"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-6 pt-3">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={form.isProxy}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, isProxy: e.target.checked }))
                      }
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Nhận tiền hàng
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={form.isRevenue}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          isRevenue: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Nhận Vận Chuyển
                    </span>
                  </label>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-medium transition-colors shadow-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={doCreate}
                  disabled={submitting}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  {submitting ? "Đang tạo..." : "Tạo"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {showEdit && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEdit(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  Chỉnh sửa tài khoản
                </h2>
                <button
                  onClick={() => setShowEdit(false)}
                  className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Đóng"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên ngân hàng
                  </label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, bankName: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên chủ thẻ
                  </label>
                  <input
                    type="text"
                    value={form.accountHolder}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, accountHolder: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, accountNumber: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-6 pt-3">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={form.isProxy}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, isProxy: e.target.checked }))
                      }
                      className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Nhận tiền hàng
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={form.isRevenue}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          isRevenue: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Nhận Vận Chuyển
                    </span>
                  </label>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-medium transition-colors shadow-sm"
                >
                  Thoát
                </button>
                <button
                  onClick={doEdit}
                  disabled={submitting}
                  className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM MODAL */}
        {deleteId != null && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteId(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Xác nhận xóa
                </h2>
                <button
                  onClick={() => setDeleteId(null)}
                  className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Đóng"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 text-center">
                <Trash2 className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Xóa tài khoản ngân hàng
                </h3>
                <p className="text-sm text-slate-600">
                  Hành động này không thể hoàn tác. Bạn có chắc muốn xóa?
                </p>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-medium transition-colors shadow-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={doDelete}
                  disabled={submitting}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  {submitting ? "Đang xóa..." : "Xóa tài khoản"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Table Header Component
const Th = ({ children, onClick, className = "" }) => (
  <th
    onClick={onClick}
    className={`px-4 py-3 text-left font-bold text-sm uppercase tracking-wider ${
      onClick ? "cursor-pointer hover:bg-blue-700 transition-colors" : ""
    } ${className}`}
  >
    {children}
  </th>
);
