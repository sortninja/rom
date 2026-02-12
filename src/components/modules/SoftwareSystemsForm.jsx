import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function SoftwareSystemsForm() {
    const { state, dispatch } = useProject();
    const moduleConfig = state.modules.software;
    const sourcing = moduleConfig?.sourcing || 'Buyout';

    const moduleData = state.moduleData.software || { applications: [] };
    const applications = moduleData.applications;

    const updateModuleData = (newData) => {
        dispatch({
            type: 'SET_MODULE_DATA',
            payload: {
                moduleId: 'software',
                data: newData
            }
        });
    };

    const addApplication = () => {
        const newApplication = {
            id: Date.now(),
            name: 'WCS Core',
            category: 'WCS',
            licenseType: 'Annual Subscription',
            seats: 10,
            annualCost: 65000
        };
        updateModuleData({ applications: [...applications, newApplication] });
    };

    const removeApplication = (id) => {
        updateModuleData({ applications: applications.filter(application => application.id !== id) });
    };

    const updateApplication = (id, field, value) => {
        const updatedApplications = applications.map(application => application.id === id ? { ...application, [field]: value } : application);
        updateModuleData({ applications: updatedApplications });
    };

    const handleSave = () => {
        console.log('Software data saved:', { applications });
    };

    const totalSoftwareCost = applications.reduce((sum, application) => sum + application.annualCost, 0);

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-h2">Software Systems</h2>
                    <span className="text-small" style={{
                        background: 'var(--color-bg-body)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--color-border)'
                    }}>
                        Strategy: <strong>{sourcing}</strong>
                    </span>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-md"
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer'
                    }}
                >
                    <Save size={20} />
                    Save
                </button>
            </div>

            <div className="mb-6">
                <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Application Stack</h3>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-body)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                            <th style={{ padding: 'var(--space-sm)' }}>Application</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Category</th>
                            <th style={{ padding: 'var(--space-sm)' }}>License Type</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Seats</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Annual Cost ($)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(application => (
                            <tr key={application.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: 'var(--space-sm)' }}>
                                    <input
                                        type="text"
                                        value={application.name}
                                        onChange={(e) => updateApplication(application.id, 'name', e.target.value)}
                                        style={{ padding: '4px', width: '100%' }}
                                    />
                                </td>
                                <td style={{ padding: 'var(--space-sm)' }}>
                                    <select
                                        value={application.category}
                                        onChange={(e) => updateApplication(application.id, 'category', e.target.value)}
                                        style={{ padding: '4px', width: '100%' }}
                                    >
                                        <option value="WCS">WCS</option>
                                        <option value="WES">WES</option>
                                        <option value="FMS">Fleet Manager</option>
                                        <option value="Integration">Custom Integration</option>
                                        <option value="Analytics">Analytics / Reporting</option>
                                    </select>
                                </td>
                                <td style={{ padding: 'var(--space-sm)' }}>
                                    <select
                                        value={application.licenseType}
                                        onChange={(e) => updateApplication(application.id, 'licenseType', e.target.value)}
                                        style={{ padding: '4px', width: '100%' }}
                                    >
                                        <option value="Perpetual">Perpetual</option>
                                        <option value="Annual Subscription">Annual Subscription</option>
                                        <option value="Usage-Based">Usage-Based</option>
                                    </select>
                                </td>
                                <td style={{ padding: 'var(--space-sm)' }}>
                                    <input
                                        type="number"
                                        value={application.seats}
                                        onChange={(e) => updateApplication(application.id, 'seats', Number(e.target.value))}
                                        style={{ padding: '4px', width: '80px' }}
                                    />
                                </td>
                                <td style={{ padding: 'var(--space-sm)' }}>
                                    <input
                                        type="number"
                                        value={application.annualCost}
                                        onChange={(e) => updateApplication(application.id, 'annualCost', Number(e.target.value))}
                                        style={{ padding: '4px', width: '100px' }}
                                    />
                                </td>
                                <td style={{ padding: 'var(--space-sm)' }}>
                                    <button onClick={() => removeApplication(application.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button
                    onClick={addApplication}
                    className="flex items-center gap-xs mt-md"
                    style={{
                        color: 'var(--color-primary)',
                        background: 'none',
                        border: '1px dashed var(--color-primary)',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        width: '100%',
                        justifyContent: 'center'
                    }}
                >
                    <Plus size={16} /> Add Application
                </button>
            </div>

            <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex justify-between items-center">
                    <span>Total Annual Software Cost:</span>
                    <strong className="text-h2" style={{ fontSize: '1.5rem' }}>${totalSoftwareCost.toLocaleString()}</strong>
                </div>
                <p className="text-small mt-sm text-info">
                    * Software estimate reflects recurring annual licensing and support.
                </p>
            </div>
        </div>
    );
}
