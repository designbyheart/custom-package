// @flow
import type { ReactNavigation } from '../common/type-common'
import type {
  ConnectionStore,
  Connection,
} from '../store/type-connection-store'
import type { PendingRedirection } from '../lock/type-lock'
import type { ConnectionHistoryStore } from '../connection-history/type-connection-history'

export type SettingsProps = {
  touchIdActive: boolean,
  currentScreen: string,
  timeStamp: number,
  selectUserAvatar: () => void,
  walletBackup: {
    status: string,
    encryptionKey: string,
  },
  walletBalance: string,
  lastSuccessfulBackup: string,
  setAutoCloudBackupEnabled: (switchState: boolean) => any,
  generateRecoveryPhrase: () => any | null,
  lastSuccessfulCloudBackup?: string,
  cloudBackupStatus?: string,
  autoCloudBackupEnabled?: boolean,
  connectionsUpdated?: boolean,
  addPendingRedirection: (
    pendingRedirection: Array<?PendingRedirection>
  ) => void | null,
  connectionHistoryBackedUp: () => any,
  isAutoBackupEnabled?: boolean,
  hasVerifiedRecoveryPhrase?: boolean,
  cloudBackupFailure: (error: string | null) => void,
  cloudBackupError?: string | null,
  hasViewedWalletError?: boolean,
  cloudBackupStart: () => void,
  viewedWalletError: (error: boolean) => void,
  shouldShowNotification: boolean,
  notificationCardSwipedUp: Function,
  connections: ConnectionStore,
  history: ConnectionHistoryStore,
} & ReactNavigation

export type SettingsState = {
  walletBackupModalVisible: boolean,
  disableTouchIdSwitch: boolean,
}
