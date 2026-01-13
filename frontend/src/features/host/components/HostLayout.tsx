import React from 'react';
import { Outlet } from 'react-router-dom';

import { HostNavbar } from './HostNavBar';


const HostLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <HostNavbar />
            <main className="flex-1">
                <Outlet />
            </main>

        </div>
    );
};

export default HostLayout;
