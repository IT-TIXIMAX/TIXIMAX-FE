// import { useState, useCallback } from "react";
// import toast from "react-hot-toast";
// import SearchWebsite from "./SearchWebsite";
// import UploadImg from "../../common/UploadImg";
// import {
//   ShoppingCart,
//   Plus,
//   ChevronDown,
//   Trash2,
//   Link2,
//   Image,
//   MessageSquare,
// } from "lucide-react";

// const ProductManager = ({
//   products,
//   setProducts,
//   productTypes,
//   isFormEnabled,
// }) => {
//   const [selectedWebsites, setSelectedWebsites] = useState({});
//   const [collapsedProducts, setCollapsedProducts] = useState({});

//   const handleToggleCollapse = useCallback((index) => {
//     setCollapsedProducts((prev) => ({
//       ...prev,
//       [index]: !prev[index],
//     }));
//   }, []);

//   const handleSelectWebsite = useCallback(
//     (index, website) => {
//       setProducts((prev) => {
//         const updatedProducts = [...prev];
//         updatedProducts[index].website = website.websiteName || "";
//         return updatedProducts;
//       });

//       setSelectedWebsites((prev) => ({
//         ...prev,
//         [index]: website,
//       }));

//       toast.success(`Đã chọn website: ${website.websiteName}`);
//     },
//     [setProducts]
//   );

//   const handleClearWebsite = useCallback(
//     (index) => {
//       setProducts((prev) => {
//         const updatedProducts = [...prev];
//         updatedProducts[index].website = "";
//         return updatedProducts;
//       });

//       setSelectedWebsites((prev) => {
//         const updated = { ...prev };
//         delete updated[index];
//         return updated;
//       });

//       toast("Đã xóa thông tin website");
//     },
//     [setProducts]
//   );

//   const handleWebsiteInputChange = useCallback(
//     (index, e) => {
//       const value = e.target.value;

//       setProducts((prev) => {
//         const updatedProducts = [...prev];
//         updatedProducts[index].website = value;
//         return updatedProducts;
//       });

//       if (
//         selectedWebsites[index] &&
//         value !== selectedWebsites[index].websiteName
//       ) {
//         setSelectedWebsites((prev) => {
//           const updated = { ...prev };
//           delete updated[index];
//           return updated;
//         });
//       }
//     },
//     [setProducts, selectedWebsites]
//   );

//   const formatCurrency = (value) => {
//     if (!value || value === "") return "";
//     const stringValue = value.toString();
//     const parts = stringValue.split(".");
//     const integerPart = parts[0].replace(/,/g, "");
//     const decimalPart = parts[1];
//     if (!/^\d*$/.test(integerPart)) return stringValue;
//     const formattedInteger = integerPart
//       ? parseInt(integerPart).toLocaleString("en-US")
//       : "";
//     return decimalPart !== undefined
//       ? formattedInteger + "." + decimalPart
//       : formattedInteger;
//   };

//   const getRawValue = (value) => {
//     return value.toString().replace(/,/g, "");
//   };

//   const isValidDecimal = (value) => {
//     return /^\d*\.?\d*$/.test(value) || value === "";
//   };

//   const handleQuantityBlur = useCallback(
//     (index) => {
//       setProducts((prev) => {
//         const updatedProducts = [...prev];
//         const currentValue = getRawValue(updatedProducts[index].quantity);

//         if (!currentValue || currentValue === "" || currentValue === "0") {
//           updatedProducts[index].quantity = "1";
//         } else {
//           const numValue = parseFloat(currentValue);
//           if (!isNaN(numValue) && numValue > 0) {
//             updatedProducts[index].quantity = currentValue;
//           } else {
//             updatedProducts[index].quantity = "1";
//           }
//         }

//         return updatedProducts;
//       });
//     },
//     [setProducts]
//   );
//   const handleCurrencyBlur = useCallback(
//     (index, fieldName) => {
//       setProducts((prev) => {
//         const updatedProducts = [...prev];
//         const currentValue = getRawValue(updatedProducts[index][fieldName]);

