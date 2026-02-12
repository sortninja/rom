import React from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULE_DEFINITIONS } from '../data/modules';
import { Download, FileText } from 'lucide-react';

export default function ProjectExport() {
    const { state } = useProject();
    const { projectInfo, modules, moduleData, assumptions, requirements, requirementsDocument } = state;

    const generateProjectSummary = () => {
        const selectedModules = MODULE_DEFINITIONS.filter(m => modules[m.id]);

        const summary = {
            projectInfo,
            selectedModules: selectedModules.map(module => ({
                id: module.id,
                name: module.name,
                sourcing: modules[module.id]?.sourcing,
                data: moduleData[module.id] || {}
            })),
            totalModules: selectedModules.length,
            assumptions,
            requirements,
            requirementsDocument,
            sourcingBreakdown: {
                buyout: selectedModules.filter(m => modules[m.id]?.sourcing === 'Buyout').length,
                inHouse: selectedModules.filter(m => modules[m.id]?.sourcing === 'In-House').length,
                hybrid: selectedModules.filter(m => modules[m.id]?.sourcing === 'Hybrid').length
            }
        };

        return summary;
    };

    const exportToJSON = () => {
        const summary = generateProjectSummary();
        const dataStr = JSON.stringify(summary, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectInfo.name.replace(/\s+/g, '_')}_ROM_Export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const exportToCSV = () => {
        const selectedModules = MODULE_DEFINITIONS.filter(m => modules[m.id]);

        let csvContent = 'Module Name,Sourcing Strategy,Status,Notes\n';

        selectedModules.forEach(module => {
            const sourcing = modules[module.id]?.sourcing || 'Not specified';
            const hasData = moduleData[module.id] && Object.keys(moduleData[module.id]).length > 0;
            const status = hasData ? 'Configured' : 'Pending Configuration';
            const notes = module.required ? 'Required module' : 'Optional module';

            csvContent += `"${module.name}","${sourcing}","${status}","${notes}"\n`;
        });

        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectInfo.name.replace(/\s+/g, '_')}_ROM_Summary_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const generateCostEstimate = () => {
        let totalCost = 0;
        const costBreakdown = {};

        // Robotic Systems Cost
        if (moduleData.robotic_systems?.robots) {
            const robotCost = moduleData.robotic_systems.robots.reduce((sum, robot) =>
                sum + (robot.quantity * robot.unitCost), 0);
            totalCost += robotCost;
            costBreakdown.robotic_systems = robotCost;
        }

        // Conveyance Systems Cost
        if (moduleData.conveyance?.segments) {
            const conveyanceCost = moduleData.conveyance.segments.reduce((sum, segment) => {
                const costPerFoot = segment.type === 'MDR' ? 350 : segment.type === 'Gravity' ? 100 : 500;
                return sum + (segment.length * costPerFoot);
            }, 0);
            totalCost += conveyanceCost;
            costBreakdown.conveyance = conveyanceCost;
        }

        // Storage Infrastructure Cost
        if (moduleData.storage?.zones) {
            const storageCost = moduleData.storage.zones.reduce((sum, zone) => {
                const costPerPos = zone.type === 'Selective Racking' ? 60 : zone.type === 'Push Back' ? 120 : 40;
                return sum + (zone.positions * costPerPos);
            }, 0);
            totalCost += storageCost;
            costBreakdown.storage = storageCost;
        }

        // Controls & Electrical Cost
        if (moduleData.controls?.panels) {
            const controlsCost = moduleData.controls.panels.reduce((sum, panel) =>
                sum + (panel.quantity * panel.unitCost), 0);
            totalCost += controlsCost;
            costBreakdown.controls = controlsCost;
        }

        // Software Systems Cost
        if (moduleData.software?.applications) {
            const softwareCost = moduleData.software.applications.reduce((sum, application) =>
                sum + application.annualCost, 0);
            totalCost += softwareCost;
            costBreakdown.software = softwareCost;
        }

        // Implementation Services Cost
        if (moduleData.implementation?.services) {
            const implementationCost = moduleData.implementation.services.reduce((sum, service) =>
                sum + (service.hours * service.hourlyRate), 0);
            totalCost += implementationCost;
            costBreakdown.implementation = implementationCost;
        }

        return { total: totalCost, breakdown: costBreakdown };
    };

    const summary = generateProjectSummary();
    const costEstimate = generateCostEstimate();

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-h2">Project Export & Summary</h2>
                <div className="flex gap-md">
                    <button
                        onClick={exportToJSON}
                        className="flex items-center gap-xs"
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--space-sm) var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer'
                        }}
                    >
                        <Download size={16} />
                        Export JSON
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-xs"
                        style={{
                            background: 'var(--color-success)',
                            color: 'white',
                            border: 'none',
                            padding: 'var(--space-sm) var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer'
                        }}
                    >
                        <FileText size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid gap-lg" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div>
                    <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Project Overview</h3>
                    <div className="card" style={{ background: 'var(--color-bg-body)' }}>
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <strong>Project Name:</strong> {projectInfo.name}
                        </div>
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <strong>Project Lead:</strong> {projectInfo.lead || 'Not assigned'}
                        </div>
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <strong>Status:</strong> {projectInfo.status}
                        </div>
                        <div>
                            <strong>Total Modules:</strong> {summary.totalModules}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Sourcing Strategy</h3>
                    <div className="card" style={{ background: 'var(--color-bg-body)' }}>
                        <div style={{ marginBottom: 'var(--space-sm)' }}>
                            <strong>Buyout:</strong> {summary.sourcingBreakdown.buyout} modules
                        </div>
                        <div style={{ marginBottom: 'var(--space-sm)' }}>
                            <strong>In-House:</strong> {summary.sourcingBreakdown.inHouse} modules
                        </div>
                        <div>
                            <strong>Hybrid:</strong> {summary.sourcingBreakdown.hybrid} modules
                        </div>
                    </div>
                </div>
            </div>

            {costEstimate.total > 0 && (
                <div className="mt-lg">
                    <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Cost Estimate</h3>
                    <div className="card" style={{ background: 'var(--color-bg-body)' }}>
                        <div className="flex justify-between items-center mb-md">
                            <strong>Total Estimated Cost:</strong>
                            <span className="text-h2" style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>
                                ${costEstimate.total.toLocaleString()}
                            </span>
                        </div>

                        {Object.entries(costEstimate.breakdown).map(([module, cost]) => (
                            <div key={module} className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
                                <span>{module.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                                <span>${cost.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}



            <div className="mt-lg grid gap-lg" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div>
                    <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Assumptions</h3>
                    <div className="card" style={{ background: 'var(--color-bg-body)' }}>
                        <div style={{ marginBottom: 'var(--space-sm)' }}><strong>Total:</strong> {assumptions.length}</div>
                        {assumptions.length === 0 ? (
                            <span className="text-small">No assumptions captured.</span>
                        ) : (
                            assumptions.slice(0, 3).map((assumption) => (
                                <div key={assumption.id} className="text-small" style={{ marginBottom: 'var(--space-xs)' }}>
                                    • {assumption.statement}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Requirements</h3>
                    <div className="card" style={{ background: 'var(--color-bg-body)' }}>
                        <div style={{ marginBottom: 'var(--space-sm)' }}><strong>Total:</strong> {requirements.length}</div>
                        <div className="text-small" style={{ marginBottom: 'var(--space-sm)' }}>
                            <strong>Document:</strong> {requirementsDocument?.name || 'None uploaded'}
                        </div>
                        {requirements.length === 0 ? (
                            <span className="text-small">No requirements captured.</span>
                        ) : (
                            requirements.slice(0, 3).map((requirement) => (
                                <div key={requirement.id} className="text-small" style={{ marginBottom: 'var(--space-xs)' }}>
                                    • {requirement.text}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-lg">
                <h3 className="text-h2" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>Selected Modules</h3>
                <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                    {summary.selectedModules.map(module => (
                        <div key={module.id} className="card" style={{ background: 'var(--color-bg-body)' }}>
                            <h4 style={{ margin: '0 0 var(--space-sm) 0' }}>{module.name}</h4>
                            <div className="text-small" style={{ marginBottom: 'var(--space-xs)' }}>
                                <strong>Sourcing:</strong> {module.sourcing}
                            </div>
                            <div className="text-small">
                                <strong>Status:</strong> {Object.keys(module.data).length > 0 ? 'Configured' : 'Pending Configuration'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}