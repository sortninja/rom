import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Menu, MessageSquare, Bell } from 'lucide-react';

export default function Header({ toggleSidebar }) {
    const { state } = useProject();
    const { projectInfo } = state;

    return (
        <header className="header" style={{
            height: '64px',
            background: 'var(--color-bg-card)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-lg)',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            <div className="flex items-center gap-md">
                <button className="icon-btn" onClick={toggleSidebar} style={{ background: 'none', border: 'none' }}>
                    <Menu size={24} color="var(--color-text-muted)" />
                </button>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{projectInfo.name}</h2>
                    <span className="text-small">{projectInfo.status}</span>
                </div>
            </div>

            <div className="flex items-center gap-md">
                <button style={{ background: 'none', border: 'none' }}><MessageSquare size={20} color="var(--color-text-muted)" /></button>
                <button style={{ background: 'none', border: 'none' }}><Bell size={20} color="var(--color-text-muted)" /></button>
                <div className="avatar" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem'
                }}>
                    ?
                </div>
            </div>
        </header>
    );
}
