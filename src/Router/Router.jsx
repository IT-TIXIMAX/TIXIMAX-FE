// src/Router/Router.jsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";
// import { createHashRouter } from "react-router-dom";
import Layout from "../Page/Layout";
import SignIn from "../Page/SignIn";
import SignUp from "../Page/SignUp";
import ForgotPassword from "../Page/ForgotPassword";

// Customer components
import Home from "../Page/Home";

//Admin compoenents
import AdminLayout from "../components/Admin/AdminLayout";
import AdminPage from "../components/Admin/AdminPage";
import AdminDashboard from "../components/Admin/AdminDashboard";
import ShipmentTracking from "../components/Admin/ShipmentTracking";
import InventoryList from "../components/Admin/InventoryList";
// import RevenueDashboard from "../components/Admin/RevenueDashboard";
import TrackingOrder from "../components/Admin/TrackingOrder";
import EmployeeKPI from "../components/Admin/EmployeeKPI";
import ProfitLoss from "../components/Admin/ProfitLoss";

//LeadSale components
import LeadSaleLayout from "../components/LeadSale/LeadSaleLayout";
import LeadSalePage from "../components/LeadSale/LeadSalePage";
import DashboardLeadSale from "../components/LeadSale/DashboardLeadSale";

import SearchWebsite from "../components/Order/SearchWebsite";

//StaffWarehouseForeign components
import StaffWarehouseForeignLayout from "../components/WarehouseForeign/StaffWarehouseForeignLayout";
// import StaffWarehouseForeignPage from "../components/WarehouseForeign/StaffWarehouseForeignPage";

//StaffWarehouseDomestic components
import StaffWarehouseDomesticLayout from "../components/WarehouseDomestic/StaffWarehouseDomesticLayout";
import StaffWarehouseDomesticPage from "../components/WarehouseDomestic/StaffWarehouseDomesticPage";

//Manager components
import ManagerPage from "../components/Manager/ManagerPage";
import ManagerDashboard from "../components/Manager/ManagerDashboard";

//StaffSale components
// import StaffSalePage from "../components/StaffSale/StaffSalePage";
import StaffSaleLayout from "../components/StaffSale/StaffSaleLayout";
import Tracking from "../components/StaffSale/Tracking";

//StaffPurchaser components
import StaffPurchaserPage from "../components/StaffPurchaser/StaffPurchaserPage";
import StaffPurchaserLayout from "../components/StaffPurchaser/StaffPurchaserLayout";

//Manager components
import ManagerLayout from "../components/Manager/ManagerLayout";
import ManagerRoutes from "../components/Manager/ManagerRoutes";
import ManagerDestination from "../components/Manager/ManagerDestination";
import ManagerProductType from "../components/Manager/ManagerProductType";

