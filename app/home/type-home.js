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

export type HomeState = {
  appState: ?string,
}

export type HomeProps = {
  unSeenMessagesCount: number,
  environmentName: string,
  onNewConnectionSeen: (senderDid: string) => void,
  connections: Array<Item>,
  hasNoConnection: boolean,
} & ReactNavigation
