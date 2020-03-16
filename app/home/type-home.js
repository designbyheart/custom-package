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
  unSeenMessagesCount: number,
  environmentName: string,
  newBannerConnections: Array<Object>,
  recentConnections: Array<Object>,
  hasNoConnection: boolean,
  mappedDidToLogoAndName: Object,
} & ReactNavigation
