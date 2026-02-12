import React from 'react';
import { Check, Info, AlertTriangle } from 'lucide-react';
import { SOURCING_STRATEGIES } from '../../data/modules';

export default function ModuleCard({ module, isSelected, sourcing, onToggle, onSourcingChange }) {
    const Icon = module.icon;

    return (
        <div className={`card ${isSelected ? 'selected' : ''}`} style={{
            border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            transition: 'all 0.2s ease',
            opacity: isSelected ? 1 : 0.8,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)'
        }}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-md">
                    <div style={{
                        padding: 'var(--space-sm)',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'var(--color-primary)' : 'var(--color-bg-body)',
                        color: isSelected ? 'white' : 'var(--color-text-muted)'
                    }}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{module.name}</h3>
                        {module.required && <span className="text-small" style={{ color: 'var(--color-info)' }}>Required</span>}
                    </div>
                </div>
                <label className="switch" style={{ cursor: module.required ? 'not-allowed' : 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !module.required && onToggle(module.id)}
                        disabled={module.required}
                        style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                </label>
            </div>

            <p className="text-body" style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                {module.description}
            </p>

            {isSelected && (
                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                    <label className="text-small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Sourcing Strategy</label>
                    <div className="flex gap-md">
                        {module.sourcingOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => onSourcingChange(module.id, option)}
                                style={{
                                    padding: 'var(--space-xs) var(--space-sm)',
                                    fontSize: '0.875rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: sourcing === option ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    background: sourcing === option ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                    color: sourcing === option ? 'var(--color-primary)' : 'var(--color-text-muted)'
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
