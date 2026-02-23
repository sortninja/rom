import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { MODULE_DEFINITIONS } from '../data/modules';
import { addQuoteTotal, calculateQuoteCostDetails, createEmptyQuote, formatCurrency, isProjectNumberInUse, normalizeQuote, sortQuotes, summarizeQuoteTotals, validateQuoteFields } from '../utils/quotes';

const STATUS_OPTIONS = ['working', 'complete'];
const PRICING_MODE_OPTIONS = ['manual', 'auto'];

export default function Dashboard() {
  const { state, dispatch } = useProject();
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(state.projectQuotes[0]?.id || null);
  const [newQuote, setNewQuote] = useState(() => createEmptyQuote());
  const [editQuote, setEditQuote] = useState(null);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('projectNumberAsc');

  const quotes = useMemo(() => state.projectQuotes.map((quote) => addQuoteTotal(quote, state.moduleData)), [state.moduleData, state.projectQuotes]);
  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch = !normalizedSearch
        || quote.projectNumber.toLowerCase().includes(normalizedSearch)
        || quote.projectName.toLowerCase().includes(normalizedSearch)
        || quote.sales.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [quotes, searchTerm, statusFilter]);
  const sortedQuotes = useMemo(() => sortQuotes(filteredQuotes, sortBy), [filteredQuotes, sortBy]);
  const filteredTotals = useMemo(() => summarizeQuoteTotals(sortedQuotes), [sortedQuotes]);
  const selectedQuote = useMemo(() => {
    const matchedQuote = state.projectQuotes.find((quote) => quote.id === selectedQuoteId);
    return matchedQuote ? normalizeQuote(matchedQuote) : null;
  }, [selectedQuoteId, state.projectQuotes]);

  const moduleNameById = useMemo(
    () => Object.fromEntries(MODULE_DEFINITIONS.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition.name])),
    []
  );

  const selectedQuoteCostDetails = useMemo(
    () => (selectedQuote ? calculateQuoteCostDetails(selectedQuote, state.moduleData) : null),
    [selectedQuote, state.moduleData]
  );

  useEffect(() => {
    setEditQuote(selectedQuote ? normalizeQuote(selectedQuote) : null);
  }, [selectedQuoteId, selectedQuote]);

  const handleCreateQuote = (event) => {
    event.preventDefault();

    const quoteFieldErrors = validateQuoteFields(newQuote);
    if (quoteFieldErrors.length > 0) {
      setCreateError(quoteFieldErrors[0]);
      return;
    }

    if (isProjectNumberInUse(state.projectQuotes, newQuote.projectNumber)) {
      setCreateError('Project # already exists. Please use a unique project number.');
      return;
    }

    const payload = {
      ...newQuote,
      inHouse: Number(newQuote.inHouse) || 0,
      buyout: Number(newQuote.buyout) || 0,
      services: Number(newQuote.services) || 0,
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

    if (isProjectNumberInUse(state.projectQuotes, editQuote.projectNumber, editQuote.id)) {
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
            <label><span className="text-small">Contract award</span><input name="contractAward" value={newQuote.contractAward} onChange={updateNewQuoteField} style={inputStyle} placeholder="MM/DD/YYYY" /></label>
            <label><span className="text-small">Go live</span><input name="goLive" value={newQuote.goLive} onChange={updateNewQuoteField} style={inputStyle} placeholder="MM/DD/YYYY" /></label>
            <label><span className="text-small">Quote due</span><input name="quoteDue" value={newQuote.quoteDue} onChange={updateNewQuoteField} style={inputStyle} placeholder="MM/DD/YYYY" /></label>
            <label>
              <span className="text-small">Status</span>
              <select name="status" value={newQuote.status} onChange={updateNewQuoteField} style={inputStyle}>
                {STATUS_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </label>
            <label>
              <span className="text-small">Pricing mode</span>
              <select name="pricingMode" value={newQuote.pricingMode} onChange={updateNewQuoteField} style={inputStyle}>
                {PRICING_MODE_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </label>
            <label><span className="text-small">In house</span><input name="inHouse" type="number" min="0" step="0.01" value={newQuote.inHouse} onChange={updateNewQuoteField} style={inputStyle} disabled={newQuote.pricingMode === 'auto'} /></label>
            <label><span className="text-small">Buyout</span><input name="buyout" type="number" min="0" step="0.01" value={newQuote.buyout} onChange={updateNewQuoteField} style={inputStyle} disabled={newQuote.pricingMode === 'auto'} /></label>
            <label><span className="text-small">Services</span><input name="services" type="number" min="0" step="0.01" value={newQuote.services} onChange={updateNewQuoteField} style={inputStyle} disabled={newQuote.pricingMode === 'auto'} /></label>
            <div className="flex items-end"><button type="submit" style={primaryButtonStyle}>Create Quote</button></div>
            {newQuote.pricingMode === 'auto' && <div className="text-small text-muted">Auto mode derives in-house/buyout/services from selected quote modules and current configuration data.</div>}
            {createError && <div style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{createError}</div>}
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
          <div className="card">
            <div className="flex items-center justify-between" style={{ gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
                <input
                  placeholder="Search by project #, name, or sales"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  style={{ ...inputStyle, marginTop: 0, width: 320 }}
                />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ ...inputStyle, marginTop: 0, width: 180 }}>
                  <option value="all">All statuses</option>
                  {STATUS_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
                </select>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={{ ...inputStyle, marginTop: 0, width: 210 }}>
                  <option value="projectNumberAsc">Sort: Project # (asc)</option>
                  <option value="totalDesc">Sort: Total (high to low)</option>
                  <option value="quoteDueAsc">Sort: Quote due (soonest)</option>
                </select>
                <button type="button" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSortBy('projectNumberAsc'); }} style={secondaryButtonStyle}>Clear</button>
              </div>
              <span className="text-small text-muted">Showing {sortedQuotes.length} of {quotes.length} quotes</span>
            </div>
          </div>

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
                  <th style={headerCell}>Pricing</th>
                  <th style={headerCellRight}>In house</th>
                  <th style={headerCellRight}>Buyout</th>
                  <th style={headerCellRight}>Services</th>
                  <th style={headerCellRight}>Total</th>
                  <th style={headerCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedQuotes.map((quote) => (
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
                    <td style={bodyCell}>{quote.pricingMode}</td>
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
                  <td style={totalsCell} colSpan={9}>Totals</td>
                  <td style={totalsCellRight}>{formatCurrency(filteredTotals.inHouse)}</td>
                  <td style={totalsCellRight}>{formatCurrency(filteredTotals.buyout)}</td>
                  <td style={totalsCellRight}>{formatCurrency(filteredTotals.services)}</td>
                  <td style={totalsCellRight}>{formatCurrency(filteredTotals.total)}</td>
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
                <label><span className="text-small">Pricing mode</span>
                  <select name="pricingMode" value={editQuote.pricingMode} onChange={updateEditQuoteField} style={inputStyle}>
                    {PRICING_MODE_OPTIONS.map((option) => (<option key={option} value={option}>{option}</option>))}
                  </select>
                </label>
                <label><span className="text-small">In house</span><input name="inHouse" type="number" min="0" step="0.01" value={editQuote.inHouse} onChange={updateEditQuoteField} style={inputStyle} disabled={editQuote.pricingMode === 'auto'} /></label>
                <label><span className="text-small">Buyout</span><input name="buyout" type="number" min="0" step="0.01" value={editQuote.buyout} onChange={updateEditQuoteField} style={inputStyle} disabled={editQuote.pricingMode === 'auto'} /></label>
                <label><span className="text-small">Services</span><input name="services" type="number" min="0" step="0.01" value={editQuote.services} onChange={updateEditQuoteField} style={inputStyle} disabled={editQuote.pricingMode === 'auto'} /></label>
                {editQuote.pricingMode === 'auto' && <div className="text-small text-muted">Auto mode derives in-house/buyout/services from selected quote modules and current configuration data.</div>}
                {editError && <div style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{editError}</div>}
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

          {selectedQuote && selectedQuote.pricingMode === 'auto' && selectedQuoteCostDetails && selectedQuoteCostDetails.moduleBreakdown.length > 0 && (
            <div className="card">
              <h2 className="text-h2" style={{ marginTop: 0 }}>Auto Pricing Breakdown</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={headerCell}>Module</th>
                      <th style={headerCellRight}>In house</th>
                      <th style={headerCellRight}>Buyout</th>
                      <th style={headerCellRight}>Services</th>
                      <th style={headerCellRight}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuoteCostDetails.moduleBreakdown.map((row) => (
                      <tr key={row.moduleId}>
                        <td style={bodyCell}>{moduleNameById[row.moduleId] || row.moduleId}</td>
                        <td style={bodyCellRight}>{formatCurrency(row.inHouse)}</td>
                        <td style={bodyCellRight}>{formatCurrency(row.buyout)}</td>
                        <td style={bodyCellRight}>{formatCurrency(row.services)}</td>
                        <td style={bodyCellRight}>{formatCurrency(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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


const secondaryButtonStyle = {
  border: '1px solid var(--color-primary)',
  color: 'var(--color-primary)',
  background: '#fff',
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
