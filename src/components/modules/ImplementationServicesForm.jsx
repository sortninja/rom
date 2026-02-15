import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { calculateImplementationServiceCost, calculateImplementationServicesCost } from '../../utils/costs';
import { toNumber, validateImplementationServices, hasRowErrors } from '../../utils/validation';

export default function ImplementationServicesForm() {
    const { state, dispatch } = useProject();
    const [errors, setErrors] = useState([]);
    const moduleConfig = state.modules.implementation;
    const sourcing = moduleConfig?.sourcing || 'In-House';

    const moduleData = state.moduleData.implementation || { services: [] };
    const services = moduleData.services;

    const updateModuleData = (newData) => {
        dispatch({
            type: 'SET_MODULE_DATA',
            payload: {
                moduleId: 'implementation',
                data: newData
            }
        });

        if (hasRowErrors(errors)) {
            setErrors(validateImplementationServices(newData.services));
        }
    };

    const addService = () => {
        const newService = {
            id: Date.now(),
            phase: 'Project Management',
            resourceType: 'PM',
            hours: 120,
            hourlyRate: 145
        };
        updateModuleData({ services: [...services, newService] });
    };

    const removeService = (id) => {
        updateModuleData({ services: services.filter((service) => service.id !== id) });
    };

    const updateService = (id, field, value) => {
        const updatedServices = services.map((service) => service.id === id ? { ...service, [field]: value } : service);
        updateModuleData({ services: updatedServices });
    };

    const handleSave = () => {
        const validationErrors = validateImplementationServices(services);

        if (hasRowErrors(validationErrors)) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
    };

    const totalHours = services.reduce((sum, service) => {
        const hours = toNumber(service.hours);
        return sum + (Number.isFinite(hours) ? Math.max(0, hours) : 0);
    }, 0);
    const totalImplementationCost = calculateImplementationServicesCost(services);

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-h2">Implementation Services</h2>
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

            {hasRowErrors(errors) && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--color-danger)'
                }}>
                    <AlertCircle size={16} />
                    <span className="text-small" style={{ color: 'var(--color-danger)' }}>
                        Please resolve implementation service validation errors before saving.
                    </span>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Delivery Scope</h3>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-body)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                            <th style={{ padding: 'var(--space-sm)' }}>Phase</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Resource</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Hours</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Rate ($/hr)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Total ($)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service, rowIndex) => {
                            const rowError = errors[rowIndex] || {};

                            return (
                                <tr key={service.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <select
                                            value={service.phase}
                                            onChange={(e) => updateService(service.id, 'phase', e.target.value)}
                                            style={{ padding: '4px', width: '100%' }}
                                        >
                                            <option value="Project Management">Project Management</option>
                                            <option value="Installation Supervision">Installation Supervision</option>
                                            <option value="Commissioning">Commissioning</option>
                                            <option value="Testing & Validation">Testing & Validation</option>
                                            <option value="Training & Go-live">Training & Go-live</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <select
                                            value={service.resourceType}
                                            onChange={(e) => updateService(service.id, 'resourceType', e.target.value)}
                                            style={{ padding: '4px', width: '100%' }}
                                        >
                                            <option value="PM">PM</option>
                                            <option value="Site Lead">Site Lead</option>
                                            <option value="Controls Engineer">Controls Engineer</option>
                                            <option value="Software Engineer">Software Engineer</option>
                                            <option value="Technician">Technician</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={service.hours}
                                            onChange={(e) => updateService(service.id, 'hours', e.target.value)}
                                            style={{
                                                padding: '4px',
                                                width: '100px',
                                                borderColor: rowError.hours ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.hours && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.hours}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={service.hourlyRate}
                                            onChange={(e) => updateService(service.id, 'hourlyRate', e.target.value)}
                                            style={{
                                                padding: '4px',
                                                width: '100px',
                                                borderColor: rowError.hourlyRate ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.hourlyRate && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.hourlyRate}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        ${calculateImplementationServiceCost(service).toLocaleString()}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <button onClick={() => removeService(service.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <button
                    onClick={addService}
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
                    <Plus size={16} /> Add Service Line
                </button>
            </div>

            <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex justify-between items-center mb-sm">
                    <span>Total Delivery Hours:</span>
                    <strong>{totalHours.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center">
                    <span>Estimated Implementation Cost:</span>
                    <strong className="text-h2" style={{ fontSize: '1.5rem' }}>${totalImplementationCost.toLocaleString()}</strong>
                </div>
            </div>
        </div>
    );
}
