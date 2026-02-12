import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { calculateRoboticsHardwareCost } from '../../utils/costs';
import { validateRobotFleet } from '../../utils/validation';

export default function RoboticSystemsForm() {
    const { state, dispatch } = useProject();
    const [rowErrors, setRowErrors] = useState([]);
    const moduleConfig = state.modules['robotic_systems'];
    const sourcing = moduleConfig?.sourcing || 'Buyout';

    const moduleData = state.moduleData.robotic_systems || { robots: [] };
    const robots = moduleData.robots;

    const updateModuleData = (newData) => {
        dispatch({
            type: 'SET_MODULE_DATA',
            payload: {
                moduleId: 'robotic_systems',
                data: newData
            }
        });

        if (rowErrors.length > 0) {
            setRowErrors(validateRobotFleet(newData.robots));
        }
    };

    const addRobot = () => {
        const newRobot = { id: Date.now(), type: 'AMR', quantity: 1, vendor: '', unitCost: 0 };
        updateModuleData({ robots: [...robots, newRobot] });
    };

    const removeRobot = (id) => {
        updateModuleData({ robots: robots.filter(r => r.id !== id) });
    };

    const updateRobot = (id, field, value) => {
        const updatedRobots = robots.map(r => r.id === id ? { ...r, [field]: value } : r);
        updateModuleData({ robots: updatedRobots });
    };

    const handleSave = () => {
        const validationErrors = validateRobotFleet(robots);

        if (validationErrors.some(Boolean)) {
            setRowErrors(validationErrors);
            return;
        }

        setRowErrors([]);
        console.log('Robotic systems data saved:', { robots });
    };

    const totalHardwareCost = calculateRoboticsHardwareCost(robots);

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-h2">Robotic Systems</h2>
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

            {rowErrors.some(Boolean) && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--color-danger)'
                }}>
                    <AlertCircle size={16} />
                    <span className="text-small" style={{ color: 'var(--color-danger)' }}>
                        Please resolve robot fleet validation errors before saving.
                    </span>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Robot Fleet</h3>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-bg-body)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                            <th style={{ padding: 'var(--space-sm)' }}>Type</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Vendor</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Quantity</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Unit Cost ($)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Total ($)</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {robots.map((robot, rowIndex) => {
                            const rowError = rowErrors[rowIndex] || {};

                            return (
                                <tr key={robot.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <select
                                            value={robot.type}
                                            onChange={(e) => updateRobot(robot.id, 'type', e.target.value)}
                                            style={{ padding: '4px', width: '100%' }}
                                        >
                                            <option value="AMR">AMR (Transport)</option>
                                            <option value="Arm">Articulated Arm</option>
                                            <option value="ASRS">ASRS Shuttle</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="text"
                                            value={robot.vendor}
                                            onChange={(e) => updateRobot(robot.id, 'vendor', e.target.value)}
                                            placeholder="e.g. Fanuc"
                                            style={{
                                                padding: '4px',
                                                width: '100%',
                                                borderColor: rowError.vendor ? 'var(--color-danger)' : undefined
                                            }}
                                        />
                                        {rowError.vendor && (
                                            <span className="text-small" style={{ color: 'var(--color-danger)' }}>{rowError.vendor}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <input
                                            type="number"
                                            value={robot.quantity}
                                            onChange={(e) => updateRobot(robot.id, 'quantity', Number(e.target.value))}
                                            style={{
                                                padding: '4px',
                                                width: '60px',
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
                                            value={robot.unitCost}
                                            onChange={(e) => updateRobot(robot.id, 'unitCost', Number(e.target.value))}
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
                                        ${(robot.quantity * robot.unitCost).toLocaleString()}
                                    </td>
                                    <td style={{ padding: 'var(--space-sm)' }}>
                                        <button onClick={() => removeRobot(robot.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <button
                    onClick={addRobot}
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
                    <Plus size={16} /> Add Robot
                </button>
            </div>

            <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex justify-between items-center">
                    <span>Estimated Hardware Cost:</span>
                    <strong className="text-h2" style={{ fontSize: '1.5rem' }}>${totalHardwareCost.toLocaleString()}</strong>
                </div>
                {sourcing === 'Buyout' && (
                    <p className="text-small mt-sm text-info">
                        * Integration labor will be calculated separately based on total hardware cost complexity factor (15-25%).
                    </p>
                )}
            </div>
        </div>
    );
}