//         if (currentValue && currentValue !== "") {
//           if (fieldName === "purchaseFee") {
//             if (currentValue.includes("%")) {
//               const numPart = currentValue.replace("%", "");
//               const numValue = parseFloat(numPart);
//               if (!isNaN(numValue) && numValue >= 0) {
//                 updatedProducts[index][fieldName] = `${numPart}%`;
//               }
//             } else {
//               const numValue = parseFloat(currentValue);
//               if (!isNaN(numValue) && numValue >= 0) {
//                 updatedProducts[index][fieldName] = currentValue;
//               }
//             }
//           } else {
//             const numValue = parseFloat(currentValue);
//             if (!isNaN(numValue) && numValue >= 0) {
//               updatedProducts[index][fieldName] = currentValue;
//             }
//           }
//         }
//         // Không set "0" ở đây nữa, để trống

//         return updatedProducts;
//       });
//     },
//     [setProducts]
//   );

//   const handleProductChange = useCallback(
//     (index, e) => {
//       const { name, value } = e.target;
//       setProducts((prev) => {
//         const updatedProducts = [...prev];

//         if (name === "productTypeId") {
//           const productTypeId = Number(value);
//           const productType = productTypes.find(
//             (p) => p.productTypeId === productTypeId
//           );
//           updatedProducts[index] = {
//             ...updatedProducts[index],
//             [name]: productTypeId,
//             extraCharge: productType?.fee
//               ? updatedProducts[index].extraCharge
//               : "0",
//           };
//         } else {
//           if (["priceWeb", "shipWeb", "extraCharge"].includes(name)) {
//             const cleanValue = getRawValue(value);
//             if (isValidDecimal(cleanValue)) {
//               updatedProducts[index][name] = cleanValue;
//             }
//           } else if (name === "purchaseFee") {
//             let cleanValue = getRawValue(value);
//             if (/^\d*\.?\d*%?$/.test(cleanValue) || cleanValue === "") {
//               updatedProducts[index][name] = cleanValue;
//             }
//           } else if (name === "quantity") {
//             const cleanValue = getRawValue(value);
//             if (cleanValue === "") {
//               updatedProducts[index][name] = "";
//             } else if (isValidDecimal(cleanValue)) {
//               if (
//                 cleanValue.startsWith("0") &&
//                 !cleanValue.startsWith("0.") &&
//                 cleanValue.length > 1
//               ) {
//                 const withoutLeadingZeros = cleanValue.replace(/^0+/, "");
//                 updatedProducts[index][name] = withoutLeadingZeros || "0";
//               } else {
//                 const numericValue = parseFloat(cleanValue);
//                 if (!isNaN(numericValue) && numericValue > 0) {
//                   updatedProducts[index][name] = cleanValue;
//                 } else if (cleanValue.endsWith(".")) {
//                   updatedProducts[index][name] = cleanValue;
//                 }
//               }
//             }
//           } else {
//             updatedProducts[index][name] = value;
//           }
//         }

//         return updatedProducts;
//       });
//     },
//     [productTypes, setProducts]
//   );

//   const handleImageUpload = useCallback(
//     (index, imageUrl) => {
//       setProducts((prev) => {
//         const updatedProducts = [...prev];
//         updatedProducts[index].purchaseImage = imageUrl;
//         return updatedProducts;
//       });
//       toast.success(`Upload ảnh sản phẩm ${index + 1} thành công!`);
//     },
//     [setProducts]
//   );

//   const handleImageRemove = useCallback(
//     (index) => {
//       setProducts((prev) => {
//         const updatedProducts = [...prev];
//         updatedProducts[index].purchaseImage = "";
//         return updatedProducts;
//       });
//       toast.success("Đã xóa ảnh sản phẩm thành công");
//     },
//     [setProducts]
//   );

//   const addProduct = useCallback(() => {
//     setProducts((prev) => [
//       ...prev,
//       {
//         productLink: "",
//         quantity: "1",
//         priceWeb: "",
//         shipWeb: "",
//         productName: "",
//         purchaseFee: "",
//         extraCharge: "",
//         purchaseImage: "",
//         website: "",
//         productTypeId: "",
//         classify: "",
//         groupTag: "",
//         note: "",
//       },
//     ]);
//   }, [setProducts]);

//   const removeProduct = useCallback(
//     (index) => {
//       setProducts((prev) => prev.filter((_, i) => i !== index));

