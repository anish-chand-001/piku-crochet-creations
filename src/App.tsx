import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import GoogleCallback from "./pages/auth/GoogleCallback";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useGsapAnimations } from "./hooks/useGsapAnimations";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { UserAuthProvider } from "./contexts/UserAuthContext";
import UserProtectedRoute from "./components/UserProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLogin from "./pages/admin/Login";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminSettings from "./pages/admin/Settings";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import { ADMIN_BASE_PATH } from "./config/admin";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

const AppShell = () => {
  useSmoothScroll();
  useGsapAnimations();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith(ADMIN_BASE_PATH);

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />

        {/* Protected user routes */}
        <Route path="/cart" element={<UserProtectedRoute><Cart /></UserProtectedRoute>} />
        <Route path="/checkout" element={<UserProtectedRoute><Checkout /></UserProtectedRoute>} />
        <Route path="/orders" element={<UserProtectedRoute><Orders /></UserProtectedRoute>} />

        {/* Admin auth routes */}
        <Route path={`${ADMIN_BASE_PATH}/login`} element={<AdminLogin />} />
        <Route path={`${ADMIN_BASE_PATH}/forgot-password`} element={<ForgotPassword />} />
        <Route path={`${ADMIN_BASE_PATH}/reset-password/:token`} element={<ResetPassword />} />

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path={`${ADMIN_BASE_PATH}/dashboard`} element={<AdminDashboard />} />
          <Route path={`${ADMIN_BASE_PATH}/products`} element={<AdminProducts />} />
          <Route path={`${ADMIN_BASE_PATH}/categories`} element={<AdminCategories />} />
          <Route path={`${ADMIN_BASE_PATH}/orders`} element={<AdminOrders />} />
          <Route path={`${ADMIN_BASE_PATH}/users`} element={<AdminUsers />} />
          <Route path={`${ADMIN_BASE_PATH}/settings`} element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <UserAuthProvider>
            <AppShell />
          </UserAuthProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
