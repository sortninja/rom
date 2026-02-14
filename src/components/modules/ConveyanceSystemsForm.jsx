import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { calculateConveyanceHardwareCost, calculateConveyanceSegmentCost } from '../../utils/costs';
import { toNumber, validateConveyanceSegments } from '../../utils/validation';

function hasValidationErrors(validationErrors = []) {
    return validationErrors.some((rowError) => rowError && Object.keys(rowError).length > 0);
}


export default function ConveyanceSystemsForm() {
    const { state, dispatch } = useProject();
    const [errors, setErrors] = useState([]);

    const moduleConfig = state.modules.conveyance;
    const moduleConfig = state.modules['conveyance'];
    const sourcing = moduleConfig?.sourcing || 'Buyout';
    const moduleData = state.moduleData.conveyance || {
        segments: [{ id: 1, type: 'MDR', length: 100, width: 24, zones: 10 }]
    };

    const segments = moduleData.segments;

    const updateModuleData = (newData) => {
        dispatch({
            type: 'SET_MODULE_DATA',
            payload: {
                moduleId: 'conveyance',
                data: newData
            }
        });
    };

    const addSegment = () => {
        const updatedSegments = [...segments, { id: Date.now(), type: 'MDR', length: 10, width: 24, zones: 1 }];
        updateModuleData({ segments: updatedSegments });

        if (hasValidationErrors(errors)) {
            setErrors(validateConveyanceSegments(updatedSegments));
        }
    };

    const removeSegment = (id) => {
        const updatedSegments = segments.filter((segment) => segment.id !== id);
        updateModuleData({ segments: updatedSegments });

        if (hasValidationErrors(errors)) {
            setErrors(validateConveyanceSegments(updatedSegments));
        }
    };

    const updateSegment = (id, field, value) => {
        const updatedSegments = segments.map((segment) => (
            segment.id === id ? { ...segment, [field]: value } : segment
        ));

        updateModuleData({ segments: updatedSegments });

        if (hasValidationErrors(errors)) {
            setErrors(validateConveyanceSegments(updatedSegments));
        }
    };

    const handleSave = () => {
        const validationErrors = validateConveyanceSegments(segments);

        if (hasValidationErrors(validationErrors)) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        updateModuleData({ segments });

    };

    const totalLength = segments.reduce((sum, segment) => {
        const length = toNumber(segment.length);
        return sum + (Number.isFinite(length) ? Math.max(0, length) : 0);
    }, 0);
    const estimatedCost = calculateConveyanceHardwareCost(segments);

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-h2">Conveyance Systems</h2>
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
                        borderRadius: 'var(--radius-md)'
                    }}
                >
                    <Save size={20} />
                    Save
                </button>
            </div>

            {errors.length > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--color-danger)'
                }}>
                    <AlertCircle size={16} />
                    <span className="text-small" style={{ color: 'var(--color-danger)' }}>
                        Please resolve validation errors before saving.
                    </span>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Conveyor Segments</h3>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-body)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                            <th style={{ padding: 'var(--space-sm)' }}>Type</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Width (in)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Length (ft)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Zones</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Est. Cost</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {segments.map((segment, index) => {
                            const rowError = errors[index] || {};

                            return (
                                <tr key={segment.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <select
                                            value={segment.type}
                                            onChange={(e) => updateSegment(segment.id, 'type', e.target.value)}
                                            style={{ padding: '4px', width: '100%' }}
                                        >
                                            <option value="MDR">24V MDR (Zero Pressure)</option>
                                            <option value="Belt">Belt Conveyor (Transport)</option>
                                            <option value="Gravity">Gravity Roller</option>
                                            <option value="Sortation">Shoe Sorter</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <select
                                            value={segment.width}
                                            onChange={(e) => updateSegment(segment.id, 'width', Number(e.target.value))}
                                            style={{ padding: '4px', width: '100%' }}
                                        >
                                            <option value="18">18"</option>
                                            <option value="24">24"</option>
                                            <option value="30">30"</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={segment.length}
                                            onChange={(e) => updateSegment(segment.id, 'length', Number(e.target.value))}
                                            style={{
                                                padding: '4px',
                                                width: '80px',
                                                borderColor: rowError.length ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.length && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.length}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={segment.zones}
                                            onChange={(e) => updateSegment(segment.id, 'zones', Number(e.target.value))}
                                            style={{
                                                padding: '4px',
                                                width: '80px',
                                                borderColor: rowError.zones ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.zones && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.zones}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        ${(Number(segment.length || 0) * getConveyanceCostPerFoot(segment.type)).toLocaleString()}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <button onClick={() => removeSegment(segment.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <button
                    onClick={addSegment}
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
                    <Plus size={16} /> Add Segment
                </button>
            </div>

            <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex justify-between items-center mb-sm">
                    <span>Total Length:</span>
                    <strong>{totalLength.toLocaleString()} ft</strong>
                </div>
                <div className="flex justify-between items-center">
                    <span>Estimated Hardware Cost:</span>
                    <strong className="text-h2" style={{ fontSize: '1.5rem' }}>${estimatedCost.toLocaleString()}</strong>
                </div>
            </div>
        </div>
    );
}