//       setSelectedWebsites((prev) => {
//         const updated = {};
//         Object.keys(prev).forEach((key) => {
//           const oldIndex = parseInt(key);
//           if (oldIndex < index) {
//             updated[oldIndex] = prev[key];
//           } else if (oldIndex > index) {
//             updated[oldIndex - 1] = prev[key];
//           }
//         });
//         return updated;
//       });

//       setCollapsedProducts((prev) => {
//         const updated = {};
//         Object.keys(prev).forEach((key) => {
//           const oldIndex = parseInt(key);
//           if (oldIndex < index) {
//             updated[oldIndex] = prev[key];
//           } else if (oldIndex > index) {
//             updated[oldIndex - 1] = prev[key];
//           }
//         });
//         return updated;
//       });

//       toast.success("Đã xóa sản phẩm");
//     },
//     [setProducts]
//   );

//   const shouldAutoCollapse = (index) => {
//     return products.length >= 3 && index < products.length - 1;
//   };

//   const isCollapsed = (index) => {
//     if (shouldAutoCollapse(index)) {
//       return collapsedProducts[index] !== false;
//     }
//     return collapsedProducts[index] === true;
//   };

//   return (
//     <div className="w-full">
//       {/* Header Section - Compact */}
//       <div className="bg-gray-100 shadow-sm p-3 mb-4 border-b border-gray-200 rounded-lg">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-600">
//               Tổng số sản phẩm:{" "}
//               <span className="font-semibold text-blue-600">
//                 {products.length}
//               </span>
//             </p>
//           </div>
//           <button
//             onClick={addProduct}
//             className="bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
//             disabled={!isFormEnabled}
//           >
//             <Plus className="w-4 h-4" />
//             Thêm sản phẩm
//           </button>
//         </div>
//       </div>

//       {/* Products List */}
//       <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 hide-scrollbar">
//         {products.map((product, index) => {
//           const collapsed = isCollapsed(index);
//           const productType = productTypes.find(
//             (p) => p.productTypeId === product.productTypeId
//           );

//           return (
//             <div
//               key={index}
//               className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
//             >
//               {/* Product Header - Compact */}
//               <div className="bg-gray-50 p-3 border-b border-gray-200">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3 flex-1">
//                     <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shadow">
//                       {index + 1}
//                     </div>
//                     {collapsed ? (
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <h3 className="font-semibold text-gray-800 text-base">
//                           {product.productName || "Chưa đặt tên"}
//                         </h3>
//                         <div className="flex items-center gap-2">
//                           {product.website && (
//                             <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200">
//                               {product.website}
//                             </span>
//                           )}
//                           {productType && (
//                             <span
//                               className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                                 productType.fee
//                                   ? "bg-orange-100 text-orange-700 border border-orange-200"
//                                   : "bg-green-100 text-green-700 border border-green-200"
//                               }`}
//                             >
//                               {productType.productTypeName}
//                             </span>
//                           )}
//                           {product.quantity && (
//                             <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">
//                               SL: {formatCurrency(product.quantity)}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     ) : (
//                       <h3 className="font-semibold text-gray-800 text-base">
//                         {product.productName || "Sản phẩm mới"}
//                       </h3>
//                     )}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     {(shouldAutoCollapse(index) ||
//                       collapsedProducts[index] !== undefined) && (
//                       <button
//                         onClick={() => handleToggleCollapse(index)}
//                         className="p-1.5 hover:bg-gray-200 rounded transition-colors"
//                         title={collapsed ? "Mở rộng" : "Thu gọn"}
//                       >
//                         <ChevronDown
//                           className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
//                             collapsed ? "" : "rotate-180"
//                           }`}
//                         />
//                       </button>
//                     )}
//                     {index > 0 && (
//                       <button
//                         onClick={() => removeProduct(index)}
//                         className="px-2 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200 transition-colors text-xs font-medium flex items-center gap-1"
//                         disabled={!isFormEnabled}
//                       >
//                         <Trash2 className="w-3.5 h-3.5" />
//                         Xóa
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Product Details */}
//               {!collapsed && (
//                 <div className="p-6 space-y-4">
//                   {/* Tên sản phẩm, Số lượng, Website */}
//                   <div className="grid grid-cols-12 gap-4">
//                     <div className="col-span-6">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Tên sản phẩm <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="productName"
//                         value={product.productName}
//                         onChange={(e) => handleProductChange(index, e)}
//                         className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         disabled={!isFormEnabled}
//                         placeholder="Nhập tên sản phẩm..."
//                       />
//                     </div>
//                     <div className="col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Số lượng <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="quantity"
//                         value={formatCurrency(product.quantity || "")}
//                         onChange={(e) => handleProductChange(index, e)}
//                         onBlur={() => handleQuantityBlur(index)}
//                         className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         disabled={!isFormEnabled}
//                         placeholder="0"
//                       />
//                     </div>
//                     <div className="col-span-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Website <span className="text-red-500">*</span>
//                       </label>
//                       <SearchWebsite
//                         onSelectWebsite={(website) =>
//                           handleSelectWebsite(index, website)
//                         }
//                         value={product.website}
//                         onChange={(e) => handleWebsiteInputChange(index, e)}
//                         onClear={() => handleClearWebsite(index)}
//                       />
//                     </div>
//                   </div>

