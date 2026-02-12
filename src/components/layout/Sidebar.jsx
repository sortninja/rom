import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, layers, Settings, FileText, CheckSquare, Database } from 'lucide-react';

export default function Sidebar({ isOpen }) {
    const width = isOpen ? '240px' : '64px';

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: layers, label: 'Modules', path: '/modules' },
        { icon: Settings, label: 'Configuration', path: '/configuration' },
        { icon: FileText, label: 'Export', path: '/export' },
        { icon: Database, label: 'Assumptions', path: '/assumptions' },
        { icon: CheckSquare, label: 'Requirements', path: '/requirements' },
    ];

    return (
        <aside style={{
            width,
            background: 'var(--color-bg-sidebar)',
            color: 'var(--color-text-inverse)',
            height: '100vh',
            transition: 'width 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #334155' }}>
                <span style={{ fontWeight: 'bold', fontSize: isOpen ? '1.25rem' : '1.5rem' }}>
                    {isOpen ? 'ROM Tool' : 'R'}
                </span>
            </div>

            <nav style={{ flex: 1, padding: 'var(--space-md) 0' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            padding: 'var(--space-md) var(--space-lg)',
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            textDecoration: 'none',
                            background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent'
                        })}
                    >
                        <item.icon size={20} />
                        {isOpen && <span style={{ marginLeft: 'var(--space-md)' }}>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
