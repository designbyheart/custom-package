// @flow

import * as React from 'react'
import type { LedgerFees } from '../../type-ledger-store'
import type { Dispatch } from '../../../common/type-common'
import type { WalletBalance } from '../../../wallet/type-wallet'

export type LedgerFeesProps = {
  transferAmount: string,
  ledgerFees: LedgerFees,
  walletBalance: WalletBalance,
  renderPhases: LedgerFeesRenderPhases,
  onStateChange: (state: LedgerFeesStateEnum, data?: LedgerFeesData) => void,
} & Dispatch

type ReactComponent = React.Node

export type LedgerFeesRenderPhases = {
  IN_PROGRESS: (data?: any) => ReactComponent,
  ERROR: (data?: any) => ReactComponent,
  ZERO_FEES: (data?: LedgerFeesData) => ReactComponent,
  TRANSFER_EQUAL_TO_BALANCE: (data?: LedgerFeesData) => ReactComponent,
  TRANSFER_POSSIBLE_WITH_FEES: (data?: LedgerFeesData) => ReactComponent,
  TRANSFER_NOT_POSSIBLE_WITH_FEES: (data?: LedgerFeesData) => ReactComponent,
}

export type LedgerFeesStateEnum =
  | 'IN_PROGRESS'
  | 'ERROR'
  | 'ZERO_FEES'
  | 'TRANSFER_EQUAL_TO_BALANCE'
  | 'TRANSFER_POSSIBLE_WITH_FEES'
  | 'TRANSFER_NOT_POSSIBLE_WITH_FEES'

export type LedgerFeesData = {
  fees: string,
  total: string,
  currentTokenBalance: string,
}
