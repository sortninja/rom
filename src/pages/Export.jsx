import React from 'react';
import ProjectExport from '../components/ProjectExport';

export default function Export() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-h1">Project Export</h1>
                <p className="text-body text-muted">Export your project data and generate summary reports.</p>
            </div>
            <ProjectExport />
        </div>
    );
}