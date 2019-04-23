// @flow
export type ConnectionCardProps = {
  onPress: Function,
  keyExtractor: Function,
  identifier: string,
  image: string,
  status: string,
  senderName: string,
  date: string,
  type: string,
  credentialName: string,
  showBadge: boolean,
}
