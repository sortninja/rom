import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { calculateControlPanelCost, calculateControlsElectricalCost } from '../../utils/costs';
import { toNumber, validateControlPanels } from '../../utils/validation';

function hasValidationErrors(validationErrors = []) {
    return validationErrors.some((rowError) => rowError && Object.keys(rowError).length > 0);
}

export default function ControlsElectricalForm() {
    const { state, dispatch } = useProject();
    const [errors, setErrors] = useState([]);

    const moduleConfig = state.modules.controls;
    const sourcing = moduleConfig?.sourcing || 'In-House';

    const moduleData = state.moduleData.controls || { panels: [] };
    const panels = moduleData.panels;

    const updateModuleData = (newData) => {
        dispatch({
            type: 'SET_MODULE_DATA',
            payload: {
                moduleId: 'controls',
                data: newData
            }
        });
    };

    const addPanel = () => {
        const newPanel = {
            id: Date.now(),
            name: 'Zone Control Panel',
            panelType: 'PLC Panel',
            quantity: 1,
            ioCount: 64,
            unitCost: 18000
        };

        const updatedPanels = [...panels, newPanel];
        updateModuleData({ panels: updatedPanels });

        if (hasValidationErrors(errors)) {
            setErrors(validateControlPanels(updatedPanels));
        }
    };

    const removePanel = (id) => {
        const updatedPanels = panels.filter((panel) => panel.id !== id);
        updateModuleData({ panels: updatedPanels });

        if (hasValidationErrors(errors)) {
            setErrors(validateControlPanels(updatedPanels));
        }
    };

    const updatePanel = (id, field, value) => {
        const updatedPanels = panels.map((panel) => panel.id === id ? { ...panel, [field]: value } : panel);
        updateModuleData({ panels: updatedPanels });

        if (hasValidationErrors(errors)) {
            setErrors(validateControlPanels(updatedPanels));
        }
    };

    const handleSave = () => {
        const validationErrors = validateControlPanels(panels);

        if (hasValidationErrors(validationErrors)) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
    };

    const totalControlsCost = calculateControlsElectricalCost(panels);
    const totalIoPoints = panels.reduce((sum, panel) => {
        const quantity = toNumber(panel.quantity);
        const ioCount = toNumber(panel.ioCount);

        const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
        const safeIoCount = Number.isFinite(ioCount) ? Math.max(0, ioCount) : 0;

        return sum + (safeQuantity * safeIoCount);
    }, 0);

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-h2">Controls & Electrical</h2>
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

            {hasValidationErrors(errors) && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--color-danger)'
                }}>
                    <AlertCircle size={16} />
                    <span className="text-small" style={{ color: 'var(--color-danger)' }}>
                        Please resolve controls validation errors before saving.
                    </span>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Controls Scope</h3>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-body)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                            <th style={{ padding: 'var(--space-sm)' }}>Panel Name</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Type</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Quantity</th>
                            <th style={{ padding: 'var(--space-sm)' }}>I/O Count</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Unit Cost ($)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Total ($)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {panels.map((panel, rowIndex) => {
                            const rowError = errors[rowIndex] || {};

                            return (
                                <tr key={panel.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="text"
                                            value={panel.name}
                                            onChange={(e) => updatePanel(panel.id, 'name', e.target.value)}
                                            style={{
                                                padding: '4px',
                                                width: '100%',
                                                borderColor: rowError.name ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.name && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.name}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <select
                                            value={panel.panelType}
                                            onChange={(e) => updatePanel(panel.id, 'panelType', e.target.value)}
                                            style={{ padding: '4px', width: '100%' }}
                                        >
                                            <option value="PLC Panel">PLC Panel</option>
                                            <option value="MCC">MCC</option>
                                            <option value="HMI Station">HMI Station</option>
                                            <option value="Safety Panel">Safety Panel</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={panel.quantity}
                                            onChange={(e) => updatePanel(panel.id, 'quantity', e.target.value)}
                                            style={{
                                                padding: '4px',
                                                width: '80px',
                                                borderColor: rowError.quantity ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.quantity && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.quantity}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={panel.ioCount}
                                            onChange={(e) => updatePanel(panel.id, 'ioCount', e.target.value)}
                                            style={{
                                                padding: '4px',
                                                width: '80px',
                                                borderColor: rowError.ioCount ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.ioCount && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.ioCount}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={panel.unitCost}
                                            onChange={(e) => updatePanel(panel.id, 'unitCost', e.target.value)}
                                            style={{
                                                padding: '4px',
                                                width: '100px',
                                                borderColor: rowError.unitCost ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.unitCost && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.unitCost}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        ${calculateControlPanelCost(panel).toLocaleString()}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <button onClick={() => removePanel(panel.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <button
                    onClick={addPanel}
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
                    <Plus size={16} /> Add Control Panel
                </button>
            </div>

            <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex justify-between items-center mb-sm">
                    <span>Total I/O Points:</span>
                    <strong>{totalIoPoints.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center">
                    <span>Estimated Controls Cost:</span>
                    <strong className="text-h2" style={{ fontSize: '1.5rem' }}>${totalControlsCost.toLocaleString()}</strong>
                </div>
            </div>
        </div>
    );
}
