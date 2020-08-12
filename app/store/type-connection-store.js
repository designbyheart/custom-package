// @flow
import type {
  AriesOutOfBandInvite,
  InvitationPayload,
} from '../invitation/type-invitation'
import type { CustomError } from '../common/type-common'

export const UPDATE_CONNECTION_THEME = 'UPDATE_CONNECTION_THEME'
export const UPDATE_STATUS_BAR_THEME = 'UPDATE_STATUS_BAR_THEME'
export const NEW_CONNECTION_FAIL = 'NEW_CONNECTION_FAIL'
export const HYDRATE_CONNECTIONS = 'HYDRATE_CONNECTIONS'
export const UPDATE_SERIALIZE_CONNECTION_FAIL =
  'UPDATE_SERIALIZE_CONNECTION_FAIL'
export const UPDATE_CONNECTION_SERIALIZED_STATE =
  'UPDATE_CONNECTION_SERIALIZED_STATE'

export type MyPairwiseInfo = {
  myPairwiseDid: string,
  myPairwiseVerKey: string,
  myPairwiseAgentDid: string,
  myPairwiseAgentVerKey: string,
  myPairwisePeerVerKey: string,
  senderDID: string,
}

export type Connection = {
  identifier: string,
  logoUrl: string,
  senderEndpoint: string,
  size?: number,
  senderName?: string,
  vcxSerializedConnection: string,
  publicDID: ?string,
  timestamp?: string,
} & MyPairwiseInfo

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
  filteredConnections: Connections,
}

export type DeleteConnectionFailureEventAction = {
  type: typeof DELETE_CONNECTION_FAILURE,
  connection: Connection,
  error: CustomError,
}

export const NEW_CONNECTION = 'NEW_CONNECTION'

export type NewConnectionAction = {
  type: typeof NEW_CONNECTION,
  connection: {
    identifier: string,
    logoUrl?: ?string,
  } & InvitationPayload,
}

export type UpdateSerializeConnectionFailAction = {
  type: typeof UPDATE_SERIALIZE_CONNECTION_FAIL,
  error: CustomError,
  identifier: string,
}

export type UpdateConnectionSerializedStateAction = {
  type: typeof UPDATE_CONNECTION_SERIALIZED_STATE,
  identifier: string,
  vcxSerializedConnection: string,
}

export const STORAGE_KEY_THEMES = 'STORAGE_KEY_THEMES'

export type ConnectionThemes = {
  [string]: {
    primary: string,
    secondary: string,
  },
}

export const HYDRATE_CONNECTION_THEMES = 'HYDRATE_CONNECTION_THEMES'

export const SEND_CONNECTION_REDIRECT: 'SEND_CONNECTION_REDIRECT' =
  'SEND_CONNECTION_REDIRECT'
export type SendConnectionRedirectAction = {
  type: typeof SEND_CONNECTION_REDIRECT,
  qrCodeInvitationPayload: InvitationPayload,
  existingConnectionDetails: {
    senderDID: string,
    identifier: string,
  },
}

export const SEND_REDIRECT_SUCCESS = 'SEND_REDIRECT_SUCCESS'

export const SEND_CONNECTION_REUSE: 'SEND_CONNECTION_REUSE' =
  'SEND_CONNECTION_REUSE'
export type SendConnectionReuseAction = {
  type: typeof SEND_CONNECTION_REUSE,
  invite: AriesOutOfBandInvite,
  existingConnectionDetails: {
    senderDID: string,
  },
}

export const SEND_REUSE_SUCCESS = 'SEND_REUSE_SUCCESS'

export const UPDATE_CONNECTION_FAIL: 'UPDATE_CONNECTION_FAIL' =
  'UPDATE_CONNECTION_FAIL'

export const connectionFail = (error: CustomError, senderDID: string) => ({
  type: UPDATE_CONNECTION_FAIL,
  error,
  senderDID,
})

export const ERROR_CONNECTION = (message: string) => ({
  code: 'CONNECTION-001',
  message: `Error while establishing a connection: ${message}`,
})
