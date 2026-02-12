import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Save, Info, AlertCircle } from 'lucide-react';
import { validateOperationalData } from '../../utils/validation';

export default function OperationalDataForm() {
    const { state, dispatch } = useProject();
    const [errors, setErrors] = useState({});
    const formData = state.moduleData.operational_data || {
        throughput: {
            peakUnitsPerHour: 5000,
            averageUnitsPerHour: 3500,
            dailyOrderVolume: 12000,
        },
        operatingHours: {
            shiftsPerDay: 2,
            hoursPerShift: 8,
            daysPerWeek: 5,
        },
        inventory: {
            totalSKUs: 15000,
            activeSKUs: 4000,
            storageVolume: '10000 pallets',
        }
    };

    const handleChange = (section, field, value) => {
        const updatedSection = {
            ...formData[section],
            [field]: value
        };

        const updatedData = {
            ...formData,
            [section]: updatedSection
        };

        dispatch({
            type: 'UPDATE_MODULE_DATA',
            payload: {
                moduleId: 'operational_data',
                data: updatedData
            }
        });

        if (Object.keys(errors).length > 0) {
            setErrors(validateOperationalData(updatedData));
        }
    };

    const handleSave = () => {
        const validationErrors = validateOperationalData(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});

        dispatch({
            type: 'SET_MODULE_DATA',
            payload: {
                moduleId: 'operational_data',
                data: formData
            }
        });

        console.log('Operational data saved:', formData);
    };

    const inputStyle = (hasError) => ({
        padding: 'var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`
    });

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-h2">Operational Data & Requirements</h2>
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
                    Save Changes
                </button>
            </div>

            {Object.keys(errors).length > 0 && (
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
                <section>
                    <h3 className="flex items-center gap-md" style={{ marginBottom: 'var(--space-md)' }}>
                        Throughput Targets
                        <Info size={16} color="var(--color-text-muted)" />
                    </h3>
                    <div className="flex flex-col gap-md">
                        <div className="flex flex-col gap-xs">
                            <label className="text-small">Peak Units / Hour</label>
                            <input
                                type="number"
                                value={formData.throughput.peakUnitsPerHour}
                                onChange={(e) => handleChange('throughput', 'peakUnitsPerHour', e.target.value)}
                                style={inputStyle(Boolean(errors.peakUnitsPerHour))}
                            />
                            {errors.peakUnitsPerHour && (
                                <span className="text-small" style={{ color: 'var(--color-danger)' }}>{errors.peakUnitsPerHour}</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-xs">
                            <label className="text-small">Average Units / Hour</label>
                            <input
                                type="number"
                                value={formData.throughput.averageUnitsPerHour}
                                onChange={(e) => handleChange('throughput', 'averageUnitsPerHour', e.target.value)}
                                style={inputStyle(Boolean(errors.averageUnitsPerHour))}
                            />
                            {errors.averageUnitsPerHour && (
                                <span className="text-small" style={{ color: 'var(--color-danger)' }}>{errors.averageUnitsPerHour}</span>
                            )}
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="flex items-center gap-md" style={{ marginBottom: 'var(--space-md)' }}>
                        Operating Schedule
                        <Info size={16} color="var(--color-text-muted)" />
                    </h3>
                    <div className="flex flex-col gap-md">
                        <div className="flex flex-col gap-xs">
                            <label className="text-small">Shifts / Day</label>
                            <select
                                value={formData.operatingHours.shiftsPerDay}
                                onChange={(e) => handleChange('operatingHours', 'shiftsPerDay', e.target.value)}
                                style={inputStyle(Boolean(errors.shiftsPerDay))}
                            >
                                <option value="1">1 Shift</option>
                                <option value="2">2 Shifts</option>
                                <option value="3">3 Shifts</option>
                            </select>
                            {errors.shiftsPerDay && (
                                <span className="text-small" style={{ color: 'var(--color-danger)' }}>{errors.shiftsPerDay}</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-xs">
                            <label className="text-small">Days / Week</label>
                            <input
                                type="number"
                                max="7"
                                min="1"
                                value={formData.operatingHours.daysPerWeek}
                                onChange={(e) => handleChange('operatingHours', 'daysPerWeek', e.target.value)}
                                style={inputStyle(Boolean(errors.daysPerWeek))}
                            />
                            {errors.daysPerWeek && (
                                <span className="text-small" style={{ color: 'var(--color-danger)' }}>{errors.daysPerWeek}</span>
                            )}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
