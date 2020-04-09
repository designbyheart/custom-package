// @flow
import type { ReactNavigation } from '../common/type-common'
import type {
  ConnectionStore,
  Connection,
} from '../store/type-connection-store'
import type { ConnectionHistoryStore } from '../connection-history/type-connection-history'
import type { MessageDownloadStatus } from '../store/type-config-store'

export type NewConnectionInstructionsProps = {
  usingProductionNetwork: boolean,
}

export type HomeProps = {
  environmentName: string,
  newBannerConnections: Array<Object>,
  recentConnections: Array<Object>,
  hasNoConnection: boolean,
  mappedDidToLogoAndName: Object,
  getUnacknowledgedMessages: () => void,
  messageDownloadStatus: MessageDownloadStatus,
  snackError: ?string,
} & ReactNavigation
