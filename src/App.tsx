import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useGsapAnimations } from "./hooks/useGsapAnimations";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppShell = () => {
  useSmoothScroll();
  useGsapAnimations();

  return (
    <>
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
