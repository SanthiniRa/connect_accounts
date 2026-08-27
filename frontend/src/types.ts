export type StatementStatus = 'MISSING' | 'UPLOADED' | 'OUTDATED'

export type StatusFilter = 'ALL' | StatementStatus

export interface Provider {
  id: string
  name: string
}

export interface Statement {
  fileName: string
  statementDate: string
}

export interface AccountView {
  providerId: string
  providerName: string
  statement: Statement | null
  status: StatementStatus
}

export interface ReadinessSummary {
  total: number
  readyCount: number
  needsAttention: number
  canSubmit: boolean
}

export interface AccountsResponse {
  accounts: AccountView[]
  summary: ReadinessSummary
}

export interface AddAccountsRequest {
  providerIds: string[]
}

export interface StatementRequest {
  fileName: string
  statementDate: string
}

export interface SubmissionIssue {
  providerId: string
  providerName: string
  status: StatementStatus
}

export interface ApiError {
  code: string
  message: string
  issues: SubmissionIssue[]
}

export interface SubmitResponse {
  message: string
}
