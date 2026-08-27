import { useEffect, useState } from 'react'
import { accountsApi, ApiRequestError } from './api'
import type { AccountsResponse, Provider, StatusFilter } from './types'
import './App.css'

function App() {
  const [data, setData] = useState<AccountsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('ALL')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [providerQuery, setProviderQuery] = useState('')
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [removingProviderId, setRemovingProviderId] = useState<string | null>(null)
  const [statementAccountId, setStatementAccountId] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [statementDate, setStatementDate] = useState('')
  const [isSavingStatement, setIsSavingStatement] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [statementError, setStatementError] = useState<string | null>(null)

  useEffect(() => {
    accountsApi.getAccounts()
      .then(setData)
      .catch((reason: unknown) => {
        setError(reason instanceof ApiRequestError ? reason.message : 'Unable to load your accounts.')
      })
  }, [])

  useEffect(() => {
    if (!isAddOpen) return
    accountsApi.getProviders(providerQuery)
      .then(setProviders)
      .catch(() => setActionMessage('Unable to load available providers.'))
  }, [isAddOpen, providerQuery])

  const summary = data?.summary
  const visibleAccounts = data?.accounts.filter((account) => filter === 'ALL' || account.status === filter) ?? []

  const toggleProvider = (providerId: string) => {
    setSelectedProviderIds((current) => current.includes(providerId)
      ? current.filter((id) => id !== providerId)
      : [...current, providerId])
  }

  const addProviders = async () => {
    if (selectedProviderIds.length === 0) return
    setIsAdding(true)
    setActionMessage(null)
    try {
      setData(await accountsApi.addAccounts({ providerIds: selectedProviderIds }))
      setIsSubmitted(false)
      setSelectedProviderIds([])
      setIsAddOpen(false)
      setActionMessage('Providers added successfully.')
    } catch (reason: unknown) {
      setActionMessage(reason instanceof ApiRequestError ? reason.message : 'Unable to add providers.')
    } finally {
      setIsAdding(false)
    }
  }

  const removeProvider = async (providerId: string, providerName: string) => {
    if (!window.confirm(`Remove ${providerName} from your accounts?`)) return
    setRemovingProviderId(providerId)
    setActionMessage(null)
    try {
      setData(await accountsApi.removeAccount(providerId))
      setIsSubmitted(false)
      setActionMessage(`${providerName} removed.`)
    } catch (reason: unknown) {
      setActionMessage(reason instanceof ApiRequestError ? reason.message : 'Unable to remove provider.')
    } finally {
      setRemovingProviderId(null)
    }
  }

  const openStatementDialog = (providerId: string) => {
    const account = data?.accounts.find((item) => item.providerId === providerId)
    setStatementAccountId(providerId)
    setFileName(account?.statement?.fileName ?? '')
    setStatementDate(account?.statement?.statementDate ?? '')
    setStatementError(null)
    setActionMessage(null)
  }

  const saveStatement = async () => {
    if (!statementAccountId) return
    if (!fileName.trim()) {
      setStatementError('Enter a statement filename.')
      return
    }
    if (!statementDate) {
      setStatementError('Select a statement date.')
      return
    }
    setIsSavingStatement(true)
    setStatementError(null)
    setActionMessage(null)
    try {
      setData(await accountsApi.replaceStatement(statementAccountId, { fileName: fileName.trim(), statementDate }))
      setIsSubmitted(false)
      setStatementAccountId(null)
      setActionMessage('Statement saved successfully.')
    } catch (reason: unknown) {
      setStatementError(reason instanceof ApiRequestError ? reason.message : 'Unable to save statement.')
    } finally {
      setIsSavingStatement(false)
    }
  }

  const submitAccounts = async () => {
    if (!summary?.canSubmit) {
      setActionMessage('Add a current statement for every provider before submitting.')
      return
    }
    setIsSubmitting(true)
    setActionMessage(null)
    try {
      const response = await accountsApi.submit()
      setIsSubmitted(true)
      setActionMessage(response.message)
    } catch (reason: unknown) {
      if (reason instanceof ApiRequestError && reason.details.issues.length > 0) {
        const issues = reason.details.issues.map((issue) => `${issue.providerName} (${issue.status})`).join(', ')
        setActionMessage(`${reason.message} Still needed: ${issues}.`)
      } else {
        setActionMessage(reason instanceof ApiRequestError ? reason.message : 'Unable to submit accounts.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Client workspace</p>
          <h1>Connect your accounts</h1>
          <p className="lede">
            Bring your providers together so your adviser has everything needed to get started.
          </p>
        </div>
        <div className="header-mark" aria-hidden="true">CA</div>
      </header>

      <section className="readiness-panel" aria-labelledby="readiness-title">
        <div>
          <p className="eyebrow">Submission readiness</p>
          <h2 id="readiness-title">
            {summary?.canSubmit ? 'Everything is ready to submit.' : 'Your account picture is taking shape.'}
          </h2>
          <p>{summary?.canSubmit ? 'Your adviser has everything needed to get started.' : 'Current statements will unlock your submission.'}</p>
        </div>
        <div className="readiness-count" aria-label="Account readiness">
          <strong>{summary?.readyCount ?? 0}</strong><span>of {summary?.total ?? 0} ready</span>
        </div>
      </section>

      <section className="workspace-section" aria-labelledby="accounts-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your providers</p>
            <h2 id="accounts-title">Accounts to complete</h2>
          </div>
          <div className="heading-actions">
            <button className="button" type="button" disabled={!summary?.canSubmit || isSubmitting || isSubmitted} onClick={submitAccounts}>{isSubmitting ? 'Submitting...' : isSubmitted ? 'Submitted' : 'Submit accounts'}</button>
            <button className="button button-primary" type="button" onClick={() => setIsAddOpen(true)}>Add provider</button>
          </div>
        </div>
        <label className="filter-label">
          Show
          <select value={filter} onChange={(event) => setFilter(event.target.value as StatusFilter)}>
            <option value="ALL">All status</option>
            <option value="MISSING">Missing</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="OUTDATED">Outdated</option>
          </select>
        </label>
        {error && <p className="feedback feedback-error" role="alert">{error}</p>}
        {actionMessage && <p className="feedback" role="status">{actionMessage}</p>}
        {!data && !error && <p className="loading" role="status">Loading your accounts...</p>}
        {data && data.accounts.length === 0 && <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">+</span>
          <h3>Your accounts will appear here</h3>
          <p>Add the providers where you hold money to begin collecting statements.</p>
        </div>}
        {data && data.accounts.length > 0 && visibleAccounts.length === 0 && <p className="empty-filter" role="status">No accounts match this status.</p>}
        {data && visibleAccounts.length > 0 && <div className="account-list">
          {visibleAccounts.map((account) => <article className="account-row" key={account.providerId}>
            <div><h3>{account.providerName}</h3><p>{account.statement ? `${account.statement.fileName} · ${account.statement.statementDate}` : 'No statement uploaded'}</p></div>
            <div className="row-actions">
              <span className={`status status-${account.status.toLowerCase()}`}>{account.status}</span>
              <button className="text-button statement-button" type="button" onClick={() => openStatementDialog(account.providerId)}>{account.statement ? 'Replace statement' : 'Upload statement'}</button>
              <button className="text-button" type="button" disabled={removingProviderId === account.providerId} onClick={() => removeProvider(account.providerId, account.providerName)}>{removingProviderId === account.providerId ? 'Removing...' : 'Remove'}</button>
            </div>
          </article>)}
        </div>}
      </section>

      {isAddOpen && <div className="dialog-backdrop" role="presentation">
        <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="add-provider-title">
          <div className="dialog-heading">
            <div><p className="eyebrow">Provider catalogue</p><h2 id="add-provider-title">Add your providers</h2></div>
            <button className="icon-button" type="button" aria-label="Close add provider dialog" onClick={() => setIsAddOpen(false)}>×</button>
          </div>
          <label className="search-label" htmlFor="provider-search">Search providers</label>
          <input id="provider-search" value={providerQuery} onChange={(event) => setProviderQuery(event.target.value)} placeholder="Search by name" />
          <div className="provider-options">
            {providers.map((provider) => <label className="provider-option" key={provider.id}>
              <input type="checkbox" checked={selectedProviderIds.includes(provider.id)} onChange={() => toggleProvider(provider.id)} />
              <span>{provider.name}</span>
            </label>)}
            {providers.length === 0 && <p className="empty-filter">No available providers found.</p>}
          </div>
          <div className="dialog-actions">
            <button className="button" type="button" onClick={() => setIsAddOpen(false)}>Cancel</button>
            <button className="button button-primary" type="button" disabled={isAdding || selectedProviderIds.length === 0} onClick={addProviders}>{isAdding ? 'Adding...' : 'Add selected'}</button>
          </div>
        </section>
      </div>}

      {statementAccountId && <div className="dialog-backdrop" role="presentation">
        <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="statement-title">
          <div className="dialog-heading">
            <div><p className="eyebrow">Statement details</p><h2 id="statement-title">Upload a statement</h2></div>
            <button className="icon-button" type="button" aria-label="Close statement dialog" onClick={() => setStatementAccountId(null)}>×</button>
          </div>
          <label className="search-label" htmlFor="statement-file">Filename</label>
          <input id="statement-file" value={fileName} onChange={(event) => setFileName(event.target.value)} placeholder="statement.pdf" />
          <label className="search-label" htmlFor="statement-date">Statement date</label>
          <input id="statement-date" type="date" value={statementDate} onChange={(event) => setStatementDate(event.target.value)} />
          {statementError && <p className="dialog-error" role="alert">{statementError}</p>}
          <div className="dialog-actions">
            <button className="button" type="button" onClick={() => setStatementAccountId(null)}>Cancel</button>
            <button className="button button-primary" type="button" disabled={isSavingStatement} onClick={saveStatement}>{isSavingStatement ? 'Saving...' : 'Save statement'}</button>
          </div>
        </section>
      </div>}

      <footer className="page-footer">
        <span>Private client workspace</span>
        <span>All changes are saved for this session</span>
      </footer>
    </main>
  )
}

export default App