//                   {/* Link sản phẩm */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                       <Link2 className="w-4 h-4 text-purple-500" />
//                       Link sản phẩm
//                     </label>
//                     <input
//                       type="text"
//                       name="productLink"
//                       value={product.productLink}
//                       onChange={(e) => handleProductChange(index, e)}
//                       className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                       disabled={!isFormEnabled}
//                       placeholder="https://..."
//                     />
//                   </div>

//                   {/* Giá sản phẩm, Phí ship, Phí mua, Group Tag */}
//                   <div className="grid grid-cols-12 gap-4">
//                     <div className="col-span-5">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Giá sản phẩm <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="priceWeb"
//                         value={formatCurrency(product.priceWeb || "")}
//                         onChange={(e) => handleProductChange(index, e)}
//                         onBlur={() => handleCurrencyBlur(index, "priceWeb")}
//                         className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         disabled={!isFormEnabled}
//                         placeholder="000000"
//                       />
//                     </div>
//                     <div className="col-span-3">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Phí ship Website <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="shipWeb"
//                         value={formatCurrency(product.shipWeb || "")}
//                         onChange={(e) => handleProductChange(index, e)}
//                         onBlur={() => handleCurrencyBlur(index, "shipWeb")}
//                         className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         disabled={!isFormEnabled}
//                         placeholder="000000"
//                       />
//                     </div>
//                     <div className="col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Phí mua
//                       </label>
//                       <input
//                         type="text"
//                         name="purchaseFee"
//                         value={product.purchaseFee || ""}
//                         onChange={(e) => handleProductChange(index, e)}
//                         onBlur={() => handleCurrencyBlur(index, "purchaseFee")}
//                         className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         disabled={!isFormEnabled}
//                         placeholder="%"
//                       />
//                     </div>
//                     <div className="col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Shop
//                       </label>
//                       <input
//                         type="text"
//                         name="groupTag"
//                         value={product.groupTag}
//                         onChange={(e) => handleProductChange(index, e)}
//                         className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         disabled={!isFormEnabled}
//                         placeholder="Tên shop..."
//                       />
//                     </div>
//                   </div>

//                   {/* Loại sản phẩm và Phụ phí */}
//                   <div className="grid grid-cols-12 gap-4">
//                     <div className="col-span-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Loại sản phẩm <span className="text-red-500">*</span>
//                       </label>
//                       <select
//                         name="productTypeId"
//                         value={product.productTypeId}
//                         onChange={(e) => handleProductChange(index, e)}
//                         className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         disabled={!isFormEnabled}
//                       >
//                         <option value="">Chọn loại sản phẩm</option>
//                         {productTypes.map((type) => (
//                           <option
//                             key={type.productTypeId}
//                             value={type.productTypeId}
//                           >
//                             {type.productTypeName}{" "}
//                             {type.fee ? "(Có phí)" : "(Miễn phí)"}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="col-span-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Phụ phí (VNĐ)
//                       </label>
//                       {productType?.fee ? (
//                         <input
//                           type="text"
//                           name="extraCharge"
//                           value={formatCurrency(product.extraCharge || "")}
//                           onChange={(e) => handleProductChange(index, e)}
//                           onBlur={() =>
//                             handleCurrencyBlur(index, "extraCharge")
//                           }
//                           className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                           disabled={!isFormEnabled}
//                           placeholder="00000"
//                         />
//                       ) : (
//                         <div className="w-full px-4 py-2 text-sm border border-gray-200 rounded bg-green-50 text-green-600 font-medium flex items-center justify-center">
//                           Miễn phí
//                         </div>
//                       )}
//                     </div>
//                     <div className="col-span-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Phân loại
//                       </label>
//                       <input
//                         type="text"
//                         name="classify"
//                         value={product.classify || ""}
//                         onChange={(e) => handleProductChange(index, e)}
//                         onBlur={() => handleCurrencyBlur(index, "classify")}
//                         className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         disabled={!isFormEnabled}
//                         placeholder="Phân loại..."
//                       />
//                     </div>
//                   </div>

