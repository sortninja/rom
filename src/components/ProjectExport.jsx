import React, { useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { AlertTriangle, Download, FileText, RotateCcw } from 'lucide-react';
import {
  addQuoteTotal,
  formatCurrency,
  summarizeQuoteTotals,
} from '../utils/quotes';

export default function ProjectExport() {
  const { state, resetProjectState } = useProject();

  const quotePortfolio = useMemo(() => {
    const rows = state.projectQuotes.map(addQuoteTotal);

    return {
      rows,
      totals: summarizeQuoteTotals(rows),
    };
  }, [state.projectQuotes]);

  const exportToJSON = () => {
    const data = {
      projectInfo: state.projectInfo,
      assumptions: state.assumptions,
      requirements: state.requirements,
      requirementsDocument: state.requirementsDocument,
      quotePortfolioRows: quotePortfolio.rows,
      quotePortfolioTotals: quotePortfolio.totals,
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.projectInfo.name.replace(/\s+/g, '_')}_ROM_Export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = [
      'Project #',
      'Project name',
      'Sales',
      'Lead engineer',
      'Contract award',
      'Go live',
      'Quote due',
      'Status',
      'In house',
      'Buyout',
      'Services',
      'Total',
    ];

    const rowToCsv = (row) => (
      [
        row.projectNumber,
        row.projectName,
        row.sales,
        row.leadEngineer,
        row.contractAward,
        row.goLive,
        row.quoteDue,
        row.status,
        row.inHouse,
        row.buyout,
        row.services,
        row.total,
      ]
        .map((value) => `"${value}"`)
        .join(',')
    );

    const rows = quotePortfolio.rows.map(rowToCsv);
    rows.push(`"Totals","","","","","","","","${quotePortfolio.totals.inHouse}","${quotePortfolio.totals.buyout}","${quotePortfolio.totals.services}","${quotePortfolio.totals.total}"`);

    const csvContent = `${headers.join(',')}\n${rows.join('\n')}\n`;

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.projectInfo.name.replace(/\s+/g, '_')}_ROM_Quote_Portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleResetLocalData = () => {
    const confirmed = window.confirm('Reset all locally saved ROM project data? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    resetProjectState();
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6" style={{ gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <h2 className="text-h2">Project Export & Quote Portfolio</h2>
        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <button onClick={exportToJSON} className="flex items-center gap-sm" style={primaryButtonStyle}>
            <FileText size={16} />
            Export JSON
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-sm" style={secondaryButtonStyle}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1140 }}>
          <thead>
            <tr>
              {['Project #', 'Project name', 'Sales', 'Lead engineer', 'Contract award', 'Go live', 'Quote due', 'Status'].map((heading) => (
                <th key={heading} style={headerCell}>{heading}</th>
              ))}
              {['In house', 'Buyout', 'Services', 'Total'].map((heading) => (
                <th key={heading} style={headerCellRight}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotePortfolio.rows.map((quote) => (
              <tr key={quote.id}>
                <td style={bodyCell}>{quote.projectNumber}</td>
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
              <td style={totalsCell} colSpan={8}>Totals</td>
              <td style={totalsCellRight}>{formatCurrency(quotePortfolio.totals.inHouse)}</td>
              <td style={totalsCellRight}>{formatCurrency(quotePortfolio.totals.buyout)}</td>
              <td style={totalsCellRight}>{formatCurrency(quotePortfolio.totals.services)}</td>
              <td style={totalsCellRight}>{formatCurrency(quotePortfolio.totals.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-lg">
        <div className="card" style={{ background: 'var(--color-bg-body)' }}>
          <div className="flex justify-between items-center" style={{ gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <div className="flex items-center gap-sm">
              <AlertTriangle size={16} color="var(--color-warning)" />
              <span className="text-small">Reset clears locally persisted data and restores ROM defaults.</span>
            </div>
            <button onClick={handleResetLocalData} className="flex items-center gap-xs" style={dangerButtonStyle}>
              <RotateCcw size={14} />
              Reset Local Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const primaryButtonStyle = {
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-sm) var(--space-md)',
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  border: '1px solid var(--color-primary)',
  color: 'var(--color-primary)',
  background: '#fff',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-sm) var(--space-md)',
  cursor: 'pointer',
};

const dangerButtonStyle = {
  border: '1px solid var(--color-danger)',
  color: 'var(--color-danger)',
  background: '#fff',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-sm) var(--space-md)',
  cursor: 'pointer',
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
