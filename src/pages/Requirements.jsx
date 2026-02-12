import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Plus, Upload, Trash2 } from 'lucide-react';

export default function Requirements() {
    const { state, dispatch } = useProject();
    const [requirementText, setRequirementText] = useState('');
    const [requirementPriority, setRequirementPriority] = useState('Must Have');

    const addRequirement = (event) => {
        event.preventDefault();
        if (!requirementText.trim()) {
            return;
        }

        dispatch({
            type: 'ADD_REQUIREMENT',
            payload: {
                id: crypto.randomUUID(),
                text: requirementText,
                priority: requirementPriority,
                createdAt: new Date().toISOString(),
            },
        });

        setRequirementText('');
        setRequirementPriority('Must Have');
    };

    const removeRequirement = (id) => {
        dispatch({ type: 'REMOVE_REQUIREMENT', payload: id });
    };

    const onDocumentUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        let preview = '';
        const isTextLike = file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.csv');

        if (isTextLike) {
            preview = await file.text();
            preview = preview.slice(0, 2000);
        }

        dispatch({
            type: 'SET_REQUIREMENTS_DOCUMENT',
            payload: {
                name: file.name,
                size: file.size,
                type: file.type || 'application/octet-stream',
                uploadedAt: new Date().toISOString(),
                textPreview: preview,
            },
        });

        event.target.value = '';
    };

    return (
        <div className="grid gap-md">
            <div>
                <h1 className="text-h1">Requirements</h1>
                <p className="text-body text-muted">Track key requirements and upload a source requirements document.</p>
            </div>

            <div className="card">
                <h2 className="text-h2" style={{ marginTop: 0 }}>Requirements Document</h2>
                <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
                    <label
                        htmlFor="requirements-upload"
                        className="flex items-center gap-md"
                        style={{
                            background: 'var(--color-primary)',
                            color: '#fff',
                            borderRadius: 'var(--radius-sm)',
                            padding: 'var(--space-sm) var(--space-md)',
                            cursor: 'pointer',
                        }}
                    >
                        <Upload size={16} />
                        Upload document
                    </label>
                    <input id="requirements-upload" type="file" onChange={onDocumentUpload} style={{ display: 'none' }} />
                    <span className="text-small">Accepted: any file type (text files include preview)</span>
                </div>

                {state.requirementsDocument ? (
                    <div style={{ marginTop: 'var(--space-md)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md)' }}>
                        <div><strong>File:</strong> {state.requirementsDocument.name}</div>
                        <div><strong>Type:</strong> {state.requirementsDocument.type}</div>
                        <div><strong>Size:</strong> {Math.round(state.requirementsDocument.size / 1024)} KB</div>
                        {state.requirementsDocument.textPreview && (
                            <>
                                <div style={{ marginTop: 'var(--space-sm)', fontWeight: 600 }}>Text preview:</div>
                                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.75rem', background: 'var(--color-bg-body)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>{state.requirementsDocument.textPreview}</pre>
                            </>
                        )}
                    </div>
                ) : (
                    <p className="text-body text-muted" style={{ marginBottom: 0 }}>No requirements document uploaded.</p>
                )}
            </div>

            <div className="card">
                <h2 className="text-h2" style={{ marginTop: 0 }}>Add Requirement</h2>
                <form onSubmit={addRequirement} className="grid gap-md">
                    <div>
                        <label htmlFor="req-text" style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Requirement</label>
                        <textarea
                            id="req-text"
                            value={requirementText}
                            onChange={(event) => setRequirementText(event.target.value)}
                            rows={3}
                            required
                            style={{ width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}
                            placeholder="Ex: System must process 5,000 units per hour peak."
                        />
                    </div>

                    <div style={{ maxWidth: '240px' }}>
                        <label htmlFor="req-priority" style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Priority</label>
                        <select
                            id="req-priority"
                            value={requirementPriority}
                            onChange={(event) => setRequirementPriority(event.target.value)}
                            style={{ width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}
                        >
                            <option>Must Have</option>
                            <option>Should Have</option>
                            <option>Nice to Have</option>
                        </select>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex items-center gap-md"
                            style={{ background: 'var(--color-success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: 'var(--space-sm) var(--space-md)' }}
                        >
                            <Plus size={16} />
                            Add Requirement
                        </button>
                    </div>
                </form>
            </div>

            <div className="card">
                <h2 className="text-h2" style={{ marginTop: 0 }}>Tracked Requirements ({state.requirements.length})</h2>
                {state.requirements.length === 0 ? (
                    <p className="text-body text-muted">No requirements captured yet.</p>
                ) : (
                    <div className="grid gap-md">
                        {state.requirements.map((requirement) => (
                            <div key={requirement.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md)' }}>
                                <div className="flex justify-between items-center" style={{ gap: 'var(--space-md)' }}>
                                    <strong>{requirement.priority}</strong>
                                    <button
                                        onClick={() => removeRequirement(requirement.id)}
                                        style={{ border: 'none', background: 'transparent', color: 'var(--color-danger)' }}
                                        aria-label="Remove requirement"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p style={{ marginBottom: 0 }}>{requirement.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