//                   {/* Ghi chú */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                       <MessageSquare className="w-4 h-4 text-yellow-500" />
//                       Ghi chú bổ sung
//                     </label>
//                     <textarea
//                       name="note"
//                       value={product.note}
//                       onChange={(e) => handleProductChange(index, e)}
//                       rows="3"
//                       className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
//                       disabled={!isFormEnabled}
//                       placeholder="Ghi chú cho sản phẩm này (tùy chọn)..."
//                     />
//                   </div>

//                   {/* Hình ảnh sản phẩm - Phía dưới */}
//                   <div className="border-t pt-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
//                       <Image className="w-4 h-4 text-purple-500" />
//                       Hình ảnh sản phẩm
//                     </label>
//                     <UploadImg
//                       imageUrl={product.purchaseImage}
//                       onImageUpload={(imageUrl) =>
//                         handleImageUpload(index, imageUrl)
//                       }
//                       onImageRemove={() => handleImageRemove(index)}
//                       label=""
//                       maxSizeMB={3}
//                       placeholder="Chưa có ảnh sản phẩm"
//                       className=""
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Empty State */}
//       {products.length === 0 && (
//         <div className="bg-white rounded-xl shadow-md p-12 text-center">
//           <ShoppingCart className="w-24 h-24 mx-auto mb-4 text-gray-300" />
//           <h3 className="text-xl font-semibold text-gray-700 mb-2">
//             Chưa có sản phẩm nào
//           </h3>
//           <p className="text-gray-500 mb-6">
//             Bắt đầu thêm sản phẩm đầu tiên của bạn
//           </p>
//           <button
//             onClick={addProduct}
//             className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 inline-flex items-center gap-2 shadow-md"
//           >
//             <Plus className="w-5 h-5" />
//             Thêm sản phẩm đầu tiên
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductManager;

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
  Copy,
  Clipboard,
} from "lucide-react";