//Protected Route
import ProtectedRoute from "../Router/ProtectedRoute";
import { ROLES } from "../Services/Auth/authService";
import ManagerOrder from "../components/Manager/ManagerOrder";
import NotFound from "../Page/NotFound";
import CreateAccountUser from "../components/StaffSale/CreateAccountUser";
import ProfilePage from "../Page/ProfilePage";
import OrderLinkList from "../components/StaffPurchaser/OrderLinkList";
import CreateAccountStaff from "../components/Admin/CreateAccountStaff";
import AccountSearch from "../components/Order/AccountSearch";
import CreateOrderForm from "../components/Order/CreateOrderForm";
import ManagerWebsite from "../components/Manager/ManagerWebsite";
import WarehouseShipment from "../components/WarehouseForeign/WarehouseShipment";
import WarehouseList from "../components/WarehouseForeign/WarehouseList";
import CreatePacking from "../components/WarehouseForeign/CreatePacking";
import PackingEligibleList from "../components/WarehouseForeign/PackingEligibleList";
import PackingAwaitList from "../components/WarehouseForeign/PackingAwaitList";
import OrderList from "../components/Order/OrderList";
import StaffList from "../components/Manager/StaffList";
import CustomerList from "../components/Manager/CustomerList";
import CustomerStaffList from "../components/StaffSale/CustomerStaffList";
import Permission from "../components/Admin/Permission";
import StaffListPermission from "../components/Manager/StaffListPermission";
import PackingFlyingList from "../components/WarehouseDomestic/PackingFlyingList";
// import ExportList from "../components/WarehouseDomestic/ExportList";
import CreateDepositForm from "../components/Order/CreateDepositForm";
import MergedPaymentShip from "../components/PaymentOrder/MergedPaymentShip";
import MergedPaymentOrder from "../components/PaymentOrder/MergedPaymentOrder";
import PaymentOrderList from "../components/PaymentOrder/PaymentOrderList";
import CreateAuctionForm from "../components/Order/CreateAuctionForm";
import OrderAuctionList from "../components/StaffPurchaser/OrderAuctionList";
import AuctionPayment from "../components/PaymentOrder/AuctionPayment";
import ManagerTeam from "../components/LeadSale/ManagerTeam";
import AuthCallback from "../Services/Auth/AuthCallback";
import DashboardPurchase from "../components/StaffPurchaser/DashboardPurchase";
import DashboardWarehouse from "../components/WarehouseDomestic/DashboardWarehouse";
import StaffProfile from "../components/common/StaffProfile";
import ManagerPromotion from "../components/Manager/ManagerPromotion";
import ResetPassword from "../Page/ResetPassword";
import InventoryWarehouse from "../Services/Warehouse/InventoryWarehouse";
import RefundOrder from "../components/Order/RefundOrder";
import ManagerBankAccountList from "../components/Manager/ManagerBankAccountList";
import DividePaymentOrder from "../components/PaymentOrder/DividePaymentOrder";
import UpdateShipmentCodeList from "../components/StaffPurchaser/UpdateShipmentCodeList";
// import RemoveShipment from "../components/WarehouseForeign/RemoveShipment";
import PackingProblem from "../components/WarehouseForeign/PackingProblem";
import DenyRoles from "./DenyRoles";
// import PerformanceStaff from "../components/StaffSale/PerformanceStaff";
import DashboardSale from "../components/StaffSale/DashboardSale";
// import PerformnanceMy from "../components/StaffSale/PerformanceMy";
import AboutUs from "../Page/Navigattion/AboutUs";
import ServiceAuction from "../Page/Navigattion/ServiceAuction";
import ServicesStorage from "../Page/Navigattion/ServicesStorage";
import New from "../Page/Navigattion/New";
import Contact from "../Page/Navigattion/Contact";
import ServicesShipping from "../Page/Navigattion/ServicesShipping";
import ServicesPurchase from "../Page/Navigattion/ServicesPurchase";
import ServicesCustoms from "../Page/Navigattion/ServicesCustoms";
import GuideOrder from "../Page/Navigattion/GuideOrder";
import GuideTracking from "../Page/Navigattion/GuideTracking";
import OrderHistory from "../Page/Navigattion/OrderHistory";
import ServiceList from "../Page/Navigattion/ServiceList";
import GuideList from "../Page/Navigattion/GuideList";
import PurchaserList from "../components/StaffPurchaser/PurchaserList";
import TrackingCodeList from "../components/WarehouseDomestic/TrackingCodeList";
import ListOrderManager from "../components/Order/ListOrderManager";
import UpdateShipmentCodeAuctionList from "../components/StaffPurchaser/UpdateShipmentCodeAuctionList";
import DashboardManager from "../components/Manager/DashboardManager";
import CreatePackingJapan from "../components/WarehouseForeign/CreatePackingJapan";
import PolicyPage from "../Page/Navigattion/PolicyPage";
import SecurityPage from "../Page/Navigattion/SecurityPage";
import CareerPage from "../Page/Navigattion/CareerPage";
import Question from "../Page/Navigattion/Question";
import RelateOrder from "../components/Order/RelateOrder";
import WarehouseDomestic from "../components/WarehouseDomestic/WarehouseDomestic";
import OrderListCancel from "../components/Manager/OrderListCancel";
import PendingReceive from "../components/WarehouseForeign/PendingReceive";
import DashboardOrder from "../components/Admin/DashboardOrder";
import DashboardWarehouseA from "../components/Admin/DashboardWarehouseA";
import DashboardPayment from "../components/Admin/DashboardPayment";
import DashboardCustomer from "../components/Admin/DashboardCustomer";
import DashboardManagerProfit from "../components/Manager/DashboardManagerProfit";
import ExchangeOrderForm from "../components/Order/ExchangeOrderForm";
import ExchanegMoneyList from "../components/StaffPurchaser/ExchangeMoneyList";
import WarehouseJapan from "../components/WarehouseForeign/WarehouseJapan";
import SummaryOrder from "../components/Manager/Summary/SummaryOrder";
import SummaryCustomer from "../components/Manager/Summary/SummaryCustomer";
import SummaryRevenue from "../components/Manager/Summary/SummaryRevenue";
import SummaryWeight from "../components/Manager/Summary/SummaryWeight";
import ManagerRouteExchange from "../components/Manager/ManagerRouteExchange";
import ImportDomesticPacking from "../components/WarehouseDomestic/ImportDomesticPacking";
import ScanImportWarehouse from "../components/WarehouseDomestic/ScanImportWarehouse";
import ExportWarehouse from "../components/WarehouseDomestic/ExportWarehouse";
import DashboardKPI from "../components/Manager/DashboardKPI";
import PendingWarehouse from "../components/WarehouseDomestic/PendingWarehouse";
import ExportWarehouseShip from "../components/WarehouseDomestic/ExportWarehouseShip";
import OrderWarehouse from "../components/StaffSale/OrderWarehouse";
import OrderShippingAddress from "../components/Warehouse/OrderShippingAddress";
import ShippingAddressList from "../components/Warehouse/ShippingAddressList";
import ExportWarehouseShipList from "../components/Warehouse/ExportWarehouseShipList";
import DashboadStaffPerformance from "../components/Dashboard/Staff/DashboadStaffPerformance";
import LockedDraftsList from "../components/Warehouse/LockedDraftsList";
const Router = createBrowserRouter([
  // const Router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: (
          <DenyRoles
            denied={[
              ROLES.ADMIN,
              ROLES.MANAGER,
              ROLES.LEAD_SALE,
              ROLES.STAFF_SALE,
              ROLES.STAFF_PURCHASER,
              ROLES.STAFF_WAREHOUSE_FOREIGN,
              ROLES.STAFF_WAREHOUSE_DOMESTIC,
            ]}
          >
            <Home />
          </DenyRoles>
        ),
      },
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "/about", element: <AboutUs /> },
      { path: "services", element: <ServiceList /> },
      { path: "/services/auction", element: <ServiceAuction /> },
      { path: "/services/storage", element: <ServicesStorage /> },
      { path: "/services/purchase", element: <ServicesPurchase /> },
      { path: "/services/shipping", element: <ServicesShipping /> },
      { path: "/services/customs", element: <ServicesCustoms /> },
      { path: "/guide", element: <GuideList /> },
      { path: "/guide/order", element: <GuideOrder /> },
      { path: "/guide/tracking", element: <GuideTracking /> },
      { path: "/contact", element: <Contact /> },
      { path: "/news", element: <New /> },
      { path: "/tracking", element: <GuideTracking /> },
      { path: "order-history", element: <OrderHistory /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/auth/callback", element: <AuthCallback /> },
      { path: "/policies", element: <PolicyPage /> },
      { path: "/security", element: <SecurityPage /> },
      { path: "/qa", element: <Question /> },
      { path: "/careers", element: <CareerPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminPage /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "orders", element: <NotFound /> },
      { path: "order-analytics", element: <DashboardOrder /> },
      { path: "payment-analytics", element: <DashboardPayment /> },
      { path: "warehouse-analytics", element: <DashboardWarehouseA /> },
      { path: "products", element: <NotFound /> },
      { path: "staff", element: <Permission /> },
      { path: "customers", element: <NotFound /> },
      { path: "settings", element: <CreateAccountStaff /> },
      { path: "revenue-analytics", element: <DashboardCustomer /> }, // Chua tien khai
      // { path: "revenue-analytics", element: <RevenueDashboard /> }, // Chua tien khai
      { path: "order-status-overview", element: <TrackingOrder /> },
      { path: "profit-loss", element: <ProfitLoss /> },
      { path: "employee-kpi", element: <EmployeeKPI /> },
      { path: "pending-deliveries", element: <NotFound /> },
      { path: "shipment-tracking", element: <ShipmentTracking /> }, // Chưa triển khai
      { path: "route-planning", element: <NotFound /> },
      { path: "drivers", element: <NotFound /> },
      { path: "vehicles", element: <NotFound /> },
      { path: "inventory", element: <InventoryList /> }, // Chưa triển khai
      { path: "warehouse-transactions", element: <NotFound /> },
      { path: "warehouse-locations", element: <NotFound /> },
      { path: "inventory-reports", element: <NotFound /> },
      { path: "orders/create", element: <NotFound /> },
      { path: "order-processing", element: <NotFound /> },
      { path: "customer-support", element: <NotFound /> },
      { path: "order-history", element: <NotFound /> },
      { path: "work-schedule", element: <NotFound /> },
      { path: "employee-performance", element: <NotFound /> },
      { path: "user-permissions", element: <NotFound /> },
      { path: "financial-overview", element: <NotFound /> },
      { path: "cod-payments", element: <NotFound /> },
      { path: "customer-debts", element: <NotFound /> },
      { path: "financial-reports", element: <NotFound /> },
      { path: "delivery-performance", element: <NotFound /> },
      { path: "fuel-analysis", element: <NotFound /> },
      { path: "maintenance-costs", element: <NotFound /> },
      { path: "top-customers", element: <NotFound /> },
      { path: "shipping-trends", element: <NotFound /> },
    ],
  },
  {
    path: "/manager",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.MANAGER]}>
        <ManagerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ManagerPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "team", element: <StaffList /> },
      { path: "customers", element: <CustomerList /> },
      { path: "kpistaff", element: <DashboardKPI /> },
      { path: "dashboardprofit", element: <DashboardManagerProfit /> },
      { path: "permission", element: <Permission /> },
      { path: "stafflead", element: <StaffListPermission /> },
      { path: "createstaff", element: <CreateAccountStaff /> },
      { path: "quote", element: <PaymentOrderList /> },
      { path: "refund", element: <RefundOrder /> },
      { path: "cost/paylater", element: <ManagerBankAccountList /> },
      { path: "cost/paybefore", element: <ManagerDashboard /> },
      { path: "routes", element: <ManagerRoutes /> },
      { path: "transfer", element: <ManagerDestination /> },
      { path: "dashboard", element: <DashboardManager /> },
      { path: "dashboard/order", element: <SummaryOrder /> },
      { path: "dashboard/customer", element: <SummaryCustomer /> },
      { path: "dashboard/revenue", element: <SummaryRevenue /> },
      { path: "dashboard/weight", element: <SummaryWeight /> },
      { path: "producttype", element: <ManagerProductType /> },
      { path: "order", element: <ManagerOrder /> },
      { path: "cancelorder", element: <OrderListCancel /> },
      { path: "website", element: <ManagerWebsite /> },
      { path: "promotion", element: <ManagerPromotion /> },
      { path: "notifications", element: <NotFound /> },
      { path: "exchange-routes", element: <ManagerRouteExchange /> },
    ],
  },
  {
    path: "/lead-sale",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.LEAD_SALE]}>
        <LeadSaleLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LeadSalePage />,
      },
      { path: "profile", element: <StaffProfile /> },
      { path: "createorder", element: <CreateOrderForm /> },
      { path: "deposit", element: <CreateDepositForm /> },
      { path: "auction", element: <CreateAuctionForm /> },
      { path: "exchange-order", element: <ExchangeOrderForm /> },
      { path: "createaccountuser", element: <CreateAccountUser /> },
      { path: "prospects", element: <NotFound /> },
      { path: "dashboard", element: <DashboardLeadSale /> },
      { path: "team", element: <ManagerTeam /> },
      { path: "salesreport", element: <DashboardSale /> },
      { path: "team-performance", element: <NotFound /> },
      { path: "customers", element: <CustomerStaffList /> },
      { path: "orders", element: <OrderList /> },
      { path: "/lead-sale/shipping/domestic", element: <RelateOrder /> },
      { path: "/lead-sale/shipping/international", element: <NotFound /> },
      { path: "tracking", element: <NotFound /> },
      { path: "orders/tracking", element: <ManagerOrder /> },
      // { path: "comfirm-payment", element: <PaymentOrderList /> },
      { path: "order-payment", element: <ListOrderManager /> },
      // { path: "ship-payment", element: <PaymentShipList /> },
      { path: "auction-payment", element: <AuctionPayment /> },
      { path: "divide-payment", element: <DividePaymentOrder /> },
      { path: "createpaymentsupport", element: <MergedPaymentOrder /> },
      { path: "createpaymentshipping", element: <MergedPaymentShip /> },
      { path: "warehouse-staff", element: <NotFound /> },
      { path: "sales-staff", element: <NotFound /> },
      { path: "schedule", element: <DashboardSale /> },
      { path: "destination", element: <NotFound /> },
      { path: "campaigns", element: <SearchWebsite /> },
      { path: "camp", element: <AccountSearch /> },
    ],
  },
  {
    path: "/staff-sale",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.STAFF_SALE]}>
        <StaffSaleLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <StaffProfile />,
      },
      { path: "profile", element: <StaffProfile /> },
      { path: "create-invoice", element: <CreateOrderForm /> },
      { path: "quotations", element: <PaymentOrderList /> },
      { path: "deposit", element: <CreateDepositForm /> },
      { path: "auction", element: <CreateAuctionForm /> },
      { path: "exchange-order", element: <ExchangeOrderForm /> },
      // { path: "comfirm-payment", element: <PaymentOrderList /> },
      { path: "order-payment-list", element: <ListOrderManager /> },
      // { path: "ship-payment", element: <PaymentShipList /> },
      { path: "payments-orders", element: <MergedPaymentOrder /> },
      { path: "payments-ship", element: <MergedPaymentShip /> },
      { path: "payments-auction", element: <AuctionPayment /> },
      { path: "payments-divide", element: <DividePaymentOrder /> },
      { path: "status-orders", element: <ManagerOrder /> },
      { path: "create-customer", element: <CreateAccountUser /> },
      { path: "list-customers", element: <CustomerStaffList /> },
      { path: "add-shipping-order", element: <RelateOrder /> },
      { path: "prospects", element: <NotFound /> },
      { path: "list-orders", element: <OrderList /> },
      { path: "orders/pending", element: <NotFound /> }, // Chưa triển khai
      { path: "tracking", element: <Tracking /> }, // Chưa triển khai
      { path: "warehouses", element: <OrderWarehouse /> }, // Chưa triển khai
      { path: "confirm-shipping", element: <OrderShippingAddress /> },
      { path: "list-order-shipping", element: <ShippingAddressList /> },
      { path: "shipping-history", element: <NotFound /> },
      { path: "telesale", element: <NotFound /> },
      { path: "knowledge", element: <NotFound /> }, // Chưa triển khai
      { path: "schedule", element: <NotFound /> }, // Chưa triển khai
      { path: "dashboard", element: <DashboardSale /> },
      { path: "performance", element: <DashboadStaffPerformance /> },
    ],
  },
  {
    path: "/staff-purchaser",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.STAFF_PURCHASER]}>
        <StaffPurchaserLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <StaffPurchaserPage />,
      },
      { path: "profile", element: <StaffProfile /> },
      { path: "dashboard", element: <DashboardPurchase /> },
      { path: "exchange-money", element: <ExchanegMoneyList /> },
      { path: "orders", element: <OrderLinkList /> },
      { path: "auction", element: <OrderAuctionList /> },
      { path: "inventory", element: <UpdateShipmentCodeList /> },
      { path: "auction-inventory", element: <UpdateShipmentCodeAuctionList /> },
      { path: "inventorystock", element: <PurchaserList /> },
      { path: "inventory/audit", element: <NotFound /> },
    ],
  },
  {
    path: "/staff-warehouse-foreign",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.STAFF_WAREHOUSE_FOREIGN]}>
        <StaffWarehouseForeignLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardWarehouse /> },
      { path: "profile", element: <StaffProfile /> },
      // { path: "dashboard", element: <DashboardWarehouse /> },
      { path: "dashboard", element: <PendingReceive /> },
      { path: "warehouse", element: <WarehouseList /> },
      { path: "importproduct", element: <NotFound /> },
      { path: "imports", element: <WarehouseShipment /> },
      { path: "packings", element: <CreatePacking /> },
      { path: "outbound/packingeligible", element: <PackingEligibleList /> },
      { path: "outbound/packingawaiting", element: <PackingAwaitList /> },
      { path: "outbound/orders", element: <NotFound /> },
      { path: "outbound/packinginwarehouse", element: <NotFound /> },
      { path: "stock/serial", element: <NotFound /> },
      { path: "stock/location", element: <PackingProblem /> },
      { path: "audit/check", element: <NotFound /> },
      { path: "audit/reconcile", element: <NotFound /> },
      { path: "reports/dashboard", element: <CreatePackingJapan /> },
      { path: "reports/performances", element: <WarehouseJapan /> },
      { path: "export", element: <NotFound /> },
    ],
  },
  {
    path: "/staff-warehouse-domestic",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.STAFF_WAREHOUSE_DOMESTIC]}>
        <StaffWarehouseDomesticLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <StaffWarehouseDomesticPage /> },
      { path: "profile", element: <StaffProfile /> },
      { path: "dashboard", element: <DashboardWarehouse /> },
      { path: "inventory", element: <WarehouseDomestic /> },
      { path: "imports", element: <PackingFlyingList /> },
      { path: "pending-payments", element: <PendingWarehouse /> },
      { path: "eligible-exports", element: <ExportWarehouseShip /> },
      { path: "exports", element: <ExportWarehouse /> },
      { path: "order-export", element: <ExportWarehouseShipList /> },
      { path: "check", element: <ScanImportWarehouse /> },
      { path: "report", element: <TrackingCodeList /> },
      { path: "reports-vnpost", element: <LockedDraftsList /> },
      { path: "importsjp", element: <ImportDomesticPacking /> },
      { path: "inventorys-check", element: <InventoryWarehouse /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default Router;
