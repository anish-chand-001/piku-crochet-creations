import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { LayoutDashboard, Package, Tags, LogOut, Loader2, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const AdminLayout = () => {
    const { isAuthenticated, isLoading, logout } = useAdminAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    const links = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: Tags },
        { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
    ];

    const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
        <>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname.startsWith(link.path);
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={onLinkClick}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </Button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-100/50">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b">
                    <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
                </div>
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col shadow-xl transition-transform duration-300 md:hidden",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b">
                    <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <SidebarContent onLinkClick={() => setIsMobileMenuOpen(false)} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Mobile Top Header */}
                <header className="md:hidden h-14 bg-white border-b flex items-center px-4 gap-3 shrink-0">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-primary">Admin Panel</h2>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
