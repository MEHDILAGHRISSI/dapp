import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    User,
    ShieldCheck,
    History,
    LogOut,
    ChevronRight,
    Settings as SettingsIcon
} from "lucide-react";
import { Navbar } from "@/components/Layout/Navbar/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SettingsLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children, title, subtitle }) => {
    const location = useLocation();

    const navItems = [
        {
            label: "Profil",
            href: "/settings/profile",
            icon: User,
            active: location.pathname === "/settings/profile" || location.pathname === "/settings",
        },
        {
            label: "Sécurité",
            href: "/settings/security",
            icon: ShieldCheck,
            active: location.pathname === "/settings/security",
        },
        {
            label: "Historique de location",
            href: "/settings/history",
            icon: History,
            active: location.pathname === "/settings/history",
        },
    ];

    return (
        <div className="bg-slate-50/50 dark:bg-slate-950 font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col">

            <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-in fade-in duration-700">
                <div className="flex flex-col lg:flex-row gap-10 items-start">

                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="flex flex-col gap-1 sticky top-28">
                            <div className="px-4 mb-6">
                                <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                                    <SettingsIcon className="h-6 w-6 text-primary" />
                                    Paramètres
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">Gérez votre compte et vos préférences</p>
                            </div>

                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        className={`flex items-center justify-between group px-4 py-3 rounded-xl transition-all ${item.active
                                            ? "bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 ring-1 ring-primary/5 dark:ring-primary/20"
                                            : "text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`h-5 w-5 transition-colors ${item.active ? "text-primary" : "group-hover:text-primary"
                                                }`} />
                                            <span className="text-sm font-semibold">{item.label}</span>
                                        </div>
                                        {item.active && <ChevronRight className="h-4 w-4 text-primary" />}
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="text-sm font-semibold">Déconnexion</span>
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Card */}
                    <Card className="flex-1 w-full border-none bg-white/70 dark:bg-slate-900/70 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl overflow-hidden rounded-3xl">
                        {/* Page Header */}
                        <div className="border-b border-slate-100 dark:border-slate-800 p-8 sm:p-10 bg-slate-50/30 dark:bg-slate-900/30">
                            <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
                            {subtitle && <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>}
                        </div>

                        <div className="p-0">
                            {children}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;