const ProductManager = ({
  products,
  setProducts,
  productTypes,
  isFormEnabled,
}) => {
  const [selectedWebsites, setSelectedWebsites] = useState({});
  const [collapsedProducts, setCollapsedProducts] = useState({});
  const [copiedProduct, setCopiedProduct] = useState(null);

  const handleToggleCollapse = useCallback((index) => {
    setCollapsedProducts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  // Function để copy thông tin sản phẩm (trừ ảnh)
  const handleCopyProduct = useCallback(
    (index) => {
      const product = products[index];
      const copiedData = {
        productLink: product.productLink,
        quantity: product.quantity,
        priceWeb: product.priceWeb,
        shipWeb: product.shipWeb,
        productName: product.productName,
        purchaseFee: product.purchaseFee,
        extraCharge: product.extraCharge,
        website: product.website,
        productTypeId: product.productTypeId,
        classify: product.classify,
        groupTag: product.groupTag,
        note: product.note,
      };

      setCopiedProduct(copiedData);

      toast.success(`Đã copy thông tin sản phẩm ${index + 1}`, {
        icon: "📋",
        duration: 2000,
      });
    },
    [products]
  );

  // Function để paste thông tin sản phẩm
  const handlePasteProduct = useCallback(
    (index) => {
      if (!copiedProduct) {
        toast.error("Chưa có thông tin để paste!");
        return;
      }

      setProducts((prev) => {
        const updatedProducts = [...prev];
        updatedProducts[index] = {
          ...updatedProducts[index],
          ...copiedProduct,
          // Giữ lại ảnh hiện tại
          purchaseImage: updatedProducts[index].purchaseImage,
        };
        return updatedProducts;
      });

      // KHÔNG set selectedWebsites để giữ nguyên chức năng search
      // Xóa website object nếu có để SearchWebsite hoạt động như input bình thường
      setSelectedWebsites((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

      toast.success(`Đã paste thông tin vào sản phẩm ${index + 1}`, {
        icon: "✅",
        duration: 2000,
      });
    },
    [copiedProduct, setProducts]
  );

  const handleSelectWebsite = useCallback(
    (index, website) => {
      setProducts((prev) => {
        const updatedProducts = [...prev];
        updatedProducts[index].website = website.websiteName || "";
        return updatedProducts;
      });

      setSelectedWebsites((prev) => ({
        ...prev,
        [index]: website,
      }));

      toast.success(`Đã chọn website: ${website.websiteName}`);
    },
    [setProducts]
  );

  const handleClearWebsite = useCallback(
    (index) => {
      setProducts((prev) => {
        const updatedProducts = [...prev];
        updatedProducts[index].website = "";
        return updatedProducts;
      });

      setSelectedWebsites((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

      toast("Đã xóa thông tin website");
    },
    [setProducts]
  );

  const handleWebsiteInputChange = useCallback(
    (index, e) => {
      const value = e.target.value;

      setProducts((prev) => {
        const updatedProducts = [...prev];
        updatedProducts[index].website = value;
        return updatedProducts;
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
    [setProducts, selectedWebsites]
  );

  const formatCurrency = (value) => {
    if (!value || value === "") return "";
    const stringValue = value.toString();
    const parts = stringValue.split(".");
    const integerPart = parts[0].replace(/,/g, "");
    const decimalPart = parts[1];
    if (!/^\d*$/.test(integerPart)) return stringValue;
    const formattedInteger = integerPart
      ? parseInt(integerPart).toLocaleString("en-US")
      : "";
    return decimalPart !== undefined
      ? formattedInteger + "." + decimalPart
      : formattedInteger;
  };

  const getRawValue = (value) => {
    return value.toString().replace(/,/g, "");
  };

  const isValidDecimal = (value) => {
    return /^\d*\.?\d*$/.test(value) || value === "";
  };

  const handleQuantityBlur = useCallback(
    (index) => {
      setProducts((prev) => {
        const updatedProducts = [...prev];
        const currentValue = getRawValue(updatedProducts[index].quantity);

        if (!currentValue || currentValue === "" || currentValue === "0") {
          updatedProducts[index].quantity = "1";
        } else {
          const numValue = parseFloat(currentValue);
          if (!isNaN(numValue) && numValue > 0) {
            updatedProducts[index].quantity = currentValue;
          } else {
            updatedProducts[index].quantity = "1";
          }
        }

        return updatedProducts;
      });
    },
    [setProducts]
  );

  const handleCurrencyBlur = useCallback(
    (index, fieldName) => {
      setProducts((prev) => {
        const updatedProducts = [...prev];
        const currentValue = getRawValue(updatedProducts[index][fieldName]);

        if (currentValue && currentValue !== "") {
          if (fieldName === "purchaseFee") {
            if (currentValue.includes("%")) {
              const numPart = currentValue.replace("%", "");
              const numValue = parseFloat(numPart);
              if (!isNaN(numValue) && numValue >= 0) {
                updatedProducts[index][fieldName] = `${numPart}%`;
              }
            } else {
              const numValue = parseFloat(currentValue);
              if (!isNaN(numValue) && numValue >= 0) {
                updatedProducts[index][fieldName] = currentValue;
              }
            }
          } else {
            const numValue = parseFloat(currentValue);
            if (!isNaN(numValue) && numValue >= 0) {
              updatedProducts[index][fieldName] = currentValue;
            }
          }
        }

        return updatedProducts;
      });
    },
    [setProducts]
  );

  const handleProductChange = useCallback(
    (index, e) => {
      const { name, value } = e.target;
      setProducts((prev) => {
        const updatedProducts = [...prev];

        if (name === "productTypeId") {
          const productTypeId = Number(value);
          const productType = productTypes.find(
            (p) => p.productTypeId === productTypeId
          );
          updatedProducts[index] = {
            ...updatedProducts[index],
            [name]: productTypeId,
            extraCharge: productType?.fee
              ? updatedProducts[index].extraCharge
              : "0",
          };
        } else {
          if (["priceWeb", "shipWeb", "extraCharge"].includes(name)) {
            const cleanValue = getRawValue(value);
            if (isValidDecimal(cleanValue)) {
              updatedProducts[index][name] = cleanValue;
            }
          } else if (name === "purchaseFee") {
            let cleanValue = getRawValue(value);
            if (/^\d*\.?\d*%?$/.test(cleanValue) || cleanValue === "") {
              updatedProducts[index][name] = cleanValue;
            }
          } else if (name === "quantity") {
            const cleanValue = getRawValue(value);
            if (cleanValue === "") {
              updatedProducts[index][name] = "";
            } else if (isValidDecimal(cleanValue)) {
              if (
                cleanValue.startsWith("0") &&
                !cleanValue.startsWith("0.") &&
                cleanValue.length > 1
              ) {
                const withoutLeadingZeros = cleanValue.replace(/^0+/, "");
                updatedProducts[index][name] = withoutLeadingZeros || "0";
              } else {
                const numericValue = parseFloat(cleanValue);
                if (!isNaN(numericValue) && numericValue > 0) {
                  updatedProducts[index][name] = cleanValue;
                } else if (cleanValue.endsWith(".")) {
                  updatedProducts[index][name] = cleanValue;
                }
              }
            }
          } else {
            updatedProducts[index][name] = value;
          }
        }

        return updatedProducts;
      });
    },
    [productTypes, setProducts]
  );

  const handleImageUpload = useCallback(
    (index, imageUrl) => {
      setProducts((prev) => {
        const updatedProducts = [...prev];
        updatedProducts[index].purchaseImage = imageUrl;
        return updatedProducts;
      });
      toast.success(`Upload ảnh sản phẩm ${index + 1} thành công!`);
    },
    [setProducts]
  );

  const handleImageRemove = useCallback(
    (index) => {
      setProducts((prev) => {
        const updatedProducts = [...prev];
        updatedProducts[index].purchaseImage = "";
        return updatedProducts;
      });
      toast.success("Đã xóa ảnh sản phẩm thành công");
    },
    [setProducts]
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
        productTypeId: "",
        classify: "",
        groupTag: "",
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
          const oldIndex = parseInt(key);
          if (oldIndex < index) {
            updated[oldIndex] = prev[key];
          } else if (oldIndex > index) {
            updated[oldIndex - 1] = prev[key];
          }
        });
        return updated;
      });

      setCollapsedProducts((prev) => {
        const updated = {};
        Object.keys(prev).forEach((key) => {
          const oldIndex = parseInt(key);
          if (oldIndex < index) {
            updated[oldIndex] = prev[key];
          } else if (oldIndex > index) {
            updated[oldIndex - 1] = prev[key];
          }
        });
        return updated;
      });

      toast.success("Đã xóa sản phẩm");
    },
    [setProducts]
  );

  const shouldAutoCollapse = (index) => {
    return products.length >= 3 && index < products.length - 1;
  };

  const isCollapsed = (index) => {
    if (shouldAutoCollapse(index)) {
      return collapsedProducts[index] !== false;
    }
    return collapsedProducts[index] === true;
  };

  return (
    <div className="w-full">
      {/* Header Section - Compact */}
      <div className="bg-gray-100 shadow-sm p-3 mb-4 border-b border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Tổng số sản phẩm:{" "}
              <span className="font-semibold text-blue-600">
                {products.length}
              </span>
              {copiedProduct && (
                <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                  📋 Đã copy 1 sản phẩm
                </span>
              )}
            </p>
          </div>
          <button
            onClick={addProduct}
            className="bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            disabled={!isFormEnabled}
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 hide-scrollbar">
        {products.map((product, index) => {
          const collapsed = isCollapsed(index);
          const productType = productTypes.find(
            (p) => p.productTypeId === product.productTypeId
          );

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              {/* Product Header - Compact */}
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
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200">
                              {product.website}
                            </span>
                          )}
                          {productType && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                productType.fee
                                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                                  : "bg-green-100 text-green-700 border border-green-200"
                              }`}
                            >
                              {productType.productTypeName}
                            </span>
                          )}
                          {product.quantity && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">
                              SL: {formatCurrency(product.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-base">
                          {product.productName || "Sản phẩm mới"}
                        </h3>
                        {/* Nút Copy và Paste */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyProduct(index)}
                            className="px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 border border-purple-200 transition-colors text-xs font-medium flex items-center gap-1"
                            disabled={!isFormEnabled}
                            title="Copy thông tin sản phẩm này"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </button>
                          <button
                            onClick={() => handlePasteProduct(index)}
                            className={`px-2 py-1 rounded border transition-colors text-xs font-medium flex items-center gap-1 ${
                              copiedProduct
                                ? "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                                : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                            }`}
                            disabled={!isFormEnabled || !copiedProduct}
                            title={
                              copiedProduct
                                ? "Paste thông tin đã copy"
                                : "Chưa có thông tin để paste"
                            }
                          >
                            <Clipboard className="w-3.5 h-3.5" />
                            Paste
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(shouldAutoCollapse(index) ||
                      collapsedProducts[index] !== undefined) && (
                      <button
                        onClick={() => handleToggleCollapse(index)}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        title={collapsed ? "Mở rộng" : "Thu gọn"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                            collapsed ? "" : "rotate-180"
                          }`}
                        />
                      </button>
                    )}
                    {index > 0 && (
                      <button
                        onClick={() => removeProduct(index)}
                        className="px-2 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200 transition-colors text-xs font-medium flex items-center gap-1"
                        disabled={!isFormEnabled}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              {!collapsed && (
                <div className="p-6 space-y-4">
                  {/* Tên sản phẩm, Số lượng, Website */}
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
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={!isFormEnabled}
                        placeholder="0"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-purple-500" />
                      Link sản phẩm
                    </label>
                    <input
                      type="text"
                      name="productLink"
                      value={product.productLink}
                      onChange={(e) => handleProductChange(index, e)}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={!isFormEnabled}
                      placeholder="https://..."
                    />
                  </div>

                  {/* Giá sản phẩm, Phí ship, Phí mua, Group Tag */}
                  <div className="grid grid-cols-12 gap-4">
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
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={!isFormEnabled}
                        placeholder="000000"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phí ship Website <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="shipWeb"
                        value={formatCurrency(product.shipWeb || "")}
                        onChange={(e) => handleProductChange(index, e)}
                        onBlur={() => handleCurrencyBlur(index, "shipWeb")}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={!isFormEnabled}
                        placeholder="000000"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phí mua
                      </label>
                      <input
                        type="text"
                        name="purchaseFee"
                        value={product.purchaseFee || ""}
                        onChange={(e) => handleProductChange(index, e)}
                        onBlur={() => handleCurrencyBlur(index, "purchaseFee")}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={!isFormEnabled}
                        placeholder="%"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shop
                      </label>
                      <input
                        type="text"
                        name="groupTag"
                        value={product.groupTag}
                        onChange={(e) => handleProductChange(index, e)}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={!isFormEnabled}
                        placeholder="Tên shop..."
                      />
                    </div>
                  </div>

                  {/* Loại sản phẩm và Phụ phí */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="productTypeId"
                        value={product.productTypeId}
                        onChange={(e) => handleProductChange(index, e)}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          disabled={!isFormEnabled}
                          placeholder="00000"
                        />
                      ) : (
                        <div className="w-full px-4 py-2 text-sm border border-gray-200 rounded bg-green-50 text-green-600 font-medium flex items-center justify-center">
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
                        onBlur={() => handleCurrencyBlur(index, "classify")}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={!isFormEnabled}
                        placeholder="Phân loại..."
                      />
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-yellow-500" />
                      Ghi chú bổ sung
                    </label>
                    <textarea
                      name="note"
                      value={product.note}
                      onChange={(e) => handleProductChange(index, e)}
                      rows="3"
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      disabled={!isFormEnabled}
                      placeholder="Ghi chú cho sản phẩm này (tùy chọn)..."
                    />
                  </div>

                  {/* Hình ảnh sản phẩm - Phía dưới */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4 text-purple-500" />
                      Hình ảnh sản phẩm
                    </label>
                    <UploadImg
                      imageUrl={product.purchaseImage}
                      onImageUpload={(imageUrl) =>
                        handleImageUpload(index, imageUrl)
                      }
                      onImageRemove={() => handleImageRemove(index)}
                      label=""
                      maxSizeMB={3}
                      placeholder="Chưa có ảnh sản phẩm"
                      className=""
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
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
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 inline-flex items-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5" />
            Thêm sản phẩm đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
