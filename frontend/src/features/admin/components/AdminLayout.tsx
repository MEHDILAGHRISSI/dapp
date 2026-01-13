import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const AdminLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
            <AdminNavbar />
            <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
