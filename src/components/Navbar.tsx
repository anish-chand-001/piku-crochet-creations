import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User, LogOut, Package, Heart } from "lucide-react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config/api";
import { toast } from "sonner";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Creations", path: "/products" },
  { name: "About", path: "/#about" },
  { name: "Custom Order", path: "/#custom" },
  { name: "FAQs", path: "/faq" },
  { name: "Contact", path: "/#contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Cart item count — only fetched when user is logged in
  const { data: cartData } = useQuery({
    queryKey: ['cartCount'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/cart`, { credentials: 'include' });
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 30000
  });

  const cartCount: number = cartData?.items?.length || 0;

  const handleNavClick = (path: string) => {
    if (path.startsWith("/#") && location.pathname === "/") {
      const id = path.replace("/#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    navigate("/");
    setUserMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-[#FDF8F2]/95 backdrop-blur-xl shadow-soft py-2"
        : "bg-[#FDF8F2] py-3"
        }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-12 relative">
        {/* Left: Logo */}
        <div className="flex justify-start z-50">
          <Link to="/" className="group relative block">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-[3px] border-[#FDF8F2] shadow-sm overflow-hidden bg-white transition-transform duration-300 group-hover:scale-105">
              <img src="/piku-logo.png" alt="Piku Crochet Logo" className="h-full w-full object-cover" />
            </div>
          </Link>
        </div>

        {/* Center: Desktop Nav links */}
        <div className="hidden items-center justify-center gap-5 lg:gap-8 md:flex absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => handleNavClick(link.path)}
              className="group relative font-body text-sm lg:text-base font-medium tracking-wide text-stone-700 transition-colors hover:text-[#E87EA1]"
            >
              {link.name}
              <span className="absolute -bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-[#E87EA1] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right: Cart + User */}
        <div className="hidden md:flex items-center gap-3 z-50">
          {/* Wishlist icon */}
          {isAuthenticated && (
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full text-stone-600 hover:bg-stone-100 hover:text-[#E87EA1] transition-all"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>
          )}

          {/* Cart icon */}
          <Link
            to={isAuthenticated ? "/cart" : "/login"}
            className="relative p-2.5 rounded-full text-stone-600 hover:bg-stone-100 hover:text-[#E87EA1] transition-all"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAuthenticated && cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-stone-700 hover:bg-stone-100 transition-all font-body text-sm font-medium"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-body text-xs text-gray-400">Signed in as</p>
                      <p className="font-body text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-body text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-body text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm shadow-primary/20"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile: Cart + Toggle */}
        <div className="flex md:hidden items-center gap-2 z-50">
          {isAuthenticated && (
            <Link
              to="/wishlist"
              className="relative p-2 rounded-full text-stone-600 hover:bg-stone-100 transition-all"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>
          )}
          <Link
            to={isAuthenticated ? "/cart" : "/login"}
            className="relative p-2 rounded-full text-stone-600 hover:bg-stone-100 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAuthenticated && cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-50 rounded-full p-2 text-stone-600 transition-colors hover:bg-stone-100"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-[#FDF8F2]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-6 pt-16">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className="block rounded-lg px-4 py-3 font-body text-lg font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-[#E87EA1]"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
                {isAuthenticated ? (
                  <>
                    <Link to="/orders" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 font-body text-base font-medium text-stone-700 hover:bg-stone-100">
                      My Orders
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left rounded-lg px-4 py-3 font-body text-base font-medium text-red-600 hover:bg-red-50">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 font-body text-base font-semibold text-primary hover:bg-primary/5">
                    Sign In / Create Account
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
