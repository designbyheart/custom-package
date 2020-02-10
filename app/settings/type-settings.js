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
  walletBackup: {
    status: string,
    encryptionKey: string,
  },
  walletBalance: string,
  lastSuccessfulBackup: string,
  lastSuccessfulCloudBackup?: string,
  cloudBackupStatus?: string,
  autoCloudBackupEnabled?: boolean,
  connectionsUpdated?: boolean,
  isAutoBackupEnabled?: boolean,
  hasVerifiedRecoveryPhrase?: boolean,
  cloudBackupError?: string | null,
  hasViewedWalletError?: boolean,
  selectUserAvatar: () => void,
  setAutoCloudBackupEnabled: (switchState: boolean) => any,
  generateRecoveryPhrase: () => any | null,
  addPendingRedirection: (
    pendingRedirection: Array<?PendingRedirection>
  ) => void | null,
  connectionHistoryBackedUp: () => any,
  cloudBackupFailure: (error: string | null) => void,
  cloudBackupStart: () => void,
  viewedWalletError: (error: boolean) => void,
} & ReactNavigation

export type SettingsState = {
  walletBackupModalVisible: boolean,
  disableTouchIdSwitch: boolean,
}
