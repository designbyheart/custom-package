// @flow
export type ConnectionCardProps = {
  onPress: Function,
  image: string,
  status: string,
  senderName: string,
  date: string,
  type: string,
  credentialName: string,
  question: string,
  newBadge: boolean,
  onNewConnectionSeen: Function,
  senderDID: string,
}
