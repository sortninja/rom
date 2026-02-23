import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import {
  SAMPLE_QUOTES,
  addQuoteTotal,
  buildQuoteFromProjectState,
  formatCurrency,
  summarizeQuoteTotals,
} from '../utils/quotes';

export default function Dashboard() {
  const { state } = useProject();

  const { quotes, totals } = useMemo(() => {
    const currentProjectQuote = addQuoteTotal(buildQuoteFromProjectState(state));
    const rows = [...SAMPLE_QUOTES.map(addQuoteTotal), currentProjectQuote];
    return {
      quotes: rows,
      totals: summarizeQuoteTotals(rows),
    };

    dispatch({ type: 'ADD_PROJECT_QUOTE', payload });
    setCreateError('');
    setSelectedQuoteId(payload.id);
    setShowNewQuoteForm(false);
    setNewQuote(createEmptyQuote());
  };

  const updateNewQuoteField = (event) => {
    const { name, value } = event.target;
    setCreateError('');
    setNewQuote((prev) => ({ ...prev, [name]: value }));
  };

  const updateEditQuoteField = (event) => {
    const { name, value } = event.target;
    setEditError('');
    setEditQuote((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditedQuote = (event) => {
    event.preventDefault();
    if (!editQuote?.id) return;

    const quoteFieldErrors = validateQuoteFields(editQuote);
    if (quoteFieldErrors.length > 0) {
      setEditError(quoteFieldErrors[0]);
      return;
    }

    if (isProjectNumberInUse(projectQuotes, editQuote.projectNumber, editQuote.id)) {
      setEditError('Project # already exists. Please use a unique project number.');
      return;
    }

    dispatch({
      type: 'UPDATE_PROJECT_QUOTE',
      payload: {
        id: editQuote.id,
        updates: {
          ...editQuote,
          inHouse: Number(editQuote.inHouse) || 0,
          buyout: Number(editQuote.buyout) || 0,
          services: Number(editQuote.services) || 0,
        },
      },
    });
    setEditError('');
  };

  const removeQuote = (quoteId) => {
    const confirmed = window.confirm('Delete this quote? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    dispatch({ type: 'REMOVE_PROJECT_QUOTE', payload: quoteId });
    if (selectedQuoteId === quoteId) {
      const remaining = projectQuotes.filter((quote) => quote.id !== quoteId);
      setSelectedQuoteId(remaining[0]?.id || null);
    }
  };

  const toggleQuoteModule = (quoteId, moduleDefinition, isSelected) => {
    dispatch({
      type: 'TOGGLE_PROJECT_QUOTE_MODULE',
      payload: {
        quoteId,
        moduleId: moduleDefinition.id,
        isSelected,
        defaultSourcing: moduleDefinition.defaultSourcing || moduleDefinition.sourcingOptions[0] || 'In-House',
      },
    });
    setEditError('');
  };

  const setQuoteModuleSourcing = (quoteId, moduleId, sourcing) => {
    dispatch({
      type: 'SET_PROJECT_QUOTE_MODULE_SOURCING',
      payload: { quoteId, moduleId, sourcing },
    });
    setEditError('');
  };

  return (
    <div className="grid gap-md">
      <div>
        <h1 className="text-h1">Quote Pipeline Dashboard</h1>
        <p className="text-body text-muted" style={{ marginBottom: 0 }}>
          Working and completed quote portfolio with in-house, buyout, and service totals.
        </p>
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
            {quotes.map((quote) => (
              <tr key={`${quote.projectName}-${quote.sales}`}>
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
