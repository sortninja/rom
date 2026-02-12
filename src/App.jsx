import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

import ModuleSelection from './pages/ModuleSelection';
import Configuration from './pages/Configuration';

// Placeholder pages
const Dashboard = () => <div className="card text-h2">Project Dashboard</div>;

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="modules" element={<ModuleSelection />} />
                    <Route path="configuration" element={<Configuration />} />
                    {/* Add other routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
