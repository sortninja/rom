import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

import ModuleSelection from './pages/ModuleSelection';
import Configuration from './pages/Configuration';
import Export from './pages/Export';
import Assumptions from './pages/Assumptions';
import Requirements from './pages/Requirements';

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
                    <Route path="export" element={<Export />} />
                    <Route path="assumptions" element={<Assumptions />} />
                    <Route path="requirements" element={<Requirements />} />
                    {/* Add other routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
