// @flow
import type { ReactNavigation } from '../common/type-common'
import type {
  ConnectionStore,
  Connection,
} from '../store/type-connection-store'

export type NewConnectionInstructionsProps = {
  usingProductionNetwork: boolean,
}

export type ConnectionCardProps = {
  onPress: Function,
  onNewConnectionSeen: Function,
  identifier: string,
  image: string,
  status: string,
  senderName: string,
  date: string,
  type: string,
  credentialName: string,
  newBadge: boolean,
  senderDID: string,
} & ReactNavigation

export type BubbleState = {
  failed: boolean,
}

export type BubblesProps = {
  connections: Array<Connection>,
  height: number,
  unSeenMessages: {
    [string]: [string],
  },
} & ReactNavigation

export type HomeProps = {
  connections: ConnectionStore,
  unSeenMessages: {
    [string]: [string],
  },
} & ReactNavigation

export type HomeState = {
  // Don't have react-native Animated API type definition
  scrollY: any,
}

export type ConnectionBubblesState = {
  disableTaps: boolean,
  interactionsDone: boolean,
}
