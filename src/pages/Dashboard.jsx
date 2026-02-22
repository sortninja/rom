import React, { useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  SAMPLE_QUOTES,
  addQuoteTotal,
  buildQuoteFromProjectState,
  formatCurrency,
  summarizeQuoteTotals,
} from '../utils/quotes';

const STATUS_OPTIONS = ['working', 'complete'];

export default function Dashboard() {
  const { state, dispatch } = useProject();

  const { quotes, totals, currentProjectQuote } = useMemo(() => {
    const derivedCurrentProjectQuote = addQuoteTotal(buildQuoteFromProjectState(state));
    const rows = [...SAMPLE_QUOTES.map(addQuoteTotal), { ...derivedCurrentProjectQuote, isCurrentProject: true }];
    return {
      currentProjectQuote: derivedCurrentProjectQuote,
      quotes: rows,
      totals: summarizeQuoteTotals(rows),
    };
  }, [state]);

  const updateProjectInfo = (event) => {
    const { name, value } = event.target;
    dispatch({
      type: 'SET_PROJECT_INFO',
      payload: { [name]: value },
    });
  };

  return (
    <div className="grid gap-md">
      <div>
        <h1 className="text-h1">Quote Pipeline Dashboard</h1>
        <p className="text-body text-muted" style={{ marginBottom: 0 }}>
          Working and completed quote portfolio with in-house, buyout, and service totals.
        </p>
      </div>

      <div className="card">
        <h2 className="text-h2" style={{ marginTop: 0 }}>Current Project Quote Details</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
          <label>
            <span className="text-small">Project name</span>
            <input name="name" value={state.projectInfo.name} onChange={updateProjectInfo} style={inputStyle} />
          </label>
          <label>
            <span className="text-small">Sales</span>
            <input name="sales" value={state.projectInfo.sales || ''} onChange={updateProjectInfo} style={inputStyle} />
          </label>
          <label>
            <span className="text-small">Lead engineer</span>
            <input name="lead" value={state.projectInfo.lead || ''} onChange={updateProjectInfo} style={inputStyle} />
          </label>
          <label>
            <span className="text-small">Contract award</span>
            <input name="contractAward" value={state.projectInfo.contractAward || ''} onChange={updateProjectInfo} style={inputStyle} placeholder="mm/dd//yyyy" />
          </label>
          <label>
            <span className="text-small">Go live</span>
            <input name="goLive" value={state.projectInfo.goLive || ''} onChange={updateProjectInfo} style={inputStyle} placeholder="mm/dd//yyyy" />
          </label>
          <label>
            <span className="text-small">Quote due</span>
            <input name="quoteDue" value={state.projectInfo.quoteDue || ''} onChange={updateProjectInfo} style={inputStyle} placeholder="mm/dd//yyyy" />
          </label>
          <label>
            <span className="text-small">Status</span>
            <select name="status" value={currentProjectQuote.status} onChange={updateProjectInfo} style={inputStyle}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1140 }}>
          <thead>
            <tr>
              <th style={headerCell}>Project name</th>
              <th style={headerCell}>Sales</th>
              <th style={headerCell}>Lead engineer</th>
              <th style={headerCell}>Contract award</th>
              <th style={headerCell}>Go live</th>
              <th style={headerCell}>Quote due</th>
              <th style={headerCell}>Status</th>
              <th style={headerCellRight}>In house</th>
              <th style={headerCellRight}>Buyout</th>
              <th style={headerCellRight}>Services</th>
              <th style={headerCellRight}>Total</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote, index) => (
              <tr key={`${quote.projectName}-${quote.sales}-${index}`} style={quote.isCurrentProject ? highlightedRowStyle : undefined}>
                <td style={bodyCell}>{quote.projectName}</td>
                <td style={bodyCell}>{quote.sales}</td>
                <td style={bodyCell}>{quote.leadEngineer}</td>
                <td style={bodyCell}>{quote.contractAward}</td>
                <td style={bodyCell}>{quote.goLive}</td>
                <td style={bodyCell}>{quote.quoteDue}</td>
                <td style={bodyCell}>{quote.status}</td>
                <td style={bodyCellRight}>{formatCurrency(quote.inHouse)}</td>
                <td style={bodyCellRight}>{formatCurrency(quote.buyout)}</td>
                <td style={bodyCellRight}>{formatCurrency(quote.services)}</td>
                <td style={bodyCellRight}>{formatCurrency(quote.total)}</td>
              </tr>
            ))}
            <tr>
              <td style={totalsCell} colSpan={7}>Totals</td>
              <td style={totalsCellRight}>{formatCurrency(totals.inHouse)}</td>
              <td style={totalsCellRight}>{formatCurrency(totals.buyout)}</td>
              <td style={totalsCellRight}>{formatCurrency(totals.services)}</td>
              <td style={totalsCellRight}>{formatCurrency(totals.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  marginTop: 'var(--space-xs)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  padding: 'var(--space-sm)',
};

const highlightedRowStyle = {
  background: 'rgba(37, 99, 235, 0.08)',
};

const headerCell = {
  textAlign: 'left',
  borderBottom: '1px solid var(--color-border)',
  padding: 'var(--space-sm)',
};

const headerCellRight = {
  ...headerCell,
  textAlign: 'right',
};

const bodyCell = {
  borderBottom: '1px solid var(--color-border)',
  padding: 'var(--space-sm)',
};

const bodyCellRight = {
  ...bodyCell,
  textAlign: 'right',
};

const totalsCell = {
  ...bodyCell,
  fontWeight: 700,
};

const totalsCellRight = {
  ...bodyCellRight,
  fontWeight: 700,
};
