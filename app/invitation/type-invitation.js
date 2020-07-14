// @flow
import type {
  ResponseTypes,
  RequestDetailTextPropsText,
  RequestDetailAvatarProps,
} from '../components/request/type-request'
import type {
  CustomError,
  ReactNavigation,
  InitialTestAction,
  ResetAction,
} from '../common/type-common'
import type {
  InvitationSenderAgencyDetail,
  AgentKeyDelegationProof,
  InvitationSenderDetail,
} from '../sms-pending-invitation/type-sms-pending-invitation'
import type {
  NavigationScreenProp,
  NavigationLeafRoute,
} from '@react-navigation/native'

export type InvitationPayload = {
  senderEndpoint: string,
  requestId: string,
  senderAgentKeyDelegationProof: AgentKeyDelegationProof,
  senderName: string,
  senderDID: string,
  senderLogoUrl?: ?string,
  senderVerificationKey: string,
  targetName: string,
  senderDetail: InvitationSenderDetail,
  senderAgencyDetail: InvitationSenderAgencyDetail,
  version?: string,
  original?: string,
}

export type Invitation = {
  +payload: ?InvitationPayload,
  +status: ResponseTypes,
  +isFetching: boolean,
  +error: ?CustomError,
}

export type InvitationStore = {
  +[string]: Invitation,
}

export const INVITATION_RECEIVED: 'INVITATION_RECEIVED' = 'INVITATION_RECEIVED'

export type InvitationReceivedActionData = {
  payload: InvitationPayload,
}

export type InvitationReceivedAction = {
  type: typeof INVITATION_RECEIVED,
  data: InvitationReceivedActionData,
}

export const INVITATION_RESPONSE_SEND: 'INVITATION_RESPONSE_SEND' =
  'INVITATION_RESPONSE_SEND'

export type InvitationResponseSendData = {
  response: ResponseTypes,
  senderDID: string,
}

export type InvitationResponseSendAction = {
  type: typeof INVITATION_RESPONSE_SEND,
  data: InvitationResponseSendData,
}

export const INVITATION_RESPONSE_SUCCESS: 'INVITATION_RESPONSE_SUCCESS' =
  'INVITATION_RESPONSE_SUCCESS'

export type InvitationSuccessAction = {
  type: typeof INVITATION_RESPONSE_SUCCESS,
  senderDID: string,
}

export const INVITATION_RESPONSE_FAIL: 'INVITATION_RESPONSE_FAIL' =
  'INVITATION_RESPONSE_FAIL'

export type InvitationFailAction = {
  type: typeof INVITATION_RESPONSE_FAIL,
  error: CustomError,
  senderDID: string,
}

export const INVITATION_REJECTED: 'INVITATION_REJECTED' = 'INVITATION_REJECTED'

export type InvitationRejectedAction = {
  type: typeof INVITATION_REJECTED,
  senderDID: string,
}

export type InvitationAction =
  | InvitationReceivedAction
  | InvitationResponseSendAction
  | InvitationFailAction
  | InvitationSuccessAction
  | InvitationRejectedAction
  | InitialTestAction
  | ResetAction

export type InvitationNavigation = {
  navigation: NavigationScreenProp<{|
    ...NavigationLeafRoute,
  |}>,
  route: {
    params: {|
      senderDID: string,
      token: ?string,
    |},
  },
}
export type InvitationProps = {
  invitation: ?Invitation,
  sendInvitationResponse: (data: InvitationResponseSendData) => void,
  invitationRejected: (senderDID: string) => void,
  smsPendingInvitationSeen: (smsToken: ?string) => void,
  showErrorAlerts: boolean,
  smsToken: ?string,
  isSmsInvitationNotSeen: boolean,
} & InvitationNavigation

export const ERROR_INVITATION_VCX_INIT = {
  code: 'INVITATION-001',
  message: 'Could not initialize vcx while creating a connection',
}

export const ERROR_INVITATION_CONNECT = (message: string) => ({
  code: 'INVITATION-002',
  message: `Error while establishing a connection ${message}`,
})

export const ERROR_INVITATION_SERIALIZE_UPDATE = (message: string) => ({
  code: 'INVITATION-003',
  message: `Error while getting serialized connection for aries: ${message}`,
})

export const CONNECTION_INVITE_TYPES = {
  ARIES_V1_QR: 'ARIES_V1_QR',
}

export type ConnectionInviteTypes = $Keys<typeof CONNECTION_INVITE_TYPES>

export type AriesConnectionInviteType =
  'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation'

export type AriesConnectionInvitePayload = {
  '@id': string,
  '@type': AriesConnectionInviteType,
  label?: string,
  profileUrl?: string,
  recipientKeys: Array<string>,
  routingKeys?: ?Array<string>,
  serviceEndpoint: string,
}

export type AriesConnectionInvite = {
  payload: AriesConnectionInvitePayload,
  type: ConnectionInviteTypes,
  // this version is specific to CM's own data
  version: '1.0',
  // this would contain data that would be as it is that connect me receives
  // for example: this would have original QR code string
  original: string,
}
