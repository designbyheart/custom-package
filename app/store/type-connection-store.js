// @flow
import type { InvitationPayload } from '../invitation/type-invitation'

export type Connection = {
  identifier: string,
  logoUrl: string,
  senderDID: string,
  senderEndpoint: string,
  size: number,
  senderName?: string,
  myPairwiseDid: string,
  myPairwiseVerKey: string,
  myPairwiseAgentDid: string,
  myPairwiseAgentVerKey: string,
  myPairwisePeerVerKey: string,
}

export const DELETE_CONNECTION = 'DELETE_CONNECTION'

export type DeleteConnectionEventAction = {
  type: typeof DELETE_CONNECTION,
  senderDID: string,
}

export type Connections = { [senderDID: string]: Connection }

export type ConnectionStore = {
  // TODO:PS Add specific keys in connection store
  [string]: any,
  data: ?Connections,
}

export const DELETE_CONNECTION_SUCCESS = 'DELETE_CONNECTION_SUCCESS'

export const DELETE_CONNECTION_FAILURE = 'DELETE_CONNECTION_FAILURE'

export type DeleteConnectionSuccessEventAction = {
  type: typeof DELETE_CONNECTION_SUCCESS,
  connection: Connection,
}

export type DeleteConnectionFailureEventAction = {
  type: typeof DELETE_CONNECTION_FAILURE,
  connection: Connection,
}

export const NEW_CONNECTION = 'NEW_CONNECTION'

export type NewConnectionAction = {
  type: typeof NEW_CONNECTION,
  connection: {
    identifier: string,
    logoUrl?: ?string,
  } & InvitationPayload,
}

export const STORAGE_KEY_THEMES = 'STORAGE_KEY_THEMES'

export type ConnectionThemes = {
  [string]: {
    primary: string,
    secondary: string,
  },
}

export const HYDRATE_CONNECTION_THEMES = 'HYDRATE_CONNECTION_THEMES'
