import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const accountsResponse = {
  accounts: [
    { providerId: 'hsbc', providerName: 'HSBC', statement: null, status: 'MISSING' },
  ],
  summary: { total: 1, readyCount: 0, needsAttention: 1, canSubmit: false },
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => accountsResponse,
    }))
  })

  it('shows readiness after the account snapshot loads', async () => {
    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading your accounts...')
    await waitFor(() => expect(screen.getByText('0')).toBeInTheDocument())
    expect(screen.getByText('of 1 ready')).toBeInTheDocument()
    expect(screen.getByText('HSBC')).toBeInTheDocument()
  })

  it('filters accounts by status', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('HSBC')).toBeInTheDocument())

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'UPLOADED' } })

    expect(screen.getByText('No accounts match this status.')).toBeInTheDocument()
    expect(screen.queryByText('HSBC')).not.toBeInTheDocument()
  })

  it('adds multiple selected providers', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => accountsResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => [
        { id: 'monzo', name: 'Monzo' },
        { id: 'nutmeg', name: 'Nutmeg' },
      ] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        accounts: [
          ...accountsResponse.accounts,
          { providerId: 'monzo', providerName: 'Monzo', statement: null, status: 'MISSING' },
          { providerId: 'nutmeg', providerName: 'Nutmeg', statement: null, status: 'MISSING' },
        ],
        summary: { total: 3, readyCount: 0, needsAttention: 3, canSubmit: false },
      }) })
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    await waitFor(() => expect(screen.getByText('HSBC')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Add provider' }))
    await waitFor(() => expect(screen.getByText('Monzo')).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText('Monzo'))
    fireEvent.click(screen.getByLabelText('Nutmeg'))
    fireEvent.click(screen.getByRole('button', { name: 'Add selected' }))

    await waitFor(() => expect(screen.getByText('Providers added successfully.')).toBeInTheDocument())
    expect(screen.getByText('Monzo')).toBeInTheDocument()
    expect(screen.getByText('Nutmeg')).toBeInTheDocument()
  })

  it('removes a provider after confirmation', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => accountsResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        accounts: [], summary: { total: 0, readyCount: 0, needsAttention: 0, canSubmit: false },
      }) })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    render(<App />)
    await waitFor(() => expect(screen.getByText('HSBC')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

    await waitFor(() => expect(screen.getByText('HSBC removed.')).toBeInTheDocument())
    expect(screen.getByText('Your accounts will appear here')).toBeInTheDocument()
  })

  it('uploads a statement and refreshes the account row', async () => {
    const uploaded = {
      accounts: [{ providerId: 'hsbc', providerName: 'HSBC', statement: {
        fileName: 'hsbc-august.pdf', statementDate: '2026-08-01',
      }, status: 'UPLOADED' }],
      summary: { total: 1, readyCount: 1, needsAttention: 0, canSubmit: true },
    }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => accountsResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => uploaded })
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    await waitFor(() => expect(screen.getByText('HSBC')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Upload statement' }))
    fireEvent.change(screen.getByLabelText('Filename'), { target: { value: 'hsbc-august.pdf' } })
    fireEvent.change(screen.getByLabelText('Statement date'), { target: { value: '2026-08-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save statement' }))

    await waitFor(() => expect(screen.getByText('Statement saved successfully.')).toBeInTheDocument())
    expect(screen.getByText('hsbc-august.pdf · 2026-08-01')).toBeInTheDocument()
  })

  it('disables submit while an account needs attention', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('HSBC')).toBeInTheDocument())

    expect(screen.getByRole('button', { name: 'Submit accounts' })).toBeDisabled()
  })

  it('submits when every account is current', async () => {
    const readyResponse = {
      accounts: [{ providerId: 'hsbc', providerName: 'HSBC', statement: {
        fileName: 'hsbc.pdf', statementDate: '2026-08-01',
      }, status: 'UPLOADED' }],
      summary: { total: 1, readyCount: 1, needsAttention: 0, canSubmit: true },
    }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => readyResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Accounts submitted successfully.' }) })
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit accounts' })).toBeEnabled())

    fireEvent.click(screen.getByRole('button', { name: 'Submit accounts' }))

    await waitFor(() => expect(screen.getByText('Accounts submitted successfully.')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Submitted' })).toBeDisabled()
  })

  it('re-enables the submission state when a provider is added after submission', async () => {
    const readyResponse = {
      accounts: [{ providerId: 'hsbc', providerName: 'HSBC', statement: {
        fileName: 'hsbc.pdf', statementDate: '2026-08-01',
      }, status: 'UPLOADED' }],
      summary: { total: 1, readyCount: 1, needsAttention: 0, canSubmit: true },
    }
    const incompleteResponse = {
      accounts: [
        ...readyResponse.accounts,
        { providerId: 'monzo', providerName: 'Monzo', statement: null, status: 'MISSING' },
      ],
      summary: { total: 2, readyCount: 1, needsAttention: 1, canSubmit: false },
    }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => readyResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Accounts submitted successfully.' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'monzo', name: 'Monzo' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => incompleteResponse })
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit accounts' })).toBeEnabled())

    fireEvent.click(screen.getByRole('button', { name: 'Submit accounts' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submitted' })).toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: 'Add provider' }))
    await waitFor(() => expect(screen.getByLabelText('Monzo')).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText('Monzo'))
    fireEvent.click(screen.getByRole('button', { name: 'Add selected' }))

    await waitFor(() => expect(screen.getByText('Providers added successfully.')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Submit accounts' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Submitted' })).not.toBeInTheDocument()
  })

  it('shows statement validation feedback in the upload dialog', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('HSBC')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Upload statement' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save statement' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a statement filename.')
    fireEvent.change(screen.getByLabelText('Filename'), { target: { value: 'hsbc.pdf' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save statement' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Select a statement date.')
  })

  it('shows an account loading error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')))
    render(<App />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to load your accounts.'))
  })
})
