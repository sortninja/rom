import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULE_DEFINITIONS } from '../data/modules';
import OperationalDataForm from '../components/modules/OperationalDataForm';
import RoboticSystemsForm from '../components/modules/RoboticSystemsForm';
import ConveyanceSystemsForm from '../components/modules/ConveyanceSystemsForm';
import StorageInfrastructureForm from '../components/modules/StorageInfrastructureForm';
import ControlsElectricalForm from '../components/modules/ControlsElectricalForm';
import SoftwareSystemsForm from '../components/modules/SoftwareSystemsForm';
import ImplementationServicesForm from '../components/modules/ImplementationServicesForm';
import { AlertTriangle } from 'lucide-react';

export default function Configuration() {
    const { state } = useProject();
    const { modules } = state;
    const [activeModuleId, setActiveModuleId] = useState(MODULE_DEFINITIONS[0].id);

    const selectedModules = MODULE_DEFINITIONS.filter(m => modules[m.id]);

    if (selectedModules.length === 0) {
        return (
            <div className="card flex flex-col items-center justify-center p-xl">
                <AlertTriangle size={48} color="var(--color-warning)" />
                <h2 className="text-h2 mt-md">No Modules Selected</h2>
                <p className="text-body text-muted">Please go to the Module Selection page to choose components for this project.</p>
            </div>
        );
    }

    const renderModuleForm = () => {
        switch (activeModuleId) {
            case 'operational_data':
                return <OperationalDataForm />;
            case 'robotic_systems':
                return <RoboticSystemsForm />;
            case 'conveyance':
                return <ConveyanceSystemsForm />;
            case 'storage':
                return <StorageInfrastructureForm />;
            case 'controls':
                return <ControlsElectricalForm />;
            case 'software':
                return <SoftwareSystemsForm />;
            case 'implementation':
                return <ImplementationServicesForm />;
            default:
                // Placeholder for other modules
                return (
                    <div className="card">
                        <h2 className="text-h2">{modules[activeModuleId]?.name || 'Unknown Module'}</h2>
                        <p className="text-body text-muted">Configuration form for this module is under development.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex gap-lg" style={{ height: 'calc(100vh - 100px)' }}>
            {/* Sub-navigation sidebar for configuration */}
            <div className="card" style={{ width: '250px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-body)' }}>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                        Configuring
                    </h3>
                </div>
                <div className="flex-col" style={{ overflowY: 'auto' }}>
                    {selectedModules.map(module => (
                        <button
                            key={module.id}
                            onClick={() => setActiveModuleId(module.id)}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: 'var(--space-md)',
                                background: activeModuleId === module.id ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                border: 'none',
                                borderLeft: activeModuleId === module.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                                color: activeModuleId === module.id ? 'var(--color-primary)' : 'var(--color-text-main)',
                                fontWeight: activeModuleId === module.id ? 600 : 400
                            }}
                        >
                            {module.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Form Area */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {renderModuleForm()}
            </div>
        </div>
    );
}
