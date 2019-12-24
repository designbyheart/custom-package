// @flow
export type NotificationCardProps = {
  image: string,
  status: any,
  senderName: any,
  credentialName: any,
  question: any,
  senderDID: string,
  notificationCardSwipedUp: Function,
  onNotificationCardPress: Function,
}

export type NotificationCardState = {
  translateY: Object,
}
