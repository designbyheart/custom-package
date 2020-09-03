import { boolean } from 'yargs'

// @flow
export type PushNotificationPermissionProps = {
  isAllowedPushNotification: boolean,
  allowPushNotifications: Function,
}

export type PushNotificationPermissionState = {
  appState: Object,
}
