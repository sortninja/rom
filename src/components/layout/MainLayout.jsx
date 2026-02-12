import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="layout" style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar isOpen={sidebarOpen} />

            <div style={{
                flex: 1,
                marginLeft: sidebarOpen ? '240px' : '64px',
                transition: 'margin-left 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Header toggleSidebar={toggleSidebar} />

                <main style={{ flex: 1, padding: 'var(--space-lg)', overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
