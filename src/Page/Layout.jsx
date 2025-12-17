import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Banner from "../components/Customer/Banner";

function Layout() {
  const { pathname } = useLocation();

  // Những path không hiển thị Header/Footer
  const hiddenPaths = new Set([
    "/signin",
    "/signup",
    "/forgot-password",
    "/verification",
    "/reset-password",
  ]);

  const hideHeaderFooter = hiddenPaths.has(pathname);

  return (
    <>
      {!hideHeaderFooter && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white m-0 p-0">
          <Banner />
          <Header />
        </div>
      )}

      <main
        className={`min-h-screen pb-12 m-0 ${!hideHeaderFooter ? "pt-32" : ""}`}
      >
        <Outlet />
      </main>

      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default Layout;
