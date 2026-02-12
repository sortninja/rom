import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Save, Info } from 'lucide-react';

export default function OperationalDataForm() {
    const { state, dispatch } = useProject();
    // We'll need to store this data in context eventually
    // For now, local state to demonstrate the form
    const [formData, setFormData] = useState({
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
    });

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-h2">Operational Data & Requirements</h2>
                <button className="flex items-center gap-md" style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <Save size={20} />
                    Save Changes
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>

                {/* Throughput Section */}
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
                                style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                        <div className="flex flex-col gap-xs">
                            <label className="text-small">Average Units / Hour</label>
                            <input
                                type="number"
                                value={formData.throughput.averageUnitsPerHour}
                                onChange={(e) => handleChange('throughput', 'averageUnitsPerHour', e.target.value)}
                                style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Operating Hours Section */}
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
                                style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                            >
                                <option value="1">1 Shift</option>
                                <option value="2">2 Shifts</option>
                                <option value="3">3 Shifts</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-xs">
                            <label className="text-small">Days / Week</label>
                            <input
                                type="number"
                                max="7"
                                min="1"
                                value={formData.operatingHours.daysPerWeek}
                                onChange={(e) => handleChange('operatingHours', 'daysPerWeek', e.target.value)}
                                style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
