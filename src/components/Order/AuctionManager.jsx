import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import SearchWebsite from "./SearchWebsite";
import UploadImg from "../../common/UploadImg";
import {
  ShoppingCart,
  Plus,
  ChevronDown,
  Trash2,
  Link2,
  Image,
  MessageSquare,
} from "lucide-react";

const AuctionManager = ({
  products,
  setProducts,
  productTypes,
  isFormEnabled,
}) => {
  const [selectedWebsites, setSelectedWebsites] = useState({});
  const [collapsedProducts, setCollapsedProducts] = useState({});

  const handleToggleCollapse = useCallback((index) => {
    setCollapsedProducts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  const handleSelectWebsite = useCallback(
    (index, website) => {
      setProducts((prev) => {
        const updated = [...prev];
        updated[index].website = website.websiteName || "";
        return updated;
      });

      setSelectedWebsites((prev) => ({
        ...prev,
        [index]: website,
      }));

      toast.success(`Đã chọn website: ${website.websiteName}`);
    },
    [setProducts],
  );

  const handleClearWebsite = useCallback(
    (index) => {
      setProducts((prev) => {
        const updated = [...prev];
        updated[index].website = "";
        return updated;
      });

      setSelectedWebsites((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

      toast("Đã xóa thông tin website");
    },
    [setProducts],
  );

  const handleWebsiteInputChange = useCallback(
    (index, e) => {
      const value = e.target.value;

      setProducts((prev) => {
        const updated = [...prev];
        updated[index].website = value;
        return updated;
      });

      if (
        selectedWebsites[index] &&
        value !== selectedWebsites[index].websiteName
      ) {
        setSelectedWebsites((prev) => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
      }
    },
    [setProducts, selectedWebsites],
  );

  const formatCurrency = (value) => {
    if (!value || value === "") return "";
    const stringValue = value.toString();
    const parts = stringValue.split(".");
    const integerPart = parts[0].replace(/,/g, "");
    const decimalPart = parts[1];
    if (!/^\d*$/.test(integerPart)) return stringValue;
    const formatted = integerPart
      ? parseInt(integerPart).toLocaleString("en-US")
      : "";
    return decimalPart !== undefined
      ? formatted + "." + decimalPart
      : formatted;
  };

  const getRawValue = (value) => value.toString().replace(/,/g, "");

  const isValidDecimal = (value) => /^\d*\.?\d*$/.test(value) || value === "";

  const handleQuantityBlur = useCallback(
    (index) => {
      setProducts((prev) => {
        const updated = [...prev];
        const raw = getRawValue(updated[index].quantity);

        if (!raw || raw === "" || raw === "0") {
          updated[index].quantity = "1";
        } else {
          const num = parseFloat(raw);
          updated[index].quantity = !isNaN(num) && num > 0 ? raw : "1";
        }

        return updated;
      });
    },
    [setProducts],
  );

  const handleCurrencyBlur = useCallback(
    (index, field) => {
      setProducts((prev) => {
        const updated = [...prev];
        const raw = getRawValue(updated[index][field]);

        if (raw && raw !== "") {
          const num = parseFloat(raw);
          if (!isNaN(num) && num >= 0) {
            updated[index][field] = raw;
          }
        }

        return updated;
      });
    },
    [setProducts],
  );

  const handleProductChange = useCallback(
    (index, e) => {
      const { name, value } = e.target;
      setProducts((prev) => {
        const updated = [...prev];

        if (name === "productTypeId") {
          const typeId = Number(value);
          const type = productTypes.find((p) => p.productTypeId === typeId);

          updated[index] = {
            ...updated[index],
            [name]: typeId,
            extraCharge: type?.fee ? updated[index].extraCharge : "0",
          };
        } else {
          if (["priceWeb", "shipWeb", "extraCharge"].includes(name)) {
            const clean = getRawValue(value);
            if (isValidDecimal(clean)) {
              updated[index][name] = clean;
            }
          } else if (name === "quantity") {
            const clean = getRawValue(value);

            if (clean === "") {
              updated[index][name] = "";
            } else if (isValidDecimal(clean)) {
              if (
                clean.startsWith("0") &&
                !clean.startsWith("0.") &&
                clean.length > 1
              ) {
                const trimmed = clean.replace(/^0+/, "");
                updated[index][name] = trimmed || "0";
              } else {
                const num = parseFloat(clean);
                if (!isNaN(num) && num > 0) {
                  updated[index][name] = clean;
                } else if (clean.endsWith(".")) {
                  updated[index][name] = clean;
                }
              }
            }
          } else {
            updated[index][name] = value;
          }
        }

        return updated;
      });
    },
    [productTypes, setProducts],
  );

  const handleImageUpload = useCallback(
    (index, url) => {
      setProducts((prev) => {
        const updated = [...prev];
        updated[index].purchaseImage = url;
        return updated;
      });

      toast.success(`Upload ảnh sản phẩm ${index + 1} thành công!`);
    },
    [setProducts],
  );

  const handleImageRemove = useCallback(
    (index) => {
      setProducts((prev) => {
        const updated = [...prev];
        updated[index].purchaseImage = "";
        return updated;
      });

      toast.success("Đã xóa ảnh sản phẩm thành công");
    },
    [setProducts],
  );

  const addProduct = useCallback(() => {
    setProducts((prev) => [
      ...prev,
      {
        productLink: "",
        quantity: "1",
        priceWeb: "",
        shipWeb: "",
        productName: "",
        purchaseFee: "",
        extraCharge: "",
        purchaseImage: "",
        website: "",
        classify: "",
        productTypeId: "",
        groupTag: null,
        note: "",
      },
    ]);
  }, [setProducts]);

  const removeProduct = useCallback(
    (index) => {
      setProducts((prev) => prev.filter((_, i) => i !== index));

      setSelectedWebsites((prev) => {
        const updated = {};
        Object.keys(prev).forEach((key) => {
          const old = Number(key);
          if (old < index) updated[old] = prev[key];
          else if (old > index) updated[old - 1] = prev[key];
        });
        return updated;
      });

      setCollapsedProducts((prev) => {
        const updated = {};
        Object.keys(prev).forEach((key) => {
          const old = Number(key);
          if (old < index) updated[old] = prev[key];
          else if (old > index) updated[old - 1] = prev[key];
        });
        return updated;
      });

      toast.success("Đã xóa sản phẩm");
    },
    [setProducts],
  );

  const shouldAutoCollapse = (index) =>
    products.length >= 3 && index < products.length - 1;

  const isCollapsed = (index) =>
    shouldAutoCollapse(index)
      ? collapsedProducts[index] !== false
      : collapsedProducts[index] === true;

  return (
    <div className="w-full">
      <div className="bg-gray-100 shadow-sm p-3 mb-4 border-b border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Tổng số sản phẩm:{" "}
            <span className="font-semibold text-blue-600">
              {products.length}
            </span>
          </p>

          {/* <button
            onClick={addProduct}
            className="bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600 flex items-center gap-2 transition-colors disabled:opacity-50"
            disabled={!isFormEnabled}
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </button> */}
        </div>
      </div>

      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
        {products.map((product, index) => {
          const collapsed = isCollapsed(index);
          const productType = productTypes.find(
            (p) => p.productTypeId === product.productTypeId,
          );

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shadow">
                      {index + 1}
                    </div>

                    {collapsed ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800 text-base">
                          {product.productName || "Chưa đặt tên"}
                        </h3>

                        <div className="flex items-center gap-2">
                          {product.website && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs border border-blue-200">
                              {product.website}
                            </span>
                          )}

                          {productType && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                productType.fee
                                  ? "bg-orange-100 text-orange-600 border border-orange-200"
                                  : "bg-green-100 text-green-600 border border-green-200"
                              }`}
                            >
                              {productType.productTypeName}
                            </span>
                          )}

                          {product.quantity && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 text-xs rounded-full border border-green-200">
                              SL: {formatCurrency(product.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-gray-800 text-base">
                        {product.productName || "Sản phẩm mới"}
                      </h3>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(shouldAutoCollapse(index) ||
                      collapsedProducts[index] !== undefined) && (
                      <button
                        onClick={() => handleToggleCollapse(index)}
                        className="p-1.5 hover:bg-gray-200 rounded"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-gray-600 transition-transform ${
                            collapsed ? "" : "rotate-180"
                          }`}
                        />
                      </button>
                    )}

                    {index > 0 && (
                      <button
                        onClick={() => removeProduct(index)}
                        className="px-2 py-1.5 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 flex items-center gap-1"
                        disabled={!isFormEnabled}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!collapsed && (
                <div className="p-6 space-y-4">
                  {/* Tên sản phẩm + Số lượng + Website */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={product.productName}
                        onChange={(e) => handleProductChange(index, e)}
                        className="w-full px-4 py-2 text-sm border rounded"
                        disabled={!isFormEnabled}
                        placeholder="Nhập tên sản phẩm..."
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số lượng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="quantity"
                        value={formatCurrency(product.quantity || "")}
                        onChange={(e) => handleProductChange(index, e)}
                        onBlur={() => handleQuantityBlur(index)}
                        className="w-full px-4 py-2 text-sm border rounded"
                        disabled={!isFormEnabled}
                      />
                    </div>

                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website <span className="text-red-500">*</span>
                      </label>

                      <SearchWebsite
                        onSelectWebsite={(website) =>
                          handleSelectWebsite(index, website)
                        }
                        value={product.website}
                        onChange={(e) => handleWebsiteInputChange(index, e)}
                        onClear={() => handleClearWebsite(index)}
                      />
                    </div>
                  </div>

                  {/* Link sản phẩm */}
                  <div>
                    <label className="block text-sm font-medium flex gap-2 mb-2">
                      <Link2 className="w-4 h-4 text-purple-500" />
                      Link sản phẩm
                    </label>

                    <input
                      type="text"
                      name="productLink"
                      value={product.productLink}
                      onChange={(e) => handleProductChange(index, e)}
                      className="w-full px-4 py-2 text-sm border rounded"
                      disabled={!isFormEnabled}
                      placeholder="https://..."
                    />
                  </div>

                  {/* GIÁ + SHIP + PHÍ MUA */}
                  <div>
                    <div className="col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá sản phẩm <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        name="priceWeb"
                        value={formatCurrency(product.priceWeb || "")}
                        onChange={(e) => handleProductChange(index, e)}
                        onBlur={() => handleCurrencyBlur(index, "priceWeb")}
                        className="w-full px-4 py-2 text-sm border rounded"
                        disabled={!isFormEnabled}
                        placeholder="00000"
                      />
                    </div>

                    {/* 🚫 SHIP & PHÍ MUA BỊ TẮT – AN TOÀN JSX  */}
                    {false && (
                      <>
                        <div className="col-span-4">
                          <label className="block text-sm font-medium mb-2">
                            Phí ship Website
                          </label>
                          <input
                            type="text"
                            name="shipWeb"
                            value={formatCurrency(product.shipWeb || "")}
                            onChange={(e) => handleProductChange(index, e)}
                            onBlur={() => handleCurrencyBlur(index, "shipWeb")}
                            className="w-full px-4 py-2 text-sm border rounded"
                            disabled={!isFormEnabled}
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="block text-sm font-medium mb-2">
                            Phí mua
                          </label>
                          <input
                            type="text"
                            name="purchaseFee"
                            value={product.purchaseFee || ""}
                            onChange={(e) => handleProductChange(index, e)}
                            onBlur={() =>
                              handleCurrencyBlur(index, "purchaseFee")
                            }
                            className="w-full px-4 py-2 text-sm border rounded"
                            disabled={!isFormEnabled}
                            placeholder="%"
                          />
                        </div>
                      </>
                    )}

                    {/* 🔥 FILL TRỐNG 7 CỘT ĐỂ ĐỦ GRID = KHÔNG LỖI LAYOUT */}
                    {!false && <div className="col-span-7"></div>}
                  </div>

                  {/* Loại sản phẩm + Phụ phí + Phân loại */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại sản phẩm <span className="text-red-500">*</span>
                      </label>

                      <select
                        name="productTypeId"
                        value={product.productTypeId}
                        onChange={(e) => handleProductChange(index, e)}
                        className="w-full px-4 py-2 text-sm border rounded"
                        disabled={!isFormEnabled}
                      >
                        <option value="">Chọn loại sản phẩm</option>
                        {productTypes.map((type) => (
                          <option
                            key={type.productTypeId}
                            value={type.productTypeId}
                          >
                            {type.productTypeName}{" "}
                            {type.fee ? "(Có phí)" : "(Miễn phí)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phụ phí (VNĐ)
                      </label>

                      {productType?.fee ? (
                        <input
                          type="text"
                          name="extraCharge"
                          value={formatCurrency(product.extraCharge || "")}
                          onChange={(e) => handleProductChange(index, e)}
                          onBlur={() =>
                            handleCurrencyBlur(index, "extraCharge")
                          }
                          className="w-full px-4 py-2 text-sm border rounded"
                          disabled={!isFormEnabled}
                          placeholder="0"
                        />
                      ) : (
                        <div className="w-full px-4 py-2 text-sm border rounded bg-green-50 text-green-700 text-center">
                          Miễn phí
                        </div>
                      )}
                    </div>

                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phân loại
                      </label>

                      <input
                        type="text"
                        name="classify"
                        value={product.classify || ""}
                        onChange={(e) => handleProductChange(index, e)}
                        className="w-full px-4 py-2 text-sm border rounded"
                        disabled={!isFormEnabled}
                        placeholder="Phân loại.."
                      />
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div>
                    <label className="block text-sm font-medium flex gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-yellow-500" />
                      Ghi chú bổ sung
                    </label>

                    <textarea
                      name="note"
                      value={product.note}
                      onChange={(e) => handleProductChange(index, e)}
                      rows="3"
                      className="w-full px-4 py-2 text-sm border rounded resize-none"
                      disabled={!isFormEnabled}
                      placeholder="Ghi chú..."
                    />
                  </div>

                  {/* Hình ảnh */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium mb-3 flex gap-2">
                      <Image className="w-4 h-4 text-purple-500" />
                      Hình ảnh sản phẩm
                    </label>

                    <UploadImg
                      imageUrl={product.purchaseImage}
                      onImageUpload={(url) => handleImageUpload(index, url)}
                      onImageRemove={() => handleImageRemove(index)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <ShoppingCart className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có sản phẩm nào
          </h3>
          <p className="text-gray-500 mb-6">
            Bắt đầu thêm sản phẩm đầu tiên của bạn
          </p>

          <button
            onClick={addProduct}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 inline-flex items-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5" />
            Thêm sản phẩm đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};

export default AuctionManager;
