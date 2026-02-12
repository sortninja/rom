import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Trash2, Plus } from 'lucide-react';

const defaultForm = {
    statement: '',
    category: 'Operational',
    impact: 'Medium',
    notes: '',
};

export default function Assumptions() {
    const { state, dispatch } = useProject();
    const [formData, setFormData] = useState(defaultForm);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!formData.statement.trim()) {
            return;
        }

        dispatch({
            type: 'ADD_ASSUMPTION',
            payload: {
                id: crypto.randomUUID(),
                ...formData,
                createdAt: new Date().toISOString(),
            },
        });

        setFormData(defaultForm);
    };

    const removeAssumption = (id) => {
        dispatch({ type: 'REMOVE_ASSUMPTION', payload: id });
    };

    return (
        <div className="grid gap-md">
            <div>
                <h1 className="text-h1">Assumptions</h1>
                <p className="text-body text-muted">Capture planning assumptions that influence sizing, scope, and costing.</p>
            </div>

            <div className="card">
                <h2 className="text-h2" style={{ marginTop: 0 }}>Add Assumption</h2>
                <form onSubmit={handleSubmit} className="grid gap-md">
                    <div>
                        <label htmlFor="statement" style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Assumption statement</label>
                        <textarea
                            id="statement"
                            name="statement"
                            value={formData.statement}
                            onChange={handleChange}
                            rows={3}
                            required
                            style={{ width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}
                            placeholder="Ex: Daily inbound pallets will remain below 900 through year one."
                        />
                    </div>

                    <div className="flex gap-md">
                        <div style={{ flex: 1 }}>
                            <label htmlFor="category" style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Category</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{ width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}
                            >
                                <option>Operational</option>
                                <option>Technical</option>
                                <option>Financial</option>
                                <option>Schedule</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="impact" style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Impact</label>
                            <select
                                id="impact"
                                name="impact"
                                value={formData.impact}
                                onChange={handleChange}
                                style={{ width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="notes" style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Notes</label>
                        <input
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            style={{ width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}
                            placeholder="Optional rationale, owner, or validation notes"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex items-center gap-md"
                            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: 'var(--space-sm) var(--space-md)' }}
                        >
                            <Plus size={16} />
                            Add Assumption
                        </button>
                    </div>
                </form>
            </div>

            <div className="card">
                <h2 className="text-h2" style={{ marginTop: 0 }}>Current Assumptions ({state.assumptions.length})</h2>
                {state.assumptions.length === 0 ? (
                    <p className="text-body text-muted">No assumptions added yet.</p>
                ) : (
                    <div className="grid gap-md">
                        {state.assumptions.map((assumption) => (
                            <div key={assumption.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md)' }}>
                                <div className="flex justify-between items-center" style={{ gap: 'var(--space-md)' }}>
                                    <strong>{assumption.category} · {assumption.impact} Impact</strong>
                                    <button
                                        onClick={() => removeAssumption(assumption.id)}
                                        style={{ border: 'none', background: 'transparent', color: 'var(--color-danger)' }}
                                        aria-label="Remove assumption"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p style={{ marginBottom: 'var(--space-xs)' }}>{assumption.statement}</p>
                                {assumption.notes && <p className="text-small" style={{ margin: 0 }}>{assumption.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
