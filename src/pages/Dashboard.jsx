import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { MODULE_DEFINITIONS } from '../data/modules';
import { addQuoteTotal, createEmptyQuote, formatCurrency, summarizeQuoteTotals } from '../utils/quotes';

const STATUS_OPTIONS = ['working', 'complete'];

export default function Dashboard() {
  const { state, dispatch } = useProject();
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(state.projectQuotes[0]?.id || null);
  const [newQuote, setNewQuote] = useState(() => createEmptyQuote());
  const [editQuote, setEditQuote] = useState(null);

  const quotes = useMemo(() => state.projectQuotes.map(addQuoteTotal), [state.projectQuotes]);
  const totals = useMemo(() => summarizeQuoteTotals(quotes), [quotes]);
  const selectedQuote = useMemo(() => state.projectQuotes.find((quote) => quote.id === selectedQuoteId) || null, [selectedQuoteId, state.projectQuotes]);

  useEffect(() => {
    setEditQuote(selectedQuote ? { ...selectedQuote } : null);
  }, [selectedQuoteId, selectedQuote]);

  const handleCreateQuote = (event) => {
    event.preventDefault();

    const payload = {
      ...newQuote,
      inHouse: Number(newQuote.inHouse) || 0,
      buyout: Number(newQuote.buyout) || 0,
      services: Number(newQuote.services) || 0,
    };

    dispatch({ type: 'ADD_PROJECT_QUOTE', payload });
    setSelectedQuoteId(payload.id);
    setShowNewQuoteForm(false);
    setNewQuote(createEmptyQuote());
  };

  const updateNewQuoteField = (event) => {
    const { name, value } = event.target;
    setNewQuote((prev) => ({ ...prev, [name]: value }));
  };

  const updateEditQuoteField = (event) => {
    const { name, value } = event.target;
    setEditQuote((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditedQuote = (event) => {
    event.preventDefault();
    if (!editQuote?.id) return;

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
  };

  const removeQuote = (quoteId) => {
    dispatch({ type: 'REMOVE_PROJECT_QUOTE', payload: quoteId });
    if (selectedQuoteId === quoteId) {
      const remaining = state.projectQuotes.filter((quote) => quote.id !== quoteId);
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
  };

  const setQuoteModuleSourcing = (quoteId, moduleId, sourcing) => {
    dispatch({
      type: 'SET_PROJECT_QUOTE_MODULE_SOURCING',
      payload: { quoteId, moduleId, sourcing },
    });
  };

  return (
    <div className="grid gap-md">
      <div className="flex items-center justify-between" style={{ gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <div>
          <h1 className="text-h1">Quote Pipeline Dashboard</h1>
          <p className="text-body text-muted" style={{ marginBottom: 0 }}>
            Track working/completed quotes and manage quote-specific module associations.
          </p>
        </div>
        <button type="button" onClick={() => setShowNewQuoteForm((prev) => !prev)} className="flex items-center gap-sm" style={primaryButtonStyle}>
          <Plus size={16} />
          {showNewQuoteForm ? 'Close Form' : 'New Quote'}
        </button>
      </div>

      {showNewQuoteForm && (
        <div className="card">
          <h2 className="text-h2" style={{ marginTop: 0 }}>Create Quote</h2>
          <form onSubmit={handleCreateQuote} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
            <label><span className="text-small">Project #</span><input name="projectNumber" value={newQuote.projectNumber} onChange={updateNewQuoteField} style={inputStyle} required /></label>
            <label><span className="text-small">Project name</span><input name="projectName" value={newQuote.projectName} onChange={updateNewQuoteField} style={inputStyle} required /></label>
            <label><span className="text-small">Sales</span><input name="sales" value={newQuote.sales} onChange={updateNewQuoteField} style={inputStyle} required /></label>
            <label><span className="text-small">Lead engineer</span><input name="leadEngineer" value={newQuote.leadEngineer} onChange={updateNewQuoteField} style={inputStyle} required /></label>
            <label><span className="text-small">Contract award</span><input name="contractAward" value={newQuote.contractAward} onChange={updateNewQuoteField} style={inputStyle} placeholder="mm/dd//yyyy" /></label>
            <label><span className="text-small">Go live</span><input name="goLive" value={newQuote.goLive} onChange={updateNewQuoteField} style={inputStyle} placeholder="mm/dd//yyyy" /></label>
            <label><span className="text-small">Quote due</span><input name="quoteDue" value={newQuote.quoteDue} onChange={updateNewQuoteField} style={inputStyle} placeholder="mm/dd//yyyy" /></label>
            <label>
              <span className="text-small">Status</span>
              <select name="status" value={newQuote.status} onChange={updateNewQuoteField} style={inputStyle}>
                {STATUS_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </label>
            <label><span className="text-small">In house</span><input name="inHouse" type="number" min="0" step="0.01" value={newQuote.inHouse} onChange={updateNewQuoteField} style={inputStyle} /></label>
            <label><span className="text-small">Buyout</span><input name="buyout" type="number" min="0" step="0.01" value={newQuote.buyout} onChange={updateNewQuoteField} style={inputStyle} /></label>
            <label><span className="text-small">Services</span><input name="services" type="number" min="0" step="0.01" value={newQuote.services} onChange={updateNewQuoteField} style={inputStyle} /></label>
            <div className="flex items-end"><button type="submit" style={primaryButtonStyle}>Create Quote</button></div>
          </form>
        </div>
      )}

      {showNewQuoteForm && selectedQuote && (
        <QuoteModulesPanel
          selectedQuote={selectedQuote}
          toggleQuoteModule={toggleQuoteModule}
          setQuoteModuleSourcing={setQuoteModuleSourcing}
        />
      )}

      {!showNewQuoteForm && (
        <>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1220 }}>
              <thead>
                <tr>
                  <th style={headerCell}>Project #</th>
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
                  <th style={headerCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} style={selectedQuoteId === quote.id ? highlightedRowStyle : undefined}>
                    <td style={bodyCell}>
                      <button type="button" onClick={() => setSelectedQuoteId(quote.id)} style={jobNumberButtonStyle}>{quote.projectNumber}</button>
                    </td>
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
                    <td style={bodyCell}>
                      <button type="button" onClick={() => removeQuote(quote.id)} style={iconDangerButton} aria-label="Delete quote">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={totalsCell} colSpan={8}>Totals</td>
                  <td style={totalsCellRight}>{formatCurrency(totals.inHouse)}</td>
                  <td style={totalsCellRight}>{formatCurrency(totals.buyout)}</td>
                  <td style={totalsCellRight}>{formatCurrency(totals.services)}</td>
                  <td style={totalsCellRight}>{formatCurrency(totals.total)}</td>
                  <td style={totalsCell} />
                </tr>
              </tbody>
            </table>
          </div>

          {editQuote && (
            <div className="card">
              <div className="flex items-center justify-between" style={{ gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <h2 className="text-h2" style={{ marginTop: 0, marginBottom: 0 }}>Edit Quote #{editQuote.projectNumber}</h2>
                <button type="button" onClick={saveEditedQuote} className="flex items-center gap-sm" style={primaryButtonStyle}>
                  <Save size={16} />
                  Save Quote
                </button>
              </div>
              <form onSubmit={saveEditedQuote} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                <label><span className="text-small">Project #</span><input name="projectNumber" value={editQuote.projectNumber} onChange={updateEditQuoteField} style={inputStyle} required /></label>
                <label><span className="text-small">Project name</span><input name="projectName" value={editQuote.projectName} onChange={updateEditQuoteField} style={inputStyle} required /></label>
                <label><span className="text-small">Sales</span><input name="sales" value={editQuote.sales} onChange={updateEditQuoteField} style={inputStyle} required /></label>
                <label><span className="text-small">Lead engineer</span><input name="leadEngineer" value={editQuote.leadEngineer} onChange={updateEditQuoteField} style={inputStyle} required /></label>
                <label><span className="text-small">Contract award</span><input name="contractAward" value={editQuote.contractAward} onChange={updateEditQuoteField} style={inputStyle} /></label>
                <label><span className="text-small">Go live</span><input name="goLive" value={editQuote.goLive} onChange={updateEditQuoteField} style={inputStyle} /></label>
                <label><span className="text-small">Quote due</span><input name="quoteDue" value={editQuote.quoteDue} onChange={updateEditQuoteField} style={inputStyle} /></label>
                <label><span className="text-small">Status</span>
                  <select name="status" value={editQuote.status} onChange={updateEditQuoteField} style={inputStyle}>
                    {STATUS_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
                  </select>
                </label>
                <label><span className="text-small">In house</span><input name="inHouse" type="number" min="0" step="0.01" value={editQuote.inHouse} onChange={updateEditQuoteField} style={inputStyle} /></label>
                <label><span className="text-small">Buyout</span><input name="buyout" type="number" min="0" step="0.01" value={editQuote.buyout} onChange={updateEditQuoteField} style={inputStyle} /></label>
                <label><span className="text-small">Services</span><input name="services" type="number" min="0" step="0.01" value={editQuote.services} onChange={updateEditQuoteField} style={inputStyle} /></label>
              </form>
            </div>
          )}

          {selectedQuote && (
            <QuoteModulesPanel
              selectedQuote={selectedQuote}
              toggleQuoteModule={toggleQuoteModule}
              setQuoteModuleSourcing={setQuoteModuleSourcing}
            />
          )}
        </>
      )}
    </div>
  );
}

function QuoteModulesPanel({ selectedQuote, toggleQuoteModule, setQuoteModuleSourcing }) {
  return (
    <div className="card">
      <h2 className="text-h2" style={{ marginTop: 0 }}>Quote Modules for Job #{selectedQuote.projectNumber}</h2>
      <p className="text-small text-muted" style={{ marginTop: 0 }}>Module assignment for the currently selected quote.</p>
      <div className="grid gap-md">
        {MODULE_DEFINITIONS.map((moduleDefinition) => {
          const quoteModule = selectedQuote.modules?.[moduleDefinition.id];
          const selected = Boolean(quoteModule?.selected);
          const selectedSourcing = quoteModule?.sourcing || moduleDefinition.defaultSourcing || moduleDefinition.sourcingOptions[0];

          return (
            <div key={moduleDefinition.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md)' }}>
              <div className="flex items-center justify-between" style={{ gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <label className="flex items-center gap-sm" style={{ fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => toggleQuoteModule(selectedQuote.id, moduleDefinition, event.target.checked)}
                  />
                  {moduleDefinition.name}
                </label>
                {selected && (
                  <select
                    value={selectedSourcing}
                    onChange={(event) => setQuoteModuleSourcing(selectedQuote.id, moduleDefinition.id, event.target.value)}
                    style={{ ...inputStyle, width: 200, marginTop: 0 }}
                  >
                    {moduleDefinition.sourcingOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
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

const iconDangerButton = {
  border: '1px solid var(--color-danger)',
  color: 'var(--color-danger)',
  background: '#fff',
  borderRadius: 'var(--radius-sm)',
  padding: '4px 8px',
  cursor: 'pointer',
};

const inputStyle = {
  width: '100%',
  marginTop: 'var(--space-xs)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  padding: 'var(--space-sm)',
};

const jobNumberButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: 'var(--color-primary)',
  textDecoration: 'underline',
  cursor: 'pointer',
  padding: 0,
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
