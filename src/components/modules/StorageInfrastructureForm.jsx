import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { calculateStorageInfrastructureCost, calculateStorageZoneCost } from '../../utils/costs';
import { toNumber, validateStorageZones, hasRowErrors } from '../../utils/validation';

export default function StorageInfrastructureForm() {
    const { state, dispatch } = useProject();
    const [errors, setErrors] = useState([]);

    const moduleConfig = state.modules.storage;
    const sourcing = moduleConfig?.sourcing || 'Buyout';

    const moduleData = state.moduleData.storage || {
        zones: [{ id: 1, type: 'Selective Racking', positions: 5000, height: 30, aisleWidth: 10 }]
    };

    const zones = moduleData.zones;

    const updateModuleData = (newData) => {
        dispatch({
            type: 'SET_MODULE_DATA',
            payload: {
                moduleId: 'storage',
                data: newData
            }
        });
    };

    const addZone = () => {
        const updatedZones = [...zones, { id: Date.now(), type: 'Selective Racking', positions: 1000, height: 20, aisleWidth: 10 }];
        updateModuleData({ zones: updatedZones });

        if (hasRowErrors(errors)) {
            setErrors(validateStorageZones(updatedZones));
        }
    };

    const removeZone = (id) => {
        const updatedZones = zones.filter((zone) => zone.id !== id);
        updateModuleData({ zones: updatedZones });

        if (hasRowErrors(errors)) {
            setErrors(validateStorageZones(updatedZones));
        }
    };

    const updateZone = (id, field, value) => {
        const updatedZones = zones.map((zone) => zone.id === id ? { ...zone, [field]: value } : zone);
        updateModuleData({ zones: updatedZones });

        if (hasRowErrors(errors)) {
            setErrors(validateStorageZones(updatedZones));
        }
    };

    const handleSave = () => {
        const validationErrors = validateStorageZones(zones);

        if (hasRowErrors(validationErrors)) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
    };

    const totalPositions = zones.reduce((sum, zone) => {
        const positions = toNumber(zone.positions);
        return sum + (Number.isFinite(positions) ? Math.max(0, positions) : 0);
    }, 0);
    const estimatedCost = calculateStorageInfrastructureCost(zones);

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-h2">Storage Infrastructure</h2>
                    <span className="text-small" style={{
                        background: 'var(--color-bg-body)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--color-border)'
                    }}>
                        Strategy: <strong>{sourcing}</strong>
                    </span>
                </div>
                <button onClick={handleSave} className="flex items-center gap-md" style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-md)'
                }}>
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
                        Please resolve storage validation errors before saving.
                    </span>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Storage Zones</h3>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-body)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                            <th style={{ padding: 'var(--space-sm)' }}>Type</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Pallet Positions</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Height (ft)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Aisle Width (ft)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Est. Cost</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {zones.map((zone, rowIndex) => {
                            const rowError = errors[rowIndex] || {};

                            return (
                                <tr key={zone.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <select
                                            value={zone.type}
                                            onChange={(e) => updateZone(zone.id, 'type', e.target.value)}
                                            style={{ padding: '4px', width: '100%' }}
                                        >
                                            <option value="Selective Racking">Selective Racking</option>
                                            <option value="Push Back">Push Back Racking</option>
                                            <option value="Drive In">Drive In Racking</option>
                                            <option value="Shelving">Industrial Shelving (Bin units)</option>
                                            <option value="Mezzanine">Structure / Mezzanine (sq ft)</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={zone.positions}
                                            onChange={(e) => updateZone(zone.id, 'positions', e.target.value)}
                                            style={{
                                                padding: '4px',
                                                width: '100px',
                                                borderColor: rowError.positions ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.positions && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.positions}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={zone.height}
                                            onChange={(e) => updateZone(zone.id, 'height', e.target.value)}
                                            style={{
                                                padding: '4px',
                                                width: '80px',
                                                borderColor: rowError.height ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.height && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.height}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={zone.aisleWidth}
                                            onChange={(e) => updateZone(zone.id, 'aisleWidth', e.target.value)}
                                            style={{
                                                padding: '4px',
                                                width: '80px',
                                                borderColor: rowError.aisleWidth ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.aisleWidth && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.aisleWidth}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        ${calculateStorageZoneCost(zone).toLocaleString()}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <button onClick={() => removeZone(zone.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <button
                    onClick={addZone}
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
                    <Plus size={16} /> Add Storage Zone
                </button>
            </div>

            <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex justify-between items-center mb-sm">
                    <span>Total Positions / Units:</span>
                    <strong>{totalPositions.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center">
                    <span>Estimated Hardware Cost:</span>
                    <strong className="text-h2" style={{ fontSize: '1.5rem' }}>${estimatedCost.toLocaleString()}</strong>
                </div>
            </div>
        </div>
    );
}
