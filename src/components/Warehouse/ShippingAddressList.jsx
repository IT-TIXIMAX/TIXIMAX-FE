import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Package,
  MapPin,
  TruckIcon,
  Weight,
  Plus,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";
import AddShipmentDelivery from "./AddShipmentDelivery";
import RemoveShipmentDelivery from "./RemoveShipmentDelivery";

const PAGE_SIZES = [50, 100, 200];

/* ===================== Skeletons ===================== */
const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-12 w-12 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

const TableSkeleton = ({ rows = 10 }) => (
  <div className="p-4 animate-pulse">
    <div className="h-12 bg-gray-100 rounded-lg mb-4" />
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded hidden md:block" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ShippingAddressList = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  const [searchCustomerCode, setSearchCustomerCode] = useState("");
  const [searchShipmentCode, setSearchShipmentCode] = useState("");

  const [filterCustomerCode, setFilterCustomerCode] = useState("");
  const [filterShipmentCode, setFilterShipmentCode] = useState("");

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filterCustomerCode, filterShipmentCode]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const params = {};
      if (filterCustomerCode) params.customerCode = filterCustomerCode;
      if (filterShipmentCode) params.shipmentCode = filterShipmentCode;

      const response = await draftWarehouseService.getShippingAddressList(
        page,
        pageSize,
        params
      );

      if (response?.content) {
        setAddresses(response.content);
        setTotalCount(response.totalElements || 0);
      } else {
        setAddresses(response || []);
        setTotalCount(response?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching shipping addresses:", error);
      const errorMessage =
        error?.response?.data?.error ||
        "Không thể tải danh sách địa chỉ giao hàng";
      toast.error(errorMessage);
      setAddresses([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  );

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleSearch = () => {
    setFilterCustomerCode(searchCustomerCode.trim());
    setFilterShipmentCode(searchShipmentCode.trim());
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchCustomerCode("");
    setSearchShipmentCode("");
    setFilterCustomerCode("");
    setFilterShipmentCode("");
    setPage(0);
  };

  const handleOpenAddDialog = (address) => {
    setSelectedAddress(address);
    setIsAddDialogOpen(true);
  };

  const handleOpenRemoveDialog = (address) => {
    setSelectedAddress(address);
    setIsRemoveDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchAddresses();
  };

  const showingFrom = totalCount ? page * pageSize + 1 : 0;
  const showingTo = Math.min((page + 1) * pageSize, totalCount);

  const totalShipments = useMemo(() => {
    return addresses.reduce(
      (sum, addr) => sum + (addr.shippingList?.length || 0),
      0
    );
  }, [addresses]);

  const totalWeight = useMemo(() => {
    return addresses.reduce((sum, addr) => sum + (addr.weight || 0), 0);
  }, [addresses]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MapPin size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Danh Sách Địa Chỉ Giao Hàng Đã Tạo
              </h1>
            </div>

            {/* Right: Reload Button */}
            <button
              onClick={fetchAddresses}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Tải lại
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Địa Chỉ
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {totalCount}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Mã Vận Đơn
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {totalShipments}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Trọng Lượng
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {totalWeight.toFixed(1)} kg
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Weight className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Đang Hiển Thị
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {addresses.length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TruckIcon className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Inputs */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã khách hàng ..."
                    value={searchCustomerCode}
                    onChange={(e) => setSearchCustomerCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchCustomerCode && (
                    <button
                      onClick={() => setSearchCustomerCode("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã vận đơn ..."
                    value={searchShipmentCode}
                    onChange={(e) => setSearchShipmentCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchShipmentCode && (
                    <button
                      onClick={() => setSearchShipmentCode("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  <Search size={18} />
                  Tìm kiếm
                </button>

                {(filterCustomerCode || filterShipmentCode) && (
                  <button
                    onClick={handleClearSearch}
                    disabled={loading}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    type="button"
                  >
                    <X size={18} />
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Hiển thị:
              </span>
              <div className="flex gap-2">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pageSize === size
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    type="button"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={10} />
          ) : addresses.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không có địa chỉ giao hàng nào
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Thử thay đổi bộ lọc hoặc tìm kiếm
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      ID
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã Ship
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Tên Khách Hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Số Điện Thoại
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Địa Chỉ
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Trọng Lượng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Danh Sách Mã Vận Đơn
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã VNPost
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Thao Tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {addresses.map((address, index) => (
                    <tr
                      key={address.id}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-700">
                          {address.id}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-700 whitespace-nowrap">
                            {address.shipCode || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">
                          {address.customerName || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {address.phoneNumber ? (
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {address.phoneNumber}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Chưa có
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {address.address ? (
                          <span className="text-sm text-gray-700">
                            {address.address}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Chưa có địa chỉ
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-purple-700">
                            {address.weight ? `${address.weight} kg` : "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {address.shippingList?.length > 0 ? (
                            address.shippingList
                              .slice(0, 6)
                              .map((code, idx) => (
                                <div
                                  key={`${address.id}-${code}-${idx}`}
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg border border-blue-200"
                                >
                                  <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full font-semibold min-w-[20px] text-center">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm font-mono text-gray-800">
                                    {code}
                                  </span>
                                </div>
                              ))
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Không có
                            </span>
                          )}
                          {address.shippingList?.length > 6 && (
                            <div className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-semibold">
                              +{address.shippingList.length - 6}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {address.vnpostTrackingCode ? (
                          <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                            {address.vnpostTrackingCode}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Chưa có
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenAddDialog(address)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center gap-1.5 text-sm"
                            type="button"
                            title="Thêm mã vận đơn"
                          >
                            <Plus size={16} />
                            Thêm
                          </button>
                          <button
                            onClick={() => handleOpenRemoveDialog(address)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all flex items-center gap-1.5 text-sm"
                            type="button"
                            title="Xóa mã vận đơn"
                          >
                            <Trash2 size={16} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Hiển thị{" "}
                  <span className="font-semibold text-gray-900">
                    {showingFrom}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-gray-900">
                    {showingTo}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-semibold text-gray-900">
                    {totalCount}
                  </span>{" "}
                  địa chỉ
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Đầu
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Sau
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Cuối
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddShipmentDelivery
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setSelectedAddress(null);
        }}
        address={selectedAddress}
        onSuccess={handleDialogSuccess}
      />

      <RemoveShipmentDelivery
        isOpen={isRemoveDialogOpen}
        onClose={() => {
          setIsRemoveDialogOpen(false);
          setSelectedAddress(null);
        }}
        address={selectedAddress}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default ShippingAddressList;
