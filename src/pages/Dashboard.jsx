import React, { useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { MODULE_DEFINITIONS } from '../data/modules';
import { calculateConveyanceHardwareCost, calculateRoboticsHardwareCost, calculateStorageInfrastructureCost, calculateControlsElectricalCost, calculateSoftwareSystemsCost, calculateImplementationServicesCost } from '../utils/costs';

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
    const roboticsCost = calculateRoboticsHardwareCost(moduleData.robotic_systems?.robots || []);
    const conveyanceCost = calculateConveyanceHardwareCost(moduleData.conveyance?.segments || []);
    const storageCost = calculateStorageInfrastructureCost(moduleData.storage?.zones || []);
    const controlsCost = calculateControlsElectricalCost(moduleData.controls?.panels || []);
    const softwareAnnualCost = calculateSoftwareSystemsCost(moduleData.software?.applications || []);
    const implementationCost = calculateImplementationServicesCost(moduleData.implementation?.services || []);

    const totalEstimate = roboticsCost + conveyanceCost + storageCost + controlsCost + softwareAnnualCost + implementationCost;

    return {
      selectedCount,
      totalCount,
      sourcingCounts,
      totalEstimate,
      assumptionCount: state.assumptions.length,
      requirementCount: state.requirements.length,
      missingRequirementsDoc: !state.requirementsDocument,
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
    </div>
  );
}
