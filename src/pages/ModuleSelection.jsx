import React from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULE_DEFINITIONS } from '../data/modules';
import ModuleCard from '../components/modules/ModuleCard';

export default function ModuleSelection() {
    const { state, dispatch } = useProject();
    const { modules } = state;

    const handleToggle = (moduleId) => {
        const module = MODULE_DEFINITIONS.find(m => m.id === moduleId);
        const isCurrentlySelected = !!modules[moduleId];

        dispatch({
            type: 'TOGGLE_MODULE',
            payload: {
                moduleId,
                isSelected: !isCurrentlySelected,
                defaultSourcing: module.defaultSourcing
            }
        });
    };

    const handleSourcingChange = (moduleId, sourcing) => {
        dispatch({
            type: 'SET_SOURCING',
            payload: { moduleId, sourcing }
        });
    };

    // Calculate stats
    const selectedCount = Object.keys(modules).length;
    const inHouseCount = Object.values(modules).filter(m => m.sourcing === 'In-House').length;
    const buyoutCount = Object.values(modules).filter(m => m.sourcing === 'Buyout').length;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-h1">Module Selection</h1>
                    <p className="text-body text-muted">Select the components required for this project and define the sourcing strategy.</p>
                </div>

                <div className="flex gap-md text-small">
                    <div className="card" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                        <strong>{selectedCount}</strong> Active Modules
                    </div>
                    <div className="card" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                        <strong>{inHouseCount}</strong> In-House
                    </div>
                    <div className="card" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                        <strong>{buyoutCount}</strong> Buyout
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'var(--space-lg)'
            }}>
                {MODULE_DEFINITIONS.map(module => (
                    <ModuleCard
                        key={module.id}
                        module={module}
                        isSelected={!!modules[module.id] || module.required}
                        sourcing={modules[module.id]?.sourcing || module.defaultSourcing}
                        onToggle={handleToggle}
                        onSourcingChange={handleSourcingChange}
                    />
                ))}
            </div>
        </div>
    );
}
