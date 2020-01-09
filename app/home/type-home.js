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

export type HomeProps = {
  connections: ConnectionStore,
  unSeenMessages: {
    [string]: [string],
  },
  environmentName: string,
  history: ConnectionHistoryStore,
  onNewConnectionSeen: (senderDid: string) => void,
  shouldShowNotification: boolean,
  notificationCardSwipedUp: Function,
  notificationCardPressed: Function,
} & ReactNavigation
