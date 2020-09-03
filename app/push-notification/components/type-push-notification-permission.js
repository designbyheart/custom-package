// @flow
import type { ReactNavigation } from '../../common/type-common'

export type PushNotificationPermissionProps = {
  isAllowedPushNotification: boolean,
  allowPushNotifications: Function,
} & ReactNavigation

export type PushNotificationPermissionState = {
  appState: Object,
}
