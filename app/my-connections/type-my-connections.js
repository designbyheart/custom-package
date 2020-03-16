// @flow
import type { ReactNavigation } from '../common/type-common'
import type {
  ConnectionStore,
  Connection,
} from '../store/type-connection-store'
import type { ConnectionHistoryStore } from '../connection-history/type-connection-history'

export type NewConnectionInstructionsProps = {
  usingProductionNetwork: boolean,
}

export type Item = {
  index: Number,
  date: string,
  status: string,
  questionTitle: string,
  type: string,
  newBadge: boolean,
  senderDID: string,
  senderName: string,
  logoUrl: string,
  credentialName: string,
}

export type MyConnectionsState = {
  appState: ?string,
}

// TODO: Remove this afterwrds, the lint is failing for some reason.
export type HomeState = {
  appState: ?string,
}

export type MyConnectionsProps = {
  unSeenMessagesCount: number,
  environmentName: string,
  onNewConnectionSeen: (senderDid: string) => void,
  connections: Array<Item>,
  hasNoConnection: boolean,
} & ReactNavigation

// TODO: Remove this afterwrds, the lint is failing for some reason.
export type HomeProps = {
  unSeenMessagesCount: number,
  environmentName: string,
  onNewConnectionSeen: (senderDid: string) => void,
  connections: Array<Item>,
  hasNoConnection: boolean,
} & ReactNavigation
