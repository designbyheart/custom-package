// @flow
import type { ReactNavigation } from '../common/type-common'
import type { PendingRedirection } from '../lock/type-lock'

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
  generateBackupFile: () => any | null,
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
} & ReactNavigation

export type SettingsState = {
  walletBackupModalVisible: boolean,
  disableTouchIdSwitch: boolean,
}
