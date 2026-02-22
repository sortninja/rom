import React, { useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULE_DEFINITIONS } from '../data/modules';
import {
  calculateConveyanceHardwareCost,
  calculateRoboticsHardwareCost,
  calculateStorageInfrastructureCost,
  calculateControlsElectricalCost,
  calculateSoftwareSystemsCost,
  calculateImplementationServicesCost,
} from '../utils/costs';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function DashboardCard({ title, value, subtitle }) {
  return (
    <div className="card" style={{ minHeight: 130 }}>
      <div className="text-small text-muted" style={{ marginBottom: 'var(--space-xs)' }}>{title}</div>
      <div className="text-h1" style={{ marginBottom: 'var(--space-xs)' }}>{value}</div>
      {subtitle && <div className="text-small text-muted">{subtitle}</div>}
    </div>
  );
}

function HealthItem({ status, text }) {
  const color = status === 'warning' ? 'var(--color-warning)' : 'var(--color-success)';
  return (
    <div style={{ borderLeft: `4px solid ${color}`, background: 'var(--color-bg-body)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-sm) var(--space-md)' }}>
      <span className="text-body">{text}</span>
    </div>
  );
}

export default function Dashboard() {
  const { state } = useProject();

  const metrics = useMemo(() => {
    const selectedModuleIds = Object.values(state.modules)
      .filter((module) => module.selected)
      .map((module) => module.id);

    const selectedCount = selectedModuleIds.length;
    const totalCount = MODULE_DEFINITIONS.length;

    const sourcingCounts = selectedModuleIds.reduce(
      (acc, moduleId) => {
        const sourcing = state.modules[moduleId]?.sourcing;
        if (sourcing === 'Buyout') acc.buyout += 1;
        if (sourcing === 'In-House') acc.inHouse += 1;
        if (sourcing === 'Hybrid') acc.hybrid += 1;
        return acc;
      },
      { buyout: 0, inHouse: 0, hybrid: 0 }
    );

    const moduleData = state.moduleData;
    const costByModule = {
      robotic_systems: calculateRoboticsHardwareCost(moduleData.robotic_systems?.robots || []),
      conveyance: calculateConveyanceHardwareCost(moduleData.conveyance?.segments || []),
      storage: calculateStorageInfrastructureCost(moduleData.storage?.zones || []),
      controls: calculateControlsElectricalCost(moduleData.controls?.panels || []),
      software: calculateSoftwareSystemsCost(moduleData.software?.applications || []),
      implementation: calculateImplementationServicesCost(moduleData.implementation?.services || []),
    };

    const totalEstimate = Object.values(costByModule).reduce((sum, value) => sum + value, 0);

    const selectedModuleRows = MODULE_DEFINITIONS
      .filter((moduleDefinition) => selectedModuleIds.includes(moduleDefinition.id))
      .map((moduleDefinition) => ({
        id: moduleDefinition.id,
        name: moduleDefinition.name,
        sourcing: state.modules[moduleDefinition.id]?.sourcing || 'N/A',
        estimate: costByModule[moduleDefinition.id] || 0,
      }))
      .sort((a, b) => b.estimate - a.estimate);

    return {
      selectedCount,
      totalCount,
      sourcingCounts,
      totalEstimate,
      selectedModuleRows,
      assumptionCount: state.assumptions.length,
      requirementCount: state.requirements.length,
      missingRequirementsDoc: !state.requirementsDocument,
      hasNoRequirements: state.requirements.length === 0,
      hasNoAssumptions: state.assumptions.length === 0,
    };
  }, [state]);

  return (
    <div className="grid gap-md">
      <div>
        <h1 className="text-h1">Project Dashboard</h1>
        <p className="text-body text-muted" style={{ marginBottom: 0 }}>
          Quick snapshot of project scope, sourcing strategy, cost estimate, and planning maturity.
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
        <DashboardCard
          title="Modules Selected"
          value={`${metrics.selectedCount}/${metrics.totalCount}`}
          subtitle="Required modules are preselected"
        />
        <DashboardCard
          title="ROM Cost Estimate"
          value={formatCurrency(metrics.totalEstimate)}
          subtitle="Hardware + software + implementation"
        />
        <DashboardCard
          title="Assumptions Logged"
          value={metrics.assumptionCount}
          subtitle={metrics.assumptionCount ? 'Keep assumptions validated as scope evolves' : 'No assumptions captured yet'}
        />
        <DashboardCard
          title="Requirements Logged"
          value={metrics.requirementCount}
          subtitle={metrics.missingRequirementsDoc ? 'No requirements document uploaded' : 'Requirements document attached'}
        />
      </div>

      <div className="card">
        <h2 className="text-h2" style={{ marginTop: 0 }}>Project Health</h2>
        <div className="grid gap-md">
          <HealthItem
            status={metrics.hasNoRequirements ? 'warning' : 'ok'}
            text={metrics.hasNoRequirements ? 'No requirements captured yet — add at least one requirement.' : 'Requirements have been captured.'}
          />
          <HealthItem
            status={metrics.hasNoAssumptions ? 'warning' : 'ok'}
            text={metrics.hasNoAssumptions ? 'No assumptions logged yet — document key planning assumptions.' : 'Assumptions are documented.'}
          />
          <HealthItem
            status={metrics.missingRequirementsDoc ? 'warning' : 'ok'}
            text={metrics.missingRequirementsDoc ? 'No requirements source document uploaded yet.' : 'Requirements source document is attached.'}
          />
        </div>
      </div>

      <div className="card">
        <h2 className="text-h2" style={{ marginTop: 0 }}>Sourcing Mix</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md)' }}>
            <div className="text-small text-muted">In-House</div>
            <div className="text-h2">{metrics.sourcingCounts.inHouse}</div>
          </div>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md)' }}>
            <div className="text-small text-muted">Buyout</div>
            <div className="text-h2">{metrics.sourcingCounts.buyout}</div>
          </div>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md)' }}>
            <div className="text-small text-muted">Hybrid</div>
            <div className="text-h2">{metrics.sourcingCounts.hybrid}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-h2" style={{ marginTop: 0 }}>Selected Modules Cost Breakdown</h2>
        {metrics.selectedModuleRows.length === 0 ? (
          <p className="text-body text-muted" style={{ marginBottom: 0 }}>No optional modules selected.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}>Module</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}>Sourcing</th>
                  <th style={{ textAlign: 'right', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}>Estimate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.selectedModuleRows.map((row) => (
                  <tr key={row.id}>
                    <td style={{ borderBottom: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}>{row.name}</td>
                    <td style={{ borderBottom: '1px solid var(--color-border)', padding: 'var(--space-sm)' }}>{row.sourcing}</td>
                    <td style={{ borderBottom: '1px solid var(--color-border)', padding: 'var(--space-sm)', textAlign: 'right' }}>{formatCurrency(row.estimate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
