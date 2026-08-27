import type {
  AccountsResponse,
  AddAccountsRequest,
  ApiError,
  Provider,
  StatementRequest,
  SubmitResponse,
} from './types'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api').replace(/\/$/, '')

export class ApiRequestError extends Error {
  readonly details: ApiError

  constructor(details: ApiError) {
    super(details.message)
    this.name = 'ApiRequestError'
    this.details = details
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as ApiError | null
    throw new ApiRequestError(details ?? {
      code: 'REQUEST_FAILED',
      message: `Request failed with status ${response.status}.`,
      issues: [],
    })
  }

  return response.json() as Promise<T>
}

export const accountsApi = {
  getAccounts: () => request<AccountsResponse>('/accounts'),
  getProviders: (query: string) => request<Provider[]>(`/providers?query=${encodeURIComponent(query)}`),
  addAccounts: (body: AddAccountsRequest) => request<AccountsResponse>('/accounts', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  removeAccount: (providerId: string) => request<AccountsResponse>(`/accounts/${encodeURIComponent(providerId)}`, {
    method: 'DELETE',
  }),
  replaceStatement: (providerId: string, body: StatementRequest) => request<AccountsResponse>(
    `/accounts/${encodeURIComponent(providerId)}/statement`,
    { method: 'PUT', body: JSON.stringify(body) },
  ),
  submit: () => request<SubmitResponse>('/submit', { method: 'POST' }),
}
