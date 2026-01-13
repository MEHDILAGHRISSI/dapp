import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Menu,
    X,
    Wallet,
    Home,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '@/components/Logo';

const AdminNavbar: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = user?.roles?.includes('ADMIN');

    const navItems = [
        {
            title: 'Tableau de bord',
            path: '/admin/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Propriétés',
            path: '/admin/properties',
            icon: Home,
            hidden: !isAdmin,
        },
        {
            title: 'Gestion Agents',
            path: '/admin/agents',
            icon: Users,
            hidden: !isAdmin,
        },
    ];

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    return (
        <header className="sticky top-0 z-50 bg-navy-deep px-6 py-5 lg:px-10">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <Logo size="md" />
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
                    {navItems.map(
                        (item) =>
                            !item.hidden && (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `transition-all duration-300 relative ${isActive
                                            ? 'text-white'
                                            : 'text-gray-300 hover:text-white'
                                        }`
                                    }
                                >
                                    {item.title}
                                </NavLink>
                            )
                    )}
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-4">


                    {/* Profile Avatar */}
                    <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full p-0 hover:bg-white/5 transition-all"
                        onClick={() => navigate('/admin/settings')}
                    >
                        <Avatar className="h-10 w-10 border-2 border-slate-700">
                            <AvatarImage src="" alt={user?.firstname} />
                            <AvatarFallback className="bg-primary-cyan/20 text-primary-cyan font-bold">
                                {user?.firstname?.[0]}
                                {user?.lastname?.[0]}
                            </AvatarFallback>
                        </Avatar>
                    </Button>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white hover:bg-slate-800"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 border-b border-slate-700/50 bg-navy-deep p-4 md:hidden shadow-lg">
                    <div className="flex flex-col gap-2">
                        {navItems.map(
                            (item) =>
                                !item.hidden && (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${isActive
                                                ? 'bg-primary-cyan/20 text-primary-cyan'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`
                                        }
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.title}
                                    </NavLink>
                                )
                        )}

                        <div className="mt-4 pt-4 border-t border-slate-700 flex flex-col gap-2">
                            <Button className="w-full justify-start gap-2 rounded-xl bg-primary-cyan hover:bg-cyan-600 text-navy-deep font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                                <Wallet className="h-4 w-4" />
                                Connect Wallet
                            </Button>

                            <Button
                                variant="destructive"
                                className="w-full justify-start gap-2 rounded-xl"
                                onClick={handleLogout}
                            >
                                Déconnexion
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default AdminNavbar;
