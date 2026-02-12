import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

import ModuleSelection from './pages/ModuleSelection';
import Configuration from './pages/Configuration';
import Export from './pages/Export';

// Placeholder pages
const Dashboard = () => <div className="card text-h2">Project Dashboard</div>;

const normalizeRouterBasename = (baseUrl) => {
    if (!baseUrl || baseUrl === '/' || baseUrl === '.' || baseUrl === './') {
        return '/';
    }

    try {
        const { pathname } = new URL(baseUrl, 'http://localhost');
        return pathname === '/' ? '/' : pathname.replace(/\/$/, '');
    } catch {
        return '/';
    }
};

const routerBase = normalizeRouterBasename(import.meta.env.BASE_URL);

function App() {
    return (
        <BrowserRouter basename={routerBase}>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="modules" element={<ModuleSelection />} />
                    <Route path="configuration" element={<Configuration />} />
                    <Route path="export" element={<Export />} />
                    {/* Add other routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
